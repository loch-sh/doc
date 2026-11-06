---
sidebar_position: 2
title: Développement local
description: Lancez l'API, l'interface web de Loch Panel et SFTPGo sur votre machine.
---

# Développement local

Lancez l'API et l'interface depuis le répertoire de travail qui contient les trois projets.

:::note
Il vous faut Go 1.27 ou plus récent, Node.js 26 et Yarn 4 (`corepack enable`), Docker avec `docker compose`, et un fournisseur OIDC (Microsoft Entra ID, Keycloak ou tout fournisseur compatible).
:::

## Démarrer

1. Installez les dépendances de l'API et de l'interface :

   ```bash
   make install
   ```

2. Créez la configuration de l'API, puis renseignez le client OIDC, `FRONT_URL` et les secrets :

   ```bash
   cp host-panel-api/.env.example host-panel-api/.env
   ```

3. Facultatif : créez la configuration de l'interface (URL de l'API, personnalisation) :

   ```bash
   cp host-panel-interface/.env.example host-panel-interface/.env
   ```

4. Démarrez SFTPGo, puis l'API et l'interface :

   ```bash
   make dev
   ```

5. Ouvrez http://localhost:5173 et connectez-vous.

## Le `.env` de l'API en développement

Les valeurs ci-dessous viennent de `.env.example`. Liste complète : [référence de la configuration](../reference/configuration.md).

```env
OIDC_PROVIDER=microsoft          # microsoft, keycloak ou generic
CLIENT_ID=your-client-id
CLIENT_SECRET=your-client-secret
REDIRECT_URI=http://localhost:2538
FRONT_URL=http://localhost:5173
COOKIE_SECRET=a-secret-of-at-least-32-characters-here
APP_ENV=development
PORT=2538
DATA_DIR=./data
```

L'API refuse de démarrer si une variable est invalide, manquante, inconnue ou supprimée, et liste tous les problèmes d'un coup.

## Cibles du répertoire de travail

| Cible | Description |
|---|---|
| `make dev` | SFTPGo, puis l'API et l'interface en parallèle. Ctrl-C arrête l'API et l'interface |
| `make api` / `make web` | L'API seule / l'interface seule |
| `make sftpgo` / `make sftpgo-logs` / `make down` | Démarrer SFTPGo / suivre ses logs / l'arrêter |
| `make install` | Installer les dépendances |
| `make clean` | Arrêter SFTPGo et supprimer ses données locales |

Dans le répertoire de l'API, `make dev` lance `go run ./cmd/server` sans rechargement : relancez-le après une modification. L'interface (`yarn dev`) se recharge toute seule.

## Ports

| Service | URL |
|---|---|
| API | http://localhost:2538 |
| Interface | http://localhost:5173 |
| Administration web et API de SFTPGo | http://localhost:8080 |

## Activer SFTP en développement

1. Lancez `make sftpgo` (ou `make dev`).
2. Créez une clé API d'administration SFTPGo : `cd host-panel-api && make sftp-key`. La commande demande le mot de passe admin de SFTPGo et nécessite `curl` et `jq`.
3. Ajoutez dans `host-panel-api/.env` :

   ```env
   SFTP_ENABLED=true
   SFTP_DIRECTORY=/data/websites/hosted
   SFTP_API_URL=http://localhost:8080
   SFTP_API_KEY=<la clé API d'administration>
   SFTP_DOMAIN=localhost
   SFTP_PORT=2222
   SFTP_WEB_USER_INTERFACE=http://localhost:8080/web/client
   ```

4. Relancez l'API : l'entrée de menu **SFTP** apparaît pour les admins.

## La CLI

La CLI se compile à part, dans `host-panel-cli` :

| Commande | Description |
|---|---|
| `make build` | Compile `./loch` (version `dev`, la mise à jour automatique est donc désactivée) |
| `make run` | `go run .` |
| `make mcp-inspect` | Ouvre l'inspecteur MCP sur `loch mcp` |

Pointez-la vers votre API locale avec une clé API créée dans l'interface. Voir la [documentation de la CLI](/cli/).

## Bon à savoir

- L'API doit accéder au socket Docker.
- Les fichiers `.env` ne sont pas suivis par Git : seul `.env.example` l'est.
- Votre client OIDC doit autoriser le `REDIRECT_URI` que vous indiquez.
