---
sidebar_position: 1
title: Installation
description: Installez Loch Panel avec une stack Docker Compose prête à l'emploi (web, light, minimal) ou à la main, branchez un fournisseur OIDC et connectez-vous en premier admin.
---

# Installation

Loch Panel tourne dans deux conteneurs : l'**API** (Go, port 2538), qui dialogue avec le démon Docker, et l'**interface** (nginx, port 80), une application web statique qui appelle l'API.

Deux façons de l'installer :

- **[Avec Docker Compose](#docker-compose)** (recommandé) : une stack prête à l'emploi du dépôt du panel, lancée par un script.
- **[À la main](#manual)** : votre propre fichier compose et votre reverse proxy.

:::note Prérequis
- Un serveur Linux avec Docker et `docker compose`. Pour un essai en local, macOS avec Docker Desktop ou OrbStack convient aussi.
- Un fournisseur OIDC : Microsoft Entra ID, Keycloak, ou tout fournisseur OIDC standard (Authentik, Authelia, Zitadel, Auth0, Okta, Google, GitLab…).
:::

## Déclarer le client OIDC {#oidc}

Chez votre fournisseur, créez un client OAuth 2.0 (flux Authorization Code avec PKCE) :

1. Indiquez l'URI de redirection `<URL de l'API>/openid-connect/redirect`. Avec les exemples Docker Compose, c'est `https://manager.api.<DOMAIN>/openid-connect/redirect`. Avec Entra ID, déclarez-la dans la plateforme **Web**, pas **SPA**.
2. Autorisez les scopes `openid email profile`.
3. Notez l'identifiant et le secret du client, ainsi que les réglages du fournisseur ci-dessous.

| `OIDC_PROVIDER` | À renseigner aussi |
|---|---|
| `microsoft` (par défaut) | `TENANT_ID`, `APPLICATION_ID` |
| `keycloak` | `KEYCLOAK_URL`, `KEYCLOAK_REALM` |
| `generic` | `OIDC_DISCOVERY_URL` (l'URL `.well-known/openid-configuration`) |

Le jeton d'identité doit contenir la claim `email` (ou `preferred_username`) : c'est elle qui identifie l'utilisateur.

## Installer avec Docker Compose {#docker-compose}

Le dossier [`example/`](https://github.com/loch-sh/panel/tree/main/example) du dépôt du panel contient quatre stacks, toutes derrière Traefik avec Let's Encrypt :

| Exemple | Services | Pour quel usage |
|---|---|---|
| `web` | Traefik, panel (hébergement, SFTP et services activés), SFTPGo, [deploy-server](/deploy/) | Hébergement pour une agence web : sites créés dans le panel, fichiers en SFTP, bases de données managées, déploiements GitLab CI |
| `light` | Traefik, panel (plugins désactivés), deploy-server | Les stacks sont déployées par GitLab CI uniquement |
| `minimal` | Traefik, panel (plugins désactivés) | Les stacks sont déployées autrement (à la main, en SSH) |
| `web-build` | `web`, avec l'API et l'interface construites depuis les sources locales | Tester une modification du panel dans une stack complète. **Pas pour la production.** |

Chaque exemple contient les mêmes fichiers : `compose.yaml` (à ne jamais modifier), `.env.example`, `app.env.example` et `up.sh`. Les images du panel sont `ghcr.io/loch-sh/panel/api` et `ghcr.io/loch-sh/panel/interface`, chacune fixée sur sa propre release (API `v1.1.0`, interface `v1.1.1`).

### 1. Configurer

```bash
git clone https://github.com/loch-sh/panel.git
cd panel/example/web                                # ou light, minimal, web-build
cp .env.example .env && cp app.env.example app.env
```

- **`.env`** : `DOMAIN`, `ACME_EMAIL`, `DATA_ROOT` (par défaut `/data`) et, avec deploy-server, `GITLAB_HOST`, `DEPLOY_NAMESPACES`, `DEPLOY_ALLOWED_IPS`.
- **`app.env`** : le [client OIDC](#oidc), `COOKIE_SECRET` et `PASSWORD_SECRET` (générez chacun avec `openssl rand -hex 32`).

Chaque hôte public est un sous-domaine de `DOMAIN`. En production, indiquez un vrai domaine dont les enregistrements DNS pointent vers le serveur : `manager`, `manager.api`, et avec `web` ou `light` aussi `deploy` et `ftp`. La valeur par défaut, `127.0.0.1.traefik.me`, sert au [lancement en local](#local-run).

:::warning
Laissez `FRONT_URL` et `REDIRECT_URI` tels quels dans `app.env` : ils sont calculés à partir de `DOMAIN`. S'ils ne correspondent pas aux vraies URL, CORS bloque l'interface : la page reste blanche et `/users/me` répond 401.
:::

Sur un serveur Linux, créez d'abord les dossiers de l'hôte (les chemins sont dans le README de chaque exemple). Pour `web`, les sites appartiennent à `1000:1000` :

```bash
sudo mkdir -p /data/{traefik/letsencrypt,traefik/logs,panel/data,panel/log,compose,websites/hosted,services,deploy} \
  /data/sftpgo/{data,logs,config}
sudo chown -R 1000:1000 /data/sftpgo /data/websites/hosted
```

### 2. Démarrer

```bash
./up.sh
docker compose logs -f api    # l'API liste tous les problèmes de configuration au démarrage
```

`up.sh` :

1. vérifie la présence de `.env` et `app.env` ;
2. crée le réseau partagé `traefik_default` s'il manque (les sites hébergés et les stacks CI l'utilisent aussi, donc `docker compose down` ne le supprime jamais) ;
3. sur macOS, utilise `./data` si `DATA_ROOT` n'est pas défini ;
4. avec `web`, si `SFTP_ENABLED=true` et que `SFTP_API_KEY` est vide, [crée la clé d'API SFTPGo](#sftpgo-key) ;
5. lance `docker compose up -d` (les arguments supplémentaires sont transmis, par exemple `./up.sh api`), puis affiche les URL :

| URL | Service |
|---|---|
| `https://manager.<DOMAIN>` | Interface |
| `https://manager.api.<DOMAIN>` | API |
| `https://deploy.<DOMAIN>` | deploy-server |
| `sftp://ftp.<DOMAIN>:2022`, `https://ftp.<DOMAIN>/web/client` | SFTP et son client web |
| `http://127.0.0.1:8081/web/admin` | Admin SFTPGo, sur la boucle locale de l'hôte uniquement (à distance : `ssh -L 8081:127.0.0.1:8081 <hôte>`) |

Ensuite, [connectez-vous en premier admin](#first-admin).

### Clé d'API SFTPGo {#sftpgo-key}

Le plugin SFTP a besoin d'une clé d'API d'un admin SFTPGo, et l'API refuse de démarrer sans elle. L'admin web de SFTPGo n'a pas de page « API keys » : la clé se crée par l'API REST. Laissez `up.sh` s'en charger :

1. `up.sh` démarre SFTPGo seul et demande `Create a new SFTPGo admin API key now? [y/N]`.
2. Si ce n'est pas déjà fait, ouvrez `http://127.0.0.1:8081/web/admin` et créez l'admin SFTPGo.
3. Répondez `y`, puis saisissez l'identifiant et le mot de passe de l'admin (non affiché).

`up.sh` active **API key authentication** sur le profil de l'admin, crée la clé, l'écrit dans `SFTP_API_KEY` de `app.env`, puis démarre la stack. Si vous répondez non, ou sans terminal, il affiche les étapes manuelles : elles sont dans le [README de `web`](https://github.com/loch-sh/panel/tree/main/example/web#installation).

### Lancement en local {#local-run}

Avec la valeur par défaut `DOMAIN=127.0.0.1.traefik.me`, la stack tourne sur votre machine sans aucun enregistrement DNS : chaque `<x>.127.0.0.1.traefik.me` pointe vers `127.0.0.1`.

- Let's Encrypt ne peut pas valider ces hôtes : Traefik sert un certificat auto-signé. **Ouvrez une fois `https://manager.api.127.0.0.1.traefik.me` et acceptez le certificat**, puis ouvrez l'interface. Sinon le navigateur bloque les appels à l'API et l'interface reste une page blanche.
- Sur macOS, `/data` ne peut pas être partagé avec la VM Docker : sans `DATA_ROOT`, `up.sh` utilise `./data`.
- Pour joindre la stack depuis un autre appareil, utilisez l'IP de votre réseau local, par exemple `DOMAIN=192.168.1.20.traefik.me`.

### Bon à savoir

- **Un seul exemple par hôte.** Ils utilisent les mêmes ports, réseaux et dossiers. `web` et `web-build` partagent leurs données : passer de l'un à l'autre conserve les utilisateurs, les sites et les instances de services.
- **HTTP vers HTTPS** : la redirection est faite par un routeur Traefik « catch-all » de priorité 1, pas par l'entrypoint. Un site hébergé avec HTTPS désactivé est donc bien servi en HTTP.
- **Mises à jour** : changez le tag des images dans `compose.yaml` à chaque [release](https://github.com/loch-sh/panel/releases), après avoir lu ses notes.
- **`web-build`** reconstruit l'API et l'interface depuis les sources à chaque `./up.sh` (`pull_policy: build`). `./up.sh api` ou `./up.sh interface` n'en reconstruit qu'une.
- Réseaux, dossiers de l'hôte et notes de sécurité : voir le [README des exemples](https://github.com/loch-sh/panel/tree/main/example).

## Installer à la main {#manual}

Choisissez cette voie pour intégrer le panel à un reverse proxy existant.

### 1. Récupérer les images

Utilisez les images publiées, `ghcr.io/loch-sh/panel/api:v1.1.0` et `ghcr.io/loch-sh/panel/interface:v1.1.1`, ou construisez-les : chaque projet fournit un Dockerfile multi-étapes, dont les images de base viennent de `mirror.gcr.io`.

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

### 2. Écrire la configuration de l'API

Déclarez le [client OIDC](#oidc), puis créez un fichier `.env` à côté de votre fichier compose :

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

### 3. Démarrer les conteneurs

```yaml
services:
  api:
    image: ghcr.io/loch-sh/panel/api:v1.1.0
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
    image: ghcr.io/loch-sh/panel/interface:v1.1.1
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

L'API expose un contrôle de santé sur `/_health` (utilisé aussi par le `HEALTHCHECK` de l'image). Il répond `{"message":"up","docker":true}` quand Docker est joignable. Placez les deux conteneurs derrière un [reverse proxy](#reverse-proxy) HTTPS.

## Se connecter en premier admin {#first-admin}

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

## Reverse proxy {#reverse-proxy}

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
