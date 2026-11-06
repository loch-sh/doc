---
sidebar_position: 2
title: Configuration
description: Les variables d'environnement essentielles de l'API Loch Panel, regroupées par usage, et leur vérification au démarrage.
---

# Configuration

L'API lit sa configuration dans les variables d'environnement (ou dans un fichier `.env` de son répertoire de travail ; l'environnement l'emporte). Cette page liste les variables à renseigner sur la plupart des installations.

Liste complète : [référence de configuration](../reference/configuration.md).

## Authentification

| Variable | Description |
|---|---|
| `OIDC_PROVIDER` | `microsoft` (par défaut), `keycloak` ou `generic` |
| `CLIENT_ID`, `CLIENT_SECRET` | Client OAuth 2.0 déclaré chez le fournisseur |
| `REDIRECT_URI` | URL publique de l'API ; le retour se fait sur `<REDIRECT_URI>/openid-connect/redirect` |
| `SCOPE` | Scopes OAuth, par exemple `openid email profile` |
| `TENANT_ID`, `APPLICATION_ID` | Microsoft Entra ID uniquement |
| `KEYCLOAK_URL`, `KEYCLOAK_REALM` | Keycloak uniquement |
| `OIDC_DISCOVERY_URL` | Fournisseur générique uniquement |

## Sécurité et réseau

| Variable | Description |
|---|---|
| `FRONT_URL` | URL de l'interface web : seule origine acceptée par CORS, le contrôle CSRF et le WebSocket |
| `COOKIE_SECRET` | Secret de signature des cookies de session, 32 caractères minimum |
| `PASSWORD_SECRET` | Obligatoire au démarrage, inutilisé dans la version actuelle |
| `TRUSTED_PROXIES` | Sous-réseau de votre reverse proxy, autorisé à fixer `X-Forwarded-For` |

## Stockage

| Variable | Défaut | Description |
|---|---|---|
| `DATA_DIR` | `./data` | Utilisateurs, clés API, tâches planifiées (fichiers JSON). `/app/data` dans l'image |
| `API_LOG_DIR` | `./log` | Répertoire de `audit.log`. `/app/log` dans l'image |

## Modules facultatifs

Chaque module est désactivé par défaut. Activez-le, puis renseignez ses variables.

| Module | Interrupteur | Guide |
|---|---|---|
| Sites web | `HOSTING_ENABLED=true` (exige aussi `HOSTING_TRAEFIK_NETWORK`) | [Sites web](./hosting.md) |
| Comptes SFTP | `SFTP_ENABLED=true` (exige aussi `SFTP_DIRECTORY`, `SFTP_API_URL`, `SFTP_API_KEY`) | [SFTP](./sftp.md) |
| Services managés | `SERVICES_ENABLED=true` | [Services managés](./services.md) |
| Réseaux privés | Toujours disponibles | [Réseaux privés](./networks.md) |

## Vérifications au démarrage

L'API vérifie chaque variable à son démarrage. Au moindre problème, elle **refuse de démarrer** et les journalise tous d'un coup (`invalid configuration`, une ligne par variable) :

- une variable obligatoire absente, un type ou une plage de valeurs incorrects, un `COOKIE_SECRET` de moins de 32 caractères ;
- une variable inconnue portant un préfixe connu (`OIDC_`, `SFTP_`, `HOSTING_`, `SERVICES_`, `NETWORKS_`, `CRON_`, `COOKIE_`, `KEYCLOAK_`, `TRUSTED_`) : presque toujours une faute de frappe, et le message propose le nom le plus proche ;
- une variable supprimée : le message indique ce qui la remplace.

Les valeurs ne sont jamais écrites dans les logs. Seules les vérifications d'installation du module services (chemins, montages, Docker) désactivent ce module sans arrêter l'API.

## Bon à savoir

- Toute modification de variable nécessite de redémarrer le conteneur de l'API.
- Les variables du conteneur de l'interface (`API_URL`, `WS_URL`, personnalisation) sont listées dans [Installation](./installation.md#interface-settings).
