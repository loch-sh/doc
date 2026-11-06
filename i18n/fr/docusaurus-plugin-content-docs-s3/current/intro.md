---
sidebar_position: 1
slug: /
title: Loch S3
description: Loch S3 est un serveur de stockage objet compatible S3, auto-hébergé, écrit en Rust, qui stocke les objets sur le système de fichiers local.
---

# Loch S3

Loch S3 est un serveur de stockage objet compatible S3. C'est un binaire Rust unique qui enregistre chaque objet sous forme de fichier dans un répertoire local. Utilisez-le pour vos sauvegardes, le stockage de vos applications ou l'hébergement de fichiers sur vos propres serveurs, avec l'AWS CLI ou n'importe quel SDK S3.

Toute la configuration passe par des variables d'environnement : il n'y a pas de fichier de configuration.

## Fonctionnalités

| Domaine | Pris en charge |
|---|---|
| Authentification | AWS Signature V4 en en-têtes et en URL présignées, envois `aws-chunked` avec signatures de chunks |
| Buckets | Création, liste, head, suppression |
| Objets | Put, get, head, delete, copie, métadonnées, requêtes `Range` |
| Listage | ListObjectsV2 avec `prefix` et `delimiter` |
| Gros fichiers | Envoi multipart (création, envoi de parties, finalisation, abandon, liste) |
| Versionnage | `Enabled` et `Suspended`, marqueurs de suppression, liste des versions |
| Contrôle d'accès | Utilisateurs, propriétaires de buckets, ACL prédéfinies, politiques de bucket JSON |
| Chiffrement | SSE-S3 et SSE-C (AES-256-GCM), chiffrement par défaut par bucket ou pour tout le serveur |
| Navigateurs | CORS par bucket |
| Exploitation | Quota de stockage global, sonde `/_loch/health`, HTTP/1.1 et HTTP/2 |

## Non pris en charge

- Les URL de style virtual-hosted : utilisez le style path (`https://s3.example.com/bucket/key`).
- La suppression multiple (`DeleteObjects`).
- Règles de cycle de vie, réplication, verrouillage d'objets, tags, régions, SSE-KMS, politiques IAM.
- `partNumber` sur un GET.

Liste complète : [Compatibilité de l'API S3](./reference/s3-api.md).

## Étape suivante

[Installez Loch S3](./install.md) et créez votre premier bucket.
