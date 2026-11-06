---
sidebar_position: 4
title: Sécurité
description: Liste de contrôle de sécurité pour un serveur Loch S3 et résumé des protections intégrées.
---

# Sécurité

## Liste de contrôle

1. Activez l'authentification : définissez `S3_USERS_FILE` (ou `S3_ACCESS_KEY_ID` + `S3_SECRET_ACCESS_KEY`). Sans elle, tout le monde peut lire et écrire.
2. Servez l'API uniquement en HTTPS, derrière un reverse proxy.
3. Bloquez `/_loch/users` au niveau du proxy, ou ne définissez pas `S3_ADMIN_API_KEY`.
4. Lisez la clé maître depuis un fichier en `0400` (`S3_ENCRYPTION_KEY_FILE`), pas depuis l'environnement.
5. Gardez le répertoire de données sur un système de fichiers sensible à la casse, réservé à Loch S3.
6. Faites tourner le conteneur en lecture seule, sans capacités, avec des limites de mémoire et de PID. Voir [Déploiement en production](./production.md#hardened-container).
7. Donnez à chaque application son propre utilisateur, avec accès aux seuls buckets dont elle a besoin.

## Protections intégrées

| Domaine | Protection |
|---|---|
| Signatures | SigV4 vérifiée en temps constant ; décalage d'horloge de plus de 15 minutes refusé ; `host` et chaque en-tête `x-amz-*` doivent être signés |
| Corps des requêtes | SHA-256 signé et signatures de chunks `aws-chunked` vérifiés ; rien n'est stocké en cas d'écart |
| URL présignées | De 1 seconde à 7 jours ; une signature invalide ne retombe jamais sur l'accès anonyme |
| Chemins | Noms de buckets et clés validés ; `.`, `..`, segments vides et liens symboliques refusés |
| Politiques | Le `Deny` explicite l'emporte ; les champs non pris en charge sont refusés au lieu d'être ignorés ; une politique stockée illisible refuse l'accès |
| Chiffrement | Données chiffrées avant d'être publiées ; aucune donnée en clair n'arrive sous un bucket |
| Journaux | Ni en-têtes, ni query strings, ni clés dans les journaux |
| Ressources | Délais sur les en-têtes et les corps, débit d'envoi minimal, plafond de connexions, quota |

## Limites connues

- `UNSIGNED-PAYLOAD` et les checksums de fin de flux sont acceptés sans vérification : l'intégrité repose alors sur TLS.
- Les objets chiffrés gardent leurs paramètres dans un fichier de métadonnées non authentifié.
- Un droit `READ` au niveau du bucket permet de télécharger tous ses objets.

Historique complet des audits et des correctifs : [SECURITY.md](https://github.com/loch-sh/s3/blob/1.4.1/SECURITY.md).
