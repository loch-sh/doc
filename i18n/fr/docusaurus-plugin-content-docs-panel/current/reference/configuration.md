---
sidebar_position: 1
title: Référence de configuration
description: Toutes les variables d'environnement de l'API Loch Panel, avec leur valeur par défaut et leur description, regroupées par module.
---

# Référence de configuration

Toutes les variables d'environnement lues par l'API. L'API charge aussi un fichier `.env` dans son répertoire de travail ; les variables déjà définies dans l'environnement l'emportent. Pour l'essentiel, lisez [Configuration](../admin/configuration.md).

Chaque variable est vérifiée au démarrage : une variable obligatoire absente, une valeur invalide, un nombre hors plage, une variable inconnue portant un préfixe connu (`OIDC_`, `SFTP_`, `HOSTING_`, `SERVICES_`, `NETWORKS_`, `CRON_`, `COOKIE_`, `KEYCLOAK_`, `TRUSTED_`) ou une variable supprimée arrêtent l'API, avec la liste de tous les problèmes.

Les booléens acceptent `true`, `1`, `yes`, `on` et `false`, `0`, `no`, `off`. Les listes sont séparées par des virgules.

## Cœur {#core}

| Variable | Défaut | Description |
|---|---|---|
| `FRONT_URL` | obligatoire | URL de l'interface web : seule origine acceptée par CORS, le contrôle CSRF et le WebSocket. Les utilisateurs y sont renvoyés après la connexion |
| `COOKIE_SECRET` | obligatoire | Secret de signature des cookies de session, 32 caractères minimum |
| `PASSWORD_SECRET` | obligatoire | Doit être défini ; inutilisé dans la version actuelle |
| `COOKIE_DOMAIN` | hôte de l'API | Domaine des cookies de session |
| `APP_ENV` | `production` | `development` active les logs de débogage |
| `PORT` | `2538` | Port d'écoute (1 à 65535) |
| `DATA_DIR` | `./data` | Utilisateurs, clés API, tâches planifiées, registre des réseaux (fichiers JSON). `/app/data` dans l'image |
| `API_LOG_DIR` | `./log` | Répertoire de `audit.log`. `/app/log` dans l'image : montez-le pour conserver le journal |
| `TRUSTED_PROXIES` | vide (boucle locale seule) | Reverse proxys autorisés à fixer `X-Forwarded-For` : CIDR ou adresses. La boucle locale est toujours de confiance. Une plage plus large que /8 (IPv4) ou /32 (IPv6) est refusée |

## Authentification (OIDC) {#oidc}

| Variable | Défaut | Description |
|---|---|---|
| `OIDC_PROVIDER` | `microsoft` | `microsoft`, `keycloak` ou `generic` |
| `CLIENT_ID` | obligatoire | Identifiant du client OAuth 2.0 |
| `CLIENT_SECRET` | obligatoire | Secret du client OAuth 2.0 |
| `REDIRECT_URI` | obligatoire | URL publique de l'API ; le retour se fait sur `<REDIRECT_URI>/openid-connect/redirect` |
| `SCOPE` | obligatoire | Scopes OAuth, par exemple `openid email profile` |
| `TENANT_ID` | obligatoire avec `microsoft` | Tenant Microsoft Entra ID |
| `APPLICATION_ID` | obligatoire avec `microsoft` | Application Microsoft Entra ID |
| `KEYCLOAK_URL` | obligatoire avec `keycloak` | URL de base de Keycloak |
| `KEYCLOAK_REALM` | obligatoire avec `keycloak` | Realm Keycloak |
| `OIDC_DISCOVERY_URL` | obligatoire avec `generic` | URL de découverte (`.well-known/openid-configuration`) de n'importe quel fournisseur OIDC standard |

## Tâches planifiées {#cron}

| Variable | Défaut | Description |
|---|---|---|
| `CRON_HTTP_TIMEOUT` | `900` | Durée maximale d'une tâche planifiée HTTP, en secondes (1 à 86400) |
| `CRON_MAX_JOBS` | `50` | Nombre maximal de tâches planifiées (1 à 10000) |

## Réseaux privés {#networks}

