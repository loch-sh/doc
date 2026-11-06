---
sidebar_position: 3
title: Sauvegarde et restauration
description: Sauvegarder le répertoire de données, le fichier des utilisateurs et la clé maître de Loch S3, puis les restaurer.
---

# Sauvegarde et restauration

Un serveur Loch S3 se sauvegarde en trois éléments :

| Élément | Emplacement | Pourquoi |
|---|---|---|
| Répertoire de données | `S3_DATA_DIR` (`/data` dans l'image) | Objets, versions, métadonnées, politiques, ACL, propriétaires des buckets |
| Fichier des utilisateurs | `S3_USERS_FILE` | Clés de tous les utilisateurs |
| Clé maître | `S3_ENCRYPTION_KEY_FILE` ou `S3_ENCRYPTION_KEY` | Déchiffre les objets SSE-S3 |

:::warning
Sans la clé maître, tous les objets SSE-S3 sont perdus. Stockez-la à part de la sauvegarde des données, pour qu'une sauvegarde volée ne contienne pas les deux.
:::

## Sauvegarder

1. Arrêtez le serveur, ou prenez un instantané du système de fichiers (LVM, ZFS, Btrfs) pour obtenir une copie cohérente.
2. Copiez le répertoire de données en conservant propriétaires et permissions :

   ```bash
   docker compose stop s3
   tar czf s3-data-$(date +%F).tar.gz -C /srv/s3 data
   docker compose start s3
   ```

3. Copiez le fichier des utilisateurs et la clé maître dans un emplacement séparé et protégé.

## Restaurer

1. Arrêtez le serveur.
2. Remettez le répertoire de données, le fichier des utilisateurs et la clé maître aux mêmes chemins.
3. Rendez le répertoire de données modifiable par l'utilisateur du conteneur : `chown -R 100:101 /srv/s3/data`.
4. Démarrez le serveur. Il supprime les fichiers temporaires restants et recalcule l'espace utilisé.

## Bon à savoir

- Les objets SSE-C ont besoin de la clé du client : le serveur ne l'a jamais eue.
- Restaurez sur un système de fichiers sensible à la casse (Linux). Sinon, le serveur affiche un avertissement au démarrage.
- Ne modifiez pas le répertoire de données à la main : chaque bucket garde ses métadonnées, versions et réglages dans des fichiers cachés (`.meta/`, `.versions/`, `.policy.json`…).
