---
sidebar_position: 2
title: Installation
description: Lancer Loch Deploy derrière Traefik et un proxy de socket Docker avec le fichier compose de référence, puis vérifier son état de santé.
---

# Installation

L'image de conteneur est la façon prise en charge de lancer Loch Deploy. Elle tourne sur `linux/amd64` et `linux/arm64` et embarque la CLI docker et le plugin Compose.

| Tag d'image | Désigne |
|---|---|
| `ghcr.io/loch-sh/deploy:v1.0.0` | Exactement la v1.0.0 |
| `ghcr.io/loch-sh/deploy:1.0` | Dernière 1.0.x |
| `ghcr.io/loch-sh/deploy:1` | Dernière 1.x |
| `ghcr.io/loch-sh/deploy:latest` | Dernière version publiée |

:::note
Prérequis : Docker avec Compose 2.23.1 ou plus récent, une instance GitLab (15.7+) joignable en HTTPS depuis l'hôte, et un nom DNS pour le serveur (`deploy.example.com` ci-dessous).
:::

## Topologie de référence

```text
Internet --:80/:443--> traefik --(web, partagé)----------------> stacks des projets
         --:8443------>   |
                          +--(deploy-internal, 172.31.250.0/29)--> deploy-server (172.31.250.3)
                          +--(socket-proxy, interne)--> docker-socket-proxy --> docker.sock
```

| Réseau | Membres | Pourquoi |
|---|---|---|
| `web` | Traefik, stacks des projets | Externe, créé au préalable. Seule entrée de `ALLOWED_EXTERNAL_NETWORKS` |
| `deploy-internal` | Traefik `172.31.250.2`, deploy-server `172.31.250.3` | IP fixes pour `TRUSTED_PROXIES` et la route. Pas interne : le serveur récupère les clés GitLab |
| `socket-proxy` | Traefik, `docker-socket-proxy` | Interne. Traefik lit une API Docker en lecture seule, jamais le socket brut |

La route du serveur est déclarée dans le file provider de Traefik, sur un entrypoint dédié `:8443`, vers l'IP fixe. Les conteneurs des projets n'alimentent que le provider Docker : leurs labels ne peuvent ni masquer ni casser cette route.

## Étapes

1. Créez le réseau partagé et les répertoires de données :

   ```bash
   docker network create web
   mkdir -p /data/compose /data/websites
   chown root:root /data/websites && chmod 0755 /data/websites
   ```

2. Téléchargez [docker-compose.example.yml](https://github.com/loch-sh/deploy/blob/v1.0.0/docker-compose.example.yml) sous le nom `docker-compose.yml`. Remplacez l'image de `deploy-server` par l'image publiée :

   ```yaml
   services:
     deploy-server:
       image: ghcr.io/loch-sh/deploy:1.0
   ```

3. Remplacez les valeurs d'exemple : noms d'hôte, URL GitLab, namespaces, IP des runners CI (dans `ALLOWED_IPS` et dans l'`ipAllowList` de Traefik), e-mail ACME. Vérifiez que `172.31.250.0/29` est libre sur l'hôte.

   ```yaml
   environment:
     DATA_DIR: "/app/data"
     GITLAB_ISSUER: "https://gitlab.example.com"
     GITLAB_AUDIENCE: "https://deploy.example.com"
     ALLOWED_NAMESPACES: "apps/atmosphere,infra"
     FORBIDDEN_TRAEFIK_HOSTS: "deploy.example.com,gitlab.example.com"
     ALLOWED_EXTERNAL_NETWORKS: "web"
     ALLOWED_IPS: "203.0.113.10"
     TRUSTED_PROXIES: "172.31.250.2"
   volumes:
     - ./data:/app/data
     - /var/run/docker.sock:/var/run/docker.sock
     - /data/compose:/data/compose     # même chemin des deux côtés
     - /data/websites:/data/websites   # même chemin des deux côtés
   ```

4. Démarrez la stack :

   ```bash
   docker compose up -d
   ```

5. Filtrez `:8443` sur le pare-feu de l'hôte pour que seules les adresses des runners CI y accèdent.

:::warning
- Ne publiez jamais `:8080` et n'ajoutez jamais de section `ports:` à `deploy-server`.
- Montez le socket Docker sans `:ro` : cette option protège le fichier du socket, pas l'API, elle ne protège donc rien.
- Montez `/data/compose` et `/data/websites` au même chemin dans le conteneur et sur l'hôte. La politique vérifie les sources de bind dans le conteneur, le démon de l'hôte les monte sur l'hôte.
:::

## Vérification

L'image a un healthcheck sur `GET /health`. Attendez que le conteneur soit `healthy`, puis lisez les journaux de démarrage :

```bash
docker compose ps deploy-server
docker compose logs deploy-server | grep -E 'starting|listening|WARN'
```

Un avertissement sur `ALLOWED_IPS` ou `ALLOWED_NAMESPACES` signale une liste d'autorisation désactivée : corrigez-la avant que les pipelines appellent le serveur. Le serveur s'arrête au démarrage si une variable est invalide ou si GitLab est injoignable.

Depuis une adresse de runner CI :

```bash
curl https://deploy.example.com:8443/health
# {"status":"ok"}
```

## Binaire

Chaque [release GitHub](https://github.com/loch-sh/deploy/releases/tag/v1.0.0) fournit `deploy-server_v1.0.0_linux_amd64.tar.gz` et `deploy-server_v1.0.0_linux_arm64.tar.gz`, avec un fichier `.sha256` et une attestation de provenance. L'archive contient le binaire statique, `LICENSE`, `README.md`, `SECURITY.md`, `docker-compose.example.yml` et `examples/`. Le binaire a besoin de la CLI `docker` avec le plugin Compose dans son `PATH`, et de la même arborescence que l'image. Définissez `DATA_DIR` explicitement : sa valeur par défaut, `./data`, est relative au répertoire courant.

```bash
sha256sum -c deploy-server_v1.0.0_linux_amd64.tar.gz.sha256
gh attestation verify deploy-server_v1.0.0_linux_amd64.tar.gz --repo loch-sh/deploy
```

Ensuite : [sécurisez la configuration](./admin/configuration.md), puis [déployez depuis GitLab CI](./guides/gitlab-ci.md). Si des stacks tournent déjà sur l'hôte, [migrez-les](./guides/migrate-from-ssh.md) avant d'ouvrir `:8443`.
