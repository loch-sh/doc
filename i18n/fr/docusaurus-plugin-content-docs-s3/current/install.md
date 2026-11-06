---
sidebar_position: 2
title: Installation
description: Lancer Loch S3 avec Docker ou en binaire, puis créer un premier bucket avec l'AWS CLI.
---

# Installation

## Docker

L'image `ghcr.io/loch-sh/s3:<version>` fonctionne sur `linux/amd64` et `linux/arm64`. Elle écoute sur le port `8080`, stocke les données dans `/data`, tourne avec l'uid:gid `100:101` et embarque un healthcheck.

1. Créez `compose.yaml` :

   ```yaml
   services:
     s3:
       image: ghcr.io/loch-sh/s3:1.4.1
       restart: unless-stopped
       ports:
         - "127.0.0.1:8080:8080"
       environment:
         S3_USERS_FILE: /data/.users.json
       volumes:
         - s3-data:/data

   volumes:
     s3-data:
   ```

2. Démarrez-le :

   ```bash
   docker compose up -d
   ```

3. Lisez les identifiants root. Au premier démarrage, le serveur crée le fichier des utilisateurs avec un utilisateur `root` et des clés aléatoires :

   ```bash
   docker compose exec s3 cat /data/.users.json
   ```

Le port n'est publié que sur la boucle locale. Pour l'exposer, placez un reverse proxy TLS devant : voir [Déploiement en production](./admin/production.md).

## Binaire

Téléchargez l'archive de votre plateforme sur [GitHub Releases](https://github.com/loch-sh/s3/releases) : Linux musl (`amd64`, `arm64`), Windows `amd64` et macOS (`amd64`, `arm64`). Chaque archive contient le serveur `s3` et la CLI d'utilisateurs `loch-s3`.

```bash
curl -L -o s3.tar.gz https://github.com/loch-sh/s3/releases/download/1.4.1/s3-linux-amd64.tar.gz
tar xzf s3.tar.gz
S3_DATA_DIR=./data S3_USERS_FILE=./users.json ./s3
```

Sans `S3_USERS_FILE` ni `S3_ACCESS_KEY_ID`, le serveur accepte toutes les requêtes sans authentification. Réservez ce mode aux tests locaux.

## Premier bucket

Utilisez la clé d'accès et le secret de l'utilisateur `root` :

```bash
export AWS_ACCESS_KEY_ID=<access_key_id> AWS_SECRET_ACCESS_KEY=<secret_access_key> AWS_DEFAULT_REGION=us-east-1
aws --endpoint-url http://localhost:8080 s3 mb s3://my-bucket
aws --endpoint-url http://localhost:8080 s3 cp report.pdf s3://my-bucket/report.pdf
aws --endpoint-url http://localhost:8080 s3 ls s3://my-bucket
```

Ensuite : [connecter un client](./guides/connect-a-client.md). Toutes les variables : [Référence de configuration](./reference/configuration.md).
