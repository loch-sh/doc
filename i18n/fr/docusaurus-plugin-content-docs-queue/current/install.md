---
sidebar_position: 2
title: Installation
description: Déclarez le plugin dans la configuration statique de Traefik, fournissez-lui les fichiers de la page d'attente, puis ajoutez le middleware à un routeur.
---

# Installation

Le plugin s'exécute dans Traefik v3 (testé avec la v3.6). Rien à compiler : Traefik télécharge le code source et l'interprète.

## 1. Déclarer le plugin

Ajoutez le plugin du catalogue de plugins Traefik à la configuration statique, puis redémarrez Traefik.

```yaml title="traefik.yml"
experimental:
  plugins:
    queuemanager:
      moduleName: github.com/loch-sh/traefik-queue
      version: v1.0.1
```

La même chose en options de ligne de commande :

```bash
--experimental.plugins.queuemanager.moduleName=github.com/loch-sh/traefik-queue
--experimental.plugins.queuemanager.version=v1.0.1
```

`queuemanager` est le nom du plugin utilisé dans les options du middleware ci-dessous. Tous les exemples de cette documentation l'utilisent.

### Autre méthode : plugin local

Pour le développement ou un serveur sans accès à Internet, chargez le code source depuis le disque :

1. Copiez le dépôt dans `/plugins-local/src/github.com/loch-sh/traefik-queue` dans le conteneur Traefik (Traefik lit les plugins locaux dans `plugins-local/` de son répertoire de travail, `/` dans l'image officielle).
2. Déclarez-le :

   ```yaml title="traefik.yml"
   experimental:
     localPlugins:
       queuemanager:
         moduleName: github.com/loch-sh/traefik-queue
   ```

## 2. Fournir les fichiers de la page d'attente

Le plugin lit deux fichiers sur le système de fichiers de Traefik au démarrage du middleware :

| Fichier | Chemin par défaut | Source |
|---|---|---|
| Modèle HTML | `/var/public/queue-page.html` | `public/queue-page.html` dans le dépôt |
| Traductions | `/var/public/translations.json` | `public/translations.json` dans le dépôt |

Copiez-les à côté de votre fichier compose et montez le dossier dans Traefik :

```yaml
volumes:
  - ./public:/var/public:ro
```

Sans le modèle, les visiteurs reçoivent une page intégrée en anglais. Sans le fichier de traductions, les textes de la page sont vides. Autres chemins : options `queuePageFile` et `queueTranslationsFile`.

## 3. Ajouter le middleware

Déclarez un middleware avec le plugin, puis ajoutez-le aux routeurs à protéger.

**Labels Docker** :

```yaml
labels:
  - traefik.http.middlewares.queue.plugin.queuemanager.maxEntries=200
  - traefik.http.routers.my-app.middlewares=queue
```

**Provider fichier** :

```yaml title="dynamic.yml"
http:
  middlewares:
    queue:
      plugin:
        queuemanager:
          maxEntries: 200
  routers:
    my-app:
      rule: Host(`app.example.com`)
      service: my-app
      middlewares:
        - queue
```

Un routeur déclaré par labels Docker utilise ce middleware sous le nom `queue@file`.

Toutes les options : [Référence de la configuration](./reference/configuration.md).

## Essayer en local

Ce fichier compose laisse un seul visiteur à la fois accéder à un service de test.

```yaml title="compose.yaml"
services:
  traefik:
    image: traefik:v3.6
    command:
      - --providers.docker=true
      - --providers.docker.exposedbydefault=false
      - --entrypoints.web.address=:80
      - --experimental.plugins.queuemanager.moduleName=github.com/loch-sh/traefik-queue
      - --experimental.plugins.queuemanager.version=v1.0.1
    ports:
      - "80:80"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./public:/var/public:ro

  whoami:
    image: traefik/whoami
    labels:
      - traefik.enable=true
      - traefik.http.routers.whoami.rule=Host(`localhost`)
      - traefik.http.routers.whoami.entrypoints=web
      - traefik.http.routers.whoami.middlewares=queue
      - traefik.http.middlewares.queue.plugin.queuemanager.maxEntries=1
```

1. Placez `queue-page.html` et `translations.json` dans `./public`, puis lancez `docker compose up -d`.
2. Ouvrez `http://localhost` dans un navigateur : vous accédez au service.
3. Ouvrez-le dans une fenêtre privée : vous recevez la page d'attente. Fermez la première fenêtre : la fenêtre privée passe en une à deux minutes (60 secondes d'inactivité, puis le nettoyage et le rechargement suivants).

Le dépôt contient aussi un `docker-compose.yml` de développement, avec le plugin local. Certains de ses labels (`sessionTime`, `purgeTime`, `refreshInterval`) ne sont pas des options du plugin : utilisez les noms de la [Référence de la configuration](./reference/configuration.md).
