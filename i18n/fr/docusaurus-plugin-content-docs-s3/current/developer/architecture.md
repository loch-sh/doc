---
sidebar_position: 1
title: Architecture
description: Organisation du code de Loch S3 et stockage des buckets et objets sur disque.
---

# Architecture

Loch S3 est écrit en Rust sur `hyper` 1 brut et `tokio`, sans framework web. Les requêtes sont routées à la main dans `src/router.rs`.

## Parcours d'une requête

1. `router.rs` analyse le chemin (`/{bucket}/{key}`) et la sous-ressource (`?policy`, `?uploads`…), et refuse les clés non canoniques.
2. `auth.rs` vérifie la signature SigV4 et attache le contrôle du corps (hash signé ou signatures de chunks).
3. Le routeur autorise : root, propriétaire du bucket, puis politique de bucket (`policy.rs`) et ACL.
4. Un handler de `src/handlers/` exécute l'opération via `src/storage/`.
5. Les en-têtes CORS sont ajoutés quand le bucket a une règle qui correspond (`cors.rs`).

## Organisation des sources

| Chemin | Rôle |
|---|---|
| `src/main.rs` | Variables d'environnement, démarrage, tâches de nettoyage |
| `src/lib.rs` | `ServerConfig`, boucle de connexions, réglages HTTP/1 et HTTP/2 |
| `src/router.rs` | Routage, autorisation, ACL, preflight CORS |
| `src/auth.rs` | SigV4 en en-têtes et URL présignées, contrôle des corps |
| `src/users.rs` | Fichier des utilisateurs et stockage en mémoire |
| `src/policy.rs` | Modèle et évaluation des politiques de bucket |
| `src/encryption.rs` | SSE-S3 et SSE-C, AES-256-GCM par blocs de 1 Mio, HKDF-SHA256 |
| `src/quota/` | Compteur de quota, réservations, recomptage en arrière-plan |
| `src/handlers/` | Un fichier par domaine : bucket, object, multipart, versioning, policy, cors, encryption, users, health |
| `src/storage/` | Couche système de fichiers pour les mêmes domaines |
| `src/bin/loch-s3.rs` | CLI de gestion des utilisateurs |
| `tests/integration.rs` | Tests d'intégration contre un vrai serveur |

## Stockage sur disque

| Chemin dans `S3_DATA_DIR` | Contenu |
|---|---|
| `{bucket}/` | Un répertoire par bucket |
| `{bucket}/{key}` | Données de l'objet, un fichier par objet (chiffré le cas échéant) |
| `{bucket}/.metadata` | Date de création et propriétaire du bucket |
| `{bucket}/.meta/{key}.json` | Métadonnées de l'objet : en-têtes, ETag, propriétaire, paramètres de chiffrement |
| `{bucket}/.versions/`, `.versioning.json` | Versions et état du versionnage |
| `{bucket}/.acl/`, `.acl.xml` | ACL des objets et du bucket |
| `{bucket}/.policy.json`, `.cors.json`, `.encryption.json` | Réglages du bucket |
| `{bucket}/.uploads/{upload_id}/` | Parties multipart en cours |
| `.loch-tmp/` | Écritures en cours, renommées à leur place une fois terminées ; vidé au démarrage |

## Règles

- Les écritures passent par un fichier temporaire, y sont chiffrées si besoin, puis publiées par renommage : métadonnées d'abord, données ensuite.
- Les corps sont écrits en flux sur disque avec un MD5 incrémental ; rien n'est chargé en entier en mémoire.
- Chaque écriture réserve sa taille dans le quota avant d'écrire.
- Les en-têtes et les query strings ne sont jamais journalisés.
