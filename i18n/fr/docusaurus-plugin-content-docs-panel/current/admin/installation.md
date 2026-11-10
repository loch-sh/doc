---
sidebar_position: 1
title: Installation
description: Déployez l'API et l'interface web de Loch Panel avec Docker, branchez un fournisseur OIDC et connectez-vous en premier admin.
---

# Installation

Loch Panel tourne dans deux conteneurs : l'**API** (Go, port 2538), qui dialogue avec le démon Docker, et l'**interface** (nginx, port 80), une application web statique qui appelle l'API.

:::note Prérequis
- Un serveur Linux avec Docker et `docker compose`.
- Un fournisseur OIDC : Microsoft Entra ID, Keycloak, ou tout fournisseur OIDC standard (Authentik, Authelia, Zitadel, Auth0, Okta, Google, GitLab…).
- Deux URL en HTTPS, par exemple `https://panel.example.com` (interface) et `https://panel-api.example.com` (API).
:::

## 1. Construire les images

Chaque projet fournit un Dockerfile multi-étapes. Les images de base viennent de `mirror.gcr.io`.

```bash
# Dans host-panel-api/
docker build -t loch-panel-api .

# Dans host-panel-interface/
docker build -t loch-panel-interface .
```

| Image | Base | Port | Volumes |
|---|---|---|---|
| API | `mirror.gcr.io/library/alpine` (avec `docker-cli` et le plugin compose) | 2538 | `/app/data`, `/app/log` |
| Interface | `mirror.gcr.io/library/nginx` | 80 | `/branding` |

## 2. Déclarer le client OIDC

Chez votre fournisseur, créez un client OAuth 2.0 (flux Authorization Code avec PKCE) :

1. Indiquez l'URI de redirection `<URL de l'API>/openid-connect/redirect`, par exemple `https://panel-api.example.com/openid-connect/redirect`.
2. Autorisez les scopes `openid email profile`.
3. Notez l'identifiant et le secret du client, ainsi que les réglages du fournisseur ci-dessous.

| `OIDC_PROVIDER` | À renseigner aussi |
|---|---|
| `microsoft` (par défaut) | `TENANT_ID`, `APPLICATION_ID` |
| `keycloak` | `KEYCLOAK_URL`, `KEYCLOAK_REALM` |
| `generic` | `OIDC_DISCOVERY_URL` (l'URL `.well-known/openid-configuration`) |

Le jeton d'identité doit contenir la claim `email` (ou `preferred_username`) : c'est elle qui identifie l'utilisateur.

## 3. Écrire la configuration de l'API

Créez un fichier `.env` à côté de votre fichier compose :

```env
OIDC_PROVIDER=generic
OIDC_DISCOVERY_URL=https://auth.example.com/.well-known/openid-configuration
CLIENT_ID=loch-panel
CLIENT_SECRET=change-me
REDIRECT_URI=https://panel-api.example.com
SCOPE=openid email profile

FRONT_URL=https://panel.example.com
COOKIE_SECRET=a-random-secret-of-at-least-32-characters
PASSWORD_SECRET=required-but-not-used-yet
```

`REDIRECT_URI` est l'URL publique de l'API, sans le chemin de retour. Toutes les variables sont vérifiées au démarrage : voir [Configuration](./configuration.md).

## 4. Démarrer les conteneurs

```yaml
services:
  api:
    image: loch-panel-api
    restart: unless-stopped
    env_file: .env
    ports:
      - "2538:2538"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./data:/app/data   # utilisateurs, clés API, tâches planifiées
      - ./log:/app/log     # audit trail
      # Hébergement et services : même chemin sur l'hôte et dans le conteneur
      # - /data/compose:/data/compose
      # - /data/websites/hosted:/data/websites/hosted

  interface:
    image: loch-panel-interface
    restart: unless-stopped
    ports:
      - "8080:80"
    environment:
      API_URL: https://panel-api.example.com
      WS_URL: wss://panel-api.example.com
```

```bash
docker compose up -d
```

L'API expose un contrôle de santé sur `/_health` (utilisé aussi par le `HEALTHCHECK` de l'image). Il répond `{"message":"up","docker":true}` quand Docker est joignable.

## 5. Se connecter en premier admin

Ouvrez l'interface et connectez-vous. **Le premier utilisateur qui se connecte devient admin.** Les suivants sont créés à leur première connexion avec le profil restreint, sans aucun conteneur. Donnez-leur des accès depuis [Utilisateurs](./users.md).

## Réglages de l'interface {#interface-settings}

Tous facultatifs, lus au démarrage du conteneur (sans reconstruire l'image).

| Variable | Défaut | Description |
|---|---|---|
| `API_URL` | `http://localhost:2538` | URL de base de l'API |
| `WS_URL` | `ws://localhost:2538` | URL de base du WebSocket de l'API (logs, terminal, proxy) |
| `APP_NAME` | `Loch.sh Panel` | Nom affiché dans l'onglet du navigateur et les fenêtres de terminal |
| `LOGO_URL` | `/logo.svg` | URL du logo ; prioritaire sur un logo monté dans `/branding` |
| `FAVICON_URL` | le logo, sinon `/favicon.svg` | URL du favicon |
| `SUPPORT_PHONE` | — | Téléphone du support sur l'accueil (masqué si vide) |
| `SUPPORT_URL` | — | Lien vers le support sur l'accueil (masqué si vide) |
| `STATUS_URL` | — | Page de statut intégrée à l'accueil (masquée si vide) |

Pour votre propre logo, montez `logo.svg` (ou `.png`, `.webp`, `.jpg`, `.jpeg`, `.ico`) et, si besoin, `favicon.*` dans `/branding`.

## Reverse proxy

Placez les deux conteneurs derrière un reverse proxy HTTPS (Traefik, nginx…) :

- **HTTPS obligatoire.** Le cookie de session est `Secure` et `SameSite=None`.
- **WebSocket** : le proxy doit relayer l'upgrade sur la route `/ws` de l'API (terminal, logs en direct, stats, proxy de ports). Utilisez `wss://` dans `WS_URL`.
- **Origine** : `FRONT_URL` doit être exactement l'URL de l'interface (schéma, hôte, port). C'est la seule origine acceptée par CORS, le contrôle CSRF et le WebSocket.
- **IP du client** : renseignez dans `TRUSTED_PROXIES` le sous-réseau du proxy, par exemple le réseau Traefik (`docker network inspect traefik`). Sans cela, la limite de débit et l'audit trail voient l'adresse du proxy.
- **Domaine du cookie** : `COOKIE_DOMAIN` vaut par défaut l'hôte de l'API. Ne le changez qu'en connaissance de cause.

## Bon à savoir

- L'API a besoin du socket Docker : qui contrôle le conteneur de l'API contrôle l'hôte. N'exposez pas le port 2538 sans le reverse proxy.
- Montez `/app/log`, sinon l'audit trail est perdu quand le conteneur est recréé.
- Les répertoires de l'hébergement et des services doivent être montés au **même chemin** dans le conteneur de l'API que sur l'hôte ; l'API le vérifie au démarrage.
- Le panel télécharge les images qu'il lance (sites, services) depuis `mirror.gcr.io` ; le module services a aussi besoin d'un accès HTTPS sortant pour découvrir les versions (voir la [référence de configuration](../reference/configuration.md#services)).
- Modules facultatifs : [Sites web](../hosting/sites.md), [SFTP](../hosting/sftp.md), [Services managés](../services/overview.md), [Réseaux privés](../network/private-networks.md).