| Variable | Défaut | Description |
|---|---|---|
| `NETWORKS_MAX` | `50` | Nombre maximal de réseaux privés, réseau système non compté (1 à 500) |
| `NETWORKS_RESERVED_RANGES` | vide | Plages IPv4 (au moins /8) utilisées hors de Docker (réseau local, VPN, routes statiques) qu'aucun réseau privé ne doit chevaucher |

Voir [Réseaux privés](../admin/networks.md).

## Sites web (hébergement) {#hosting}

| Variable | Défaut | Description |
|---|---|---|
| `HOSTING_ENABLED` | `false` | Active le module sites web |
| `HOSTING_STACKS_DIRECTORY` | `/data/compose` | Répertoire des projets compose (peut être partagé avec les stacks de CI). Utilisé aussi par le module services. Même chemin sur l'hôte et dans le conteneur de l'API |
| `HOSTING_SITES_DIRECTORY` | `/data/websites/hosted` | Répertoire des données des sites. Même chemin sur l'hôte et dans le conteneur de l'API |
| `HOSTING_TRAEFIK_NETWORK` | obligatoire si activé | Réseau Docker externe rejoint par les services web |
| `HOSTING_TRAEFIK_HTTP_ENTRYPOINT` | `web` | Entrypoint HTTP de Traefik |
| `HOSTING_TRAEFIK_HTTPS_ENTRYPOINT` | `websecure` | Entrypoint HTTPS de Traefik |
| `HOSTING_TRAEFIK_CERTRESOLVER` | `letsencrypt` | Résolveur de certificats de Traefik (vide : certificat par défaut) |
| `HOSTING_RUN_UID` | `1000` | Propriétaire des répertoires de sites créés par le panel |
| `HOSTING_RUN_GID` | `1000` | Groupe des répertoires de sites créés par le panel |
| `HOSTING_DEFAULT_MEMORY_MB` | `0` | Limite mémoire par défaut d'un site, en Mo (`0` : illimitée, sinon 64 minimum) |
| `HOSTING_MAX_MEMORY_MB` | `0` | Limite mémoire maximale qu'un site peut demander, en Mo (`0` : la mémoire de l'hôte, sinon 64 minimum ; plafonnée à l'hôte) |
| `HOSTING_DEFAULT_CPUS` | `0` | Limite CPU par défaut d'un site (`0` : illimitée, sinon 0.1 minimum) |
| `HOSTING_MAX_CPUS` | `0` | Limite CPU maximale qu'un site peut demander (`0` : les CPU de l'hôte, sinon 0.1 minimum ; plafonnée à l'hôte) |

Une valeur par défaut supérieure à son maximum arrête l'API. Voir [Sites web](../admin/hosting.md).

## SFTP {#sftp}

| Variable | Défaut | Description |
|---|---|---|
| `SFTP_ENABLED` | `false` | Active le module SFTP (SFTPGo) |
| `SFTP_DIRECTORY` | obligatoire si activé | Répertoire de base des sites |
| `SFTP_API_URL` | obligatoire si activé | URL interne de l'API d'administration SFTPGo, par exemple `http://sftpgo:8080` |
| `SFTP_API_KEY` | obligatoire si activé | Clé d'API d'administration SFTPGo |
| `SFTP_DOMAIN` | vide | Hôte SFTP affiché aux utilisateurs |
| `SFTP_PORT` | vide | Port SFTP affiché aux utilisateurs |
| `SFTP_WEB_USER_INTERFACE` | vide | URL du client web SFTPGo affichée aux utilisateurs |
| `SFTP_INIT_DIRS` | `web,logs` | Répertoires créés dans le dossier d'un nouvel utilisateur sur demande (vide : aucun) |

Voir [SFTP](../admin/sftp.md).

## Services managés {#services}

