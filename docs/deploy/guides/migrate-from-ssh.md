---
sidebar_position: 3
title: Migrate from SSH deployment
description: Move stacks deployed over SSH to Loch Deploy - import ownership, stop the legacy stack, move data to the service/name layout and redeploy.
---

# Migrate from SSH deployment

Stacks started by an SSH workflow are unknown to the server: `/exec` and `DELETE /stack` refuse them with `403`, and their bind mounts usually do not follow the `<key>/<service>/<name>` layout, so `/deploy` refuses them with `409`. Run the steps in order. Host commands run as root; paths assume the default `/data/websites` and `/data/compose`.

:::note
`<key>` is `<CI_PROJECT_PATH_SLUG>-<environment slug>`, for example `group-app-staging`. See [Stack key and layout](../reference/stack-key-and-layout.md).
:::

## Part 1: the server (once)

1. [Install the server](../install.md) and set `ALLOWED_NAMESPACES`, `ALLOWED_IPS`, `FORBIDDEN_TRAEFIK_HOSTS` and `ALLOWED_EXTERNAL_NETWORKS`. Keep `:8443` closed on the host firewall.

## Part 2: inventory and ownership (once)

2. List the legacy stacks and their compose project names:

   ```bash
   docker ps -a --format '{{.Label "com.docker.compose.project"}}\t{{.Names}}\t{{.Status}}' | sort
   ```

   The server finds a stack's containers by the label `com.docker.compose.project=<key>` or by a name starting with `<key>-` or `<key>_`. Note any stack running under another project name: you stop it by hand at step 6.

3. List each stack's bind mounts. Every source that is not exactly `/data/websites/<key>/<service>/<name>` is data to move at step 7:

   ```bash
   for id in $(docker ps -aq --filter label=com.docker.compose.project=<key>); do
     docker inspect --format '{{.Name}}{{range .Mounts}}{{if eq .Type "bind"}} {{.Source}} -> {{.Destination}}{{end}}{{end}}' "$id"
   done
   ```

4. Import the ownership of every stack, server stopped. Write `./data/legacy.json` (`./data` is the host side of `DATA_DIR`):

   ```json
   {
     "group-app-staging": {"project_id": "42", "project_path": "group/app", "environment": "staging"}
   }
   ```

   ```bash
   docker compose stop deploy-server
   docker run --rm -e DATA_DIR=/app/data -v "$PWD/data:/app/data" \
     ghcr.io/loch-sh/deploy:1.0 -import-registry /app/data/legacy.json
   docker compose start deploy-server
   ```

   Run these commands from the directory that holds the server's `docker-compose.yml`. The import is all-or-nothing. Exit status `0` on success, `1` on failure, `2` on invalid arguments. Format: [Stack key and layout](../reference/stack-key-and-layout.md#registry-json).

5. Open `:8443` to the CI runner addresses and set `DEPLOY_URL` in the pipelines.

:::warning
Never run `-import-registry` while the server is running: it keeps the registry in memory and overwrites the import on its next write.
:::

## Part 3: each stack (downtime from step 6 to step 9)

6. Adapt the compose template and the pipeline ([compose rules](./compose-file.md), [pipeline](./gitlab-ci.md)): bind sources `<key>/<service>/<name>`, one `/directories` entry per directory, `web` declared `external: true`, no `build:`. Disable the SSH jobs. Then stop the legacy stack with the pipeline's stop job (`DELETE /stack`). It removes every container of the stack and deletes `/data/compose/<key>/`: back up the legacy compose and env files first. If `down` fails on the legacy compose file, stop the stack on the host instead (`docker compose -p <key> down --remove-orphans` from `/data/compose/<key>/`, then `docker rm -f` of what remains). Stop stacks noted at step 2 by hand (`docker compose -p <name> down`). Check that nothing is left:

   ```bash
   docker ps -a --filter label=com.docker.compose.project=<key>
   docker ps -a --filter 'name=^/?<key>[-_]'
   ```

7. Move the data to the `<service>/<name>` layout:

   ```bash
   cd /data/websites/<key>
   mkdir -p api
   mv jwt log storage api/     # was <key>/jwt, <key>/log, <key>/storage
   ```

8. Reset the intermediate levels to `root:root 0755`. Check for symlinks first: `chown` follows them.

   ```bash
   find /data/websites/<key> -maxdepth 2 -type l     # must print nothing
   chown root:root /data/websites /data/websites/<key> /data/websites/<key>/*/
   chmod 0755      /data/websites /data/websites/<key> /data/websites/<key>/*/
   ```

9. Deploy through the pipeline. `/directories` applies `mode`, `user` and `group` to each `<name>` directory, then `/deploy` answers `204`. A `409` means a legacy container is still there (back to step 6); a `400` lists the template's violations.

`DELETE /stack` releases the ownership: run steps 7 to 9 without delay, the key is unclaimed until the next successful deploy.

## Verify

```bash
for id in $(docker ps -aq --filter label=com.docker.compose.project=<key>); do
  docker inspect --format '{{.Name}}{{range .Mounts}}{{if eq .Type "bind"}} {{.Source}}{{end}}{{end}}' "$id"
done
stat -c '%U:%G %a %n' /data/websites/<key> /data/websites/<key>/*/
grep -A3 '"<key>"' ./data/registry.json
```

The deploy's audit entry (`"msg":"audit"`, `"path":"/deploy"`) has status `204` and no `legacy_mounts`.

Source procedure: [Migration runbook](https://github.com/loch-sh/deploy/blob/v1.0.0/README.md#migration-runbook).
