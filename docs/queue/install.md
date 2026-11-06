---
sidebar_position: 2
title: Install
description: Declare the plugin in the Traefik static configuration, give Traefik the waiting page files, then attach the middleware to a router.
---

# Install

The plugin runs inside Traefik v3 (tested with v3.6). There is nothing to compile: Traefik downloads the source and interprets it.

## 1. Declare the plugin

Add the plugin from the Traefik plugin catalog to the static configuration, then restart Traefik.

```yaml title="traefik.yml"
experimental:
  plugins:
    queuemanager:
      moduleName: github.com/loch-sh/traefik-queue
      version: v1.0.1
```

Same thing as command-line flags:

```bash
--experimental.plugins.queuemanager.moduleName=github.com/loch-sh/traefik-queue
--experimental.plugins.queuemanager.version=v1.0.1
```

`queuemanager` is the plugin name used in the middleware options below. Every example of this documentation uses it.

### Alternative: local plugin

For development or a host without Internet access, load the source code from disk instead:

1. Copy the repository to `/plugins-local/src/github.com/loch-sh/traefik-queue` inside the Traefik container (Traefik reads local plugins from `plugins-local/` in its working directory, `/` in the official image).
2. Declare it:

   ```yaml title="traefik.yml"
   experimental:
     localPlugins:
       queuemanager:
         moduleName: github.com/loch-sh/traefik-queue
   ```

## 2. Provide the waiting page files

The plugin reads two files from the Traefik filesystem when the middleware starts:

| File | Default path | Source |
|---|---|---|
| HTML template | `/var/public/queue-page.html` | `public/queue-page.html` in the repository |
| Translations | `/var/public/translations.json` | `public/translations.json` in the repository |

Copy them next to your compose file and mount the folder in Traefik:

```yaml
volumes:
  - ./public:/var/public:ro
```

Without the template, visitors get a built-in English page. Without the translations file, the page texts are empty. Other paths: options `queuePageFile` and `queueTranslationsFile`.

## 3. Attach the middleware

Declare a middleware with the plugin, then add it to the routers to protect.

**Docker labels**:

```yaml
labels:
  - traefik.http.middlewares.queue.plugin.queuemanager.maxEntries=200
  - traefik.http.routers.my-app.middlewares=queue
```

**File provider**:

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

A router declared with Docker labels uses this middleware as `queue@file`.

Every option: [Configuration reference](./reference/configuration.md).

## Try it locally

This compose file lets one visitor at a time reach a test service.

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

1. Put `queue-page.html` and `translations.json` in `./public`, then run `docker compose up -d`.
2. Open `http://localhost` in a browser: you reach the service.
3. Open it in a private window: you get the waiting page. Close the first window: the private window gets through within one to two minutes (60 seconds of inactivity, then the next cleanup and page refresh).

The repository also has a `docker-compose.yml` for development, with the local plugin. Some of its labels (`sessionTime`, `purgeTime`, `refreshInterval`) are not plugin options: use the names of the [Configuration reference](./reference/configuration.md).