| Variable | Défaut | Description |
|---|---|---|
| `SERVICES_ENABLED` | `false` | Active le module services managés |
| `SERVICES_DATA_DIRECTORY` | `/data/services` | Données des instances. Chemin absolu, identique sur l'hôte et dans le conteneur de l'API, hors des répertoires des stacks, des sites et du SFTP |
| `SERVICES_NETWORK` | `loch-services` | Nom Docker du réseau système `services`, partagé par les instances et les sites (créé `internal` s'il manque). Ni `bridge`, `host`, `none`, `default`, ni le réseau Traefik, ni un nom `loch-net-*` |
| `SERVICES_ENGINES` | vide (tous) | Moteurs activés : `postgres`, `mariadb`, `mysql`, `mongodb`, `redis`, `valkey`, `rabbitmq`, `nats`, `s3`, `elasticmq`, `mosquitto` |
| `SERVICES_<ENGINE>_PINNED_VERSIONS` | vide | Versions toujours proposées à la création, même hors support, par exemple `SERVICES_MYSQL_PINNED_VERSIONS=5.6`. Une variable par moteur |
| `SERVICES_UPDATE_CHECK_INTERVAL` | `12` | Heures entre deux découvertes des versions et mises à jour (0 à 168 ; `0` : à la demande uniquement) |
| `SERVICES_MAX_RESOURCES_PER_INSTANCE` | `50` | Ressources par instance partagée (1 à 500) |
| `SERVICES_MAX_DEDICATED_INSTANCES` | `20` | Instances dédiées par moteur (1 à 200) |
| `SERVICES_ARCHIVE_ON_RETIRE` | `false` | Renommer les données d'une instance supprimée au lieu de les effacer |
| `SERVICES_EXPOSE_ALLOWED_CIDRS` | `127.0.0.1` | Adresses de l'hôte sur lesquelles un port peut être publié : CIDR ou adresses. `0.0.0.0` doit être seul dans la liste |
| `SERVICES_ALLOW_PUBLIC_BIND` | `false` | Obligatoire pour toute adresse hors boucle locale dans `SERVICES_EXPOSE_ALLOWED_CIDRS` |
| `SERVICES_TLS` | `auto` | `auto` : TLS exigé dès qu'une instance est publiée hors boucle locale ; `off` : TLS désactivé |
| `SERVICES_ALLOW_TLS_OPTIONAL` | `false` | Permet à une exposition de proposer TLS sans l'exiger (PostgreSQL, MySQL 8.4, MariaDB) |
| `SERVICES_PUBLIC_HOST` | vide | Nom d'hôte ou IP affiché aux clients et couvert par les certificats (sans schéma ni chemin) |
| `SERVICES_TLS_CERT_FILE` | vide | Certificat à utiliser à la place des certificats auto-signés. À définir avec la clé |
| `SERVICES_TLS_KEY_FILE` | vide | Clé de ce certificat |
| `SERVICES_S3_ADMIN_API_KEY` | vide | Vide : une instance Loch S3 par ressource (seul mode disponible). Définie : mode partagé, pas encore disponible, le moteur `s3` est désactivé |

La découverte des versions exige un accès HTTPS sortant vers `registry-1.docker.io`, `auth.docker.io`, `ghcr.io`, `mirror.gcr.io` et `endoflife.date`. Voir [Services managés](../admin/services.md).

## Variables supprimées {#removed}

L'API refuse de démarrer tant que l'une d'elles est définie, et indique ce qui la remplace.

| Variable | Remplacée par |
|---|---|
| `SERVICES_EXPOSED_PORTS`, `SERVICES_PUBLISH_ADDRESS` | Ports choisis dans le panel, dans les limites de `SERVICES_EXPOSE_ALLOWED_CIDRS` |
| `SERVICES_TLS_OPTIONAL` | TLS facultatif choisi par exposition, autorisé par `SERVICES_ALLOW_TLS_OPTIONAL` |
| `SERVICES_<ENGINE>_VERSIONS` | Versions découvertes sur les registres ; `SERVICES_<ENGINE>_PINNED_VERSIONS` |

## Connexion à Docker {#docker}

L'API se connecte à Docker avec l'environnement standard du client Docker (`DOCKER_HOST` et variables associées). Sans elles, elle utilise le socket local `/var/run/docker.sock`.

## Interface {#interface}

Le conteneur de l'interface web a ses propres variables (`API_URL`, `WS_URL`, `APP_NAME`, `LOGO_URL`, `FAVICON_URL`, `SUPPORT_PHONE`, `SUPPORT_URL`, `STATUS_URL`) : voir [Installation](../admin/installation.md#interface-settings).
