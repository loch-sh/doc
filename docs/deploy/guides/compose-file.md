---
sidebar_position: 2
title: Write a compliant compose file
description: Write a docker-compose.yml that passes the Loch Deploy policy - names, bind mounts, env files, networks and Traefik labels.
---

# Write a compliant compose file

The server renders your compose file with `docker compose config`, then checks it against the deployment policy. Any violation refuses the deploy with `400` and the list of violations (at most 20). The running stack is not touched.

In the examples below, the stack key is `group-app-staging` and `WEBSITES_BASE` is `/data/websites`.

## Example

```yaml
services:
  api:
    image: registry.example.com/group/app/api:1.4.2
    env_file: api.env
    volumes:
      # created by POST /directories {"service":"api","name":"storage"}
      - /data/websites/group-app-staging/api/storage:/app/storage
      - cache:/app/var/cache
    networks: [default, web]
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.group-app-staging-api.rule=Host(`app-staging.example.com`)"
      - "traefik.http.routers.group-app-staging-api.entrypoints=websecure"
      - "traefik.http.routers.group-app-staging-api.tls=true"
      - "traefik.http.services.group-app-staging-api.loadbalancer.server.port=8080"

volumes:
  cache: {}

networks:
  web:
    external: true   # listed in ALLOWED_EXTERNAL_NETWORKS
```

## Rules

| Topic | Do | Refused |
|---|---|---|
| Images | `image:` from a registry | `build:` (`up` runs with `--no-build`) |
| Privileges | Nothing special | `privileged`, `cap_add`, `devices`, `security_opt`, `sysctls`, `pid`/`ipc`/`uts`/`userns_mode`, `network_mode: host` |
| Bind mounts | Exactly `WEBSITES_BASE/<key>/<service>/<name>`, created by `/directories` | `<key>` or `<key>/<service>` alone, deeper paths, single files, relative paths like `./data`, symlinks |
| Named volumes | Let compose name them, or `name:` starting with `<key>_` | `external`, a driver other than `local`, `driver_opts` |
| Networks | Own networks, or an external network listed in `ALLOWED_EXTERNAL_NETWORKS` | Other external networks, a driver other than `bridge` |
| `container_name` | Omit it, or start it with `<key>-` | Any other name |
| Env files, configs, secrets | Plain names of files uploaded with the deploy (`env_file: api.env`) | Other paths, `external` |
| Labels | Traefik HTTP labels | `com.docker.compose.*`, `traefik.tcp.*`, `traefik.udp.*`, router `priority` |
| Traefik rules | Explicit `Host()`, optionally `&& PathPrefix()` | `PathPrefix()` alone, `HostRegexp()`, `\|\|` with a non-host rule, `!`, a host in `FORBIDDEN_TRAEFIK_HOSTS` |
| File structure | One file | `include`, `extends`, `label_file`, a top-level `name:` other than the key |

Full rule list: [Deployment policy](../reference/deployment-policy.md).

## Bind mounts

1. Create each directory with `/directories` before the deploy, with the numeric uid/gid the image runs as:

   ```json
   {"entries": [{"service": "api", "name": "storage", "user": "1000", "group": "1000", "mode": "0750"}]}
   ```

2. Mount the whole `<name>` directory: `/data/websites/group-app-staging/api/storage`.

`<service>` is only a path segment: another service (a worker) may mount `api/storage`. Ship single files as `configs` instead of binding them.

## Good to know

- Prefix Traefik router and service names with the stack key: these names are global to Traefik and two stacks would collide.
- `ports:`, resource limits, `user:` and the image source are not restricted. Ask the admin before publishing a port.
- `${VAR}` interpolation reads the server's environment, not the job's. Put values in the uploaded env files.
- Uploaded `.env` files may not set `COMPOSE_*` or `DOCKER_*` variables.
- Env file names: an optional leading dot, then up to 128 letters, digits, `.`, `_` or `-`, starting with a letter or digit. `docker-compose.yml` and `*.tmp` are reserved.
