---
sidebar_position: 2
title: MCP tools
description: Every tool of the loch MCP server, with its parameters, the API key scope it needs and whether it is admin only.
---

# MCP tools

The full list of tools that `loch mcp` offers to an AI assistant. To set it up, see [Connect an AI assistant](../mcp.md).

## How the tools behave

- Every tool acts on the **active endpoint** of the `loch` configuration. Text results start with `[endpoint: <name>]`.
- Container tools act on the **active namespace**. No tool changes it: run `loch ns <stack>` in a terminal, or pass `stack` to `stack_action`.
- An argument the tool does not declare is refused with an error.
- **Kind** gives the MCP annotations: *Read* (read-only), *Write* (changes something, not destructive), *Destructive* (the client should ask for confirmation).
- Tools that name a container by its service name also need `containers:read`, to find it.
- Scopes are described in [API key scopes](/panel/reference/scopes/). An admin tool fails for a restricted user, whatever the scopes of the key.

## Endpoints and containers {#containers}

| Tool | Does | Main parameters | Kind | Scope |
|---|---|---|---|---|
| `list_endpoints` | Lists the configured endpoints and the active one. | – | Read | None |
| `switch_endpoint` | Switches the active endpoint. | `name` (required) | Write | None |
| `list_namespaces` | Lists the Docker Compose namespaces of the active endpoint. | – | Read | `containers:read` |
| `list_containers` | Lists the containers. | `showAll` (default `false`: active namespace only) | Read | `containers:read` |
| `inspect_container` | Shows the details of a container. | `container` (required) | Read | `containers:read` |
| `container_action` | Starts, stops or restarts a container. | `container`, `action`: `start`, `stop`, `restart` (required) | Destructive | `containers:actions` |
| `stack_action` | Starts, stops or restarts every container of a stack, in dependency order. | `action` (required), `stack` (default: active namespace) | Destructive | `containers:actions` |
| `get_log` | Returns the last lines of the container output, or of a file inside it. | `container` (required), `lines` (default 10), `filePath` | Read | `containers:logs` |
| `get_stats` | One-shot CPU, memory, network and PID snapshot of the running containers of the namespace. | `container` (default: all) | Read | `containers:stats` |
| `get_domains` | Lists the Traefik domains and their routing. | – | Read | Admin (profile only) |

## Scheduled jobs {#cron}

Not admin only. A restricted user can only target the containers it was granted. Scope `cron` for every tool.

| Tool | Does | Main parameters | Kind |
|---|---|---|---|
| `cron_list` | Lists the jobs. Last errors are hidden: see `cron_get`. | – | Read |
| `cron_get` | Shows a job: schedule, settings, last run. | `name` (name or ID, required), `reveal_secrets` (HTTP header values and body), `include_output` (last output and error) | Read |
| `cron_create` | Creates a job. Names are unique. | `name`, `schedule`, `type` (required); settings of the type (below); `enabled` (default `true`), `once` (default `false`) | Write |
| `cron_update` | Changes the given settings of a job. Changing `type` needs the settings of the new type. | `name` (required), `new_name`, any setting of `cron_create` | Destructive |
| `cron_toggle` | Enables or disables a job. | `name`, `enabled` (required) | Destructive |
| `cron_run` | Runs a job now, in the background. Check the result with `cron_get`. | `name` (required) | Destructive |
| `cron_delete` | Deletes a job (irreversible). | `name` (required) | Destructive |

Job settings:

| Parameter | Applies to | Value |
|---|---|---|
| `schedule` | All | 5-field cron expression (`0 3 * * *`) or descriptor (`@hourly`, `@daily`, `@every 5m`); at most once a minute |
| `type` | All | `docker_action`, `docker_exec` or `http` |
| `container` | `docker_action`, `docker_exec` | Container name, as in `list_containers` (e.g. `myapp-web-1`) |
| `action` | `docker_action` | `start`, `stop`, `restart`, `kill` |
| `command` | `docker_exec` | Array, run without shell, e.g. `["php", "bin/console", "app:sync"]`; use `["sh", "-c", "..."]` for shell syntax |
| `working_dir` | `docker_exec` | Working directory in the container |
| `url` | `http` | http(s) URL; private and internal addresses are blocked by the server |
| `method` | `http` | `GET` (default), `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS` |
| `headers` | `http` | Object `{Name: value}`; replaces all the headers |
| `body` | `http` | Request body |
| `timeout` | `http` | Seconds; `0` = server default; capped by the server (`CRON_HTTP_TIMEOUT`, 900 by default) |

The settings of another type are refused.

## Web hosting {#hosting}

Admin only; the hosting module must be enabled. Reading needs `hosting:read`; changing needs `hosting:read` and `hosting:write`. Panel side: [Web hosting](/panel/admin/hosting/).

| Tool | Does | Main parameters | Kind | Scope |
|---|---|---|---|---|
| `hosting_list` | Lists the sites with their status. | – | Read | `hosting:read` |
| `hosting_get` | Shows a site: settings, containers, routing, last operation and its compose output. Secrets are hidden by default. | `name` (required), `reveal_env` (environment values, snippets, routing rules), `include_compose` | Read | `hosting:read` |
| `hosting_templates` | Lists the templates, PHP versions with support dates, defaults and limits. | – | Read | `hosting:read` |
| `hosting_sites` | Lists the site directories and the site using each. | – | Read | `hosting:read` |
| `hosting_php_modules` | Lists the PHP modules of an image (pulls it on first use, may take a minute). | `template`: `php-nginx`, `php-apache`; `php_version` (required) | Read | `hosting:read` |
| `hosting_check_name` | Checks whether a name is free. | `name` (required) | Read | `hosting:read` |
| `hosting_create` | Creates and deploys a site. Unset settings take the server defaults. | `name`, `template`: `php-nginx`, `php-apache`, `nginx`, `apache` (required); `site`; settings (below) | Write | `hosting:write` |
| `hosting_update` | Changes the given settings and redeploys. Rolled back on failure. | `name` (required), `template`, `force`; settings (below); `add_domains`, `remove_domains`, `set_env`, `unset_env`, `disable_modules`, `enable_modules` | Destructive | `hosting:write` |
| `hosting_deploy` | Redeploys the site as it is on disk (recreates its container). | `name` (required), `pull`, `force`, `wait` | Destructive | `hosting:write` |
| `hosting_action` | Starts, stops or restarts the containers of a site. | `name`, `action`: `start`, `stop`, `restart` (required) | Destructive | `hosting:read` and `containers:actions` |
| `hosting_delete` | Deletes the site (containers and compose project). Files are kept unless `purge_data`. | `name` (required), `purge_data`, `wait` | Destructive | `hosting:write` |

Site settings of `hosting_create` and `hosting_update`:

| Parameter | Value |
|---|---|
| `php_version` | PHP version tag (see `hosting_templates`); PHP templates only |
| `document_root` | Web root relative to the site directory, e.g. `web/public`; empty = site root |
| `domains` | Domains served (on update, replaces the list: prefer `add_domains` / `remove_domains`) |
| `https`, `redirect_https` | Serve over HTTPS (once DNS points to the server); redirect HTTP to HTTPS (needs `https`) |
| `networks` | Networks the site joins (replaces the list). Default at creation: the server default (`["services"]` when the services module is enabled); `[]` joins none |
| `routing` | `default`, `symfony`, `laravel` (PHP templates) or `custom` |
| `routing_rules` | Custom rules (implies `routing=custom`): Nginx rules replacing `location /`, or Apache directives |
| `asset_dirs` | Symfony routing: directories served without front controller fallback (default `[bundles]`) |
| `memory_limit`, `web_memory_limit` | PHP `memory_limit` of the CLI (also the web default), and of web requests only |
| `upload_max_filesize`, `post_max_size` | PHP upload limits (`post_max_size` ≥ `upload_max_filesize`) |
| `max_execution_time` | PHP web request time limit in seconds (0–3600); the PHP CLI is never limited |
| `display_errors`, `timezone` | PHP `display_errors` and `date.timezone` |
| `disabled_modules` | PHP modules to disable (on update, replaces the list); `ioncube` is disabled by default |
| `memory_mb`, `cpus` | Container memory (MB) and CPU limits; `0` = unlimited |
| `env` | Environment variables `{NAME: value}` (on update, replaces them all: prefer `set_env` / `unset_env`) |
| `php_ini`, `vhost` | Extra php.ini directives and vhost directives (replace the snippet) |
| `wait` | Wait for the deployment (default `true`, at most 5 minutes) |

PHP settings are refused on the `nginx` and `apache` templates. When files were edited outside the panel, the tools fail: check them with `hosting_get`, then retry with `force=true` if overwriting them is acceptable.

## SFTP users {#sftp}

Admin only; the SFTP module must be enabled. Panel side: [SFTP](/panel/admin/sftp/).

| Tool | Does | Main parameters | Kind | Scope |
|---|---|---|---|---|
| `sftp_sites` | Lists the sites with their user count and used space. | – | Read | `sftp:read` |
| `sftp_users` | Lists the users: site, sub-directory, status, quotas, last login. Passwords are never returned. | `site` | Read | `sftp:read` |
| `sftp_create` | Creates a user in a site. The site directory is created with its first user. | `username`, `site` (required); `sub_path` (cannot change later), `password` (8 characters min; omit to generate one), `initialize_dirs` (default `true`), limits (below) | Write | `sftp:write` |
| `sftp_update` | Changes the given limits of a user. | `username` (required), limits (below) | Destructive | `sftp:write` |
| `sftp_reset_password` | Sets a new password. | `username` (required), `password` (omit to generate one) | Destructive | `sftp:write` |
| `sftp_set_enabled` | Enables or disables a user. A disabled user cannot log in. | `username`, `enabled` (required) | Write | `sftp:write` |
| `sftp_delete` | Deletes the account. The files of its home directory are kept. | `username` (required) | Destructive | `sftp:write` |

Limits: `public_key` (a single SSH key, replacing all of them; empty removes them on update), `quota_size_mb`, `quota_files`, `bandwidth_kbps` (`0` = unlimited), `require_password_change`.

A generated password is returned once as `generatedPassword` and enters the conversation transcript. Pass a password instead if that is not acceptable. A given password is never echoed.

## Databases and services {#services}

Admin only; the services module must be enabled. Panel side: [Services](/panel/admin/services/).

| Tool | Does | Main parameters | Kind | Scope |
|---|---|---|---|---|
| `services_engines` | Lists the engines, their options and versions, with their end of support. | – | Read | `services:read` |
| `services_instances` | Lists the instances: state, networks, published port, end of support, available update (dedicated ones). | – | Read | `services:read` |
| `services_databases` | Lists the resources of an instance. Passwords are never returned. | `instance` (required, e.g. `postgres-17`) | Read | `services:read` |
| `services_create_database` | Creates a database or RabbitMQ vhost with its user (shared engines), or a dedicated instance. | `engine`, `version`, `name` (required); `options` (`key=value,...`, dedicated engines), `legacy_auth`, `networks` | Write | `services:write` |
| `services_update_instance` | Changes the options of a dedicated instance, e.g. its memory. The instance is recreated; data kept. | `instance`, `options` (required) | Write | `services:write` |
| `services_upgrade_instance` | Updates a dedicated instance to the latest image of its current version. The instance is recreated; data kept. | `instance` (required) | Write | `services:write` |

Engines: `mysql`, `mariadb`, `postgres`, `mongodb`, `rabbitmq` (shared) and `redis`, `valkey`, `nats`, `s3`, `elasticmq`, `mosquitto` (dedicated). ElasticMQ has no authentication: it is refused on the `services` network, so pass a private network in `networks`.

Passwords are never returned to the assistant. The user runs `loch services reset-password <instance> <name>` in a terminal.

## Private networks {#networks}

Admin only. Panel side: [Networks](/panel/admin/networks/).

| Tool | Does | Main parameters | Kind | Scope |
|---|---|---|---|---|
| `networks_list` | Lists the private networks: members, state, reserved range overlap. | – | Read | `networks:read` |
| `networks_get` | Shows a network and its members. | `name` (required) | Read | `networks:read` |
| `networks_config` | Shows the creation rules: count and max, subnet sizes, private and reserved ranges. | – | Read | `networks:read` |
| `networks_docker_list` | Lists the Docker networks the panel did not create. | – | Read | `networks:read` |
| `networks_docker_get` | Shows one of those networks and its containers. | `network` (name, ID or unique ID prefix, required) | Read | `networks:read` |
| `networks_create` | Creates a private network. | `name` (required), `description`, `subnet` (cannot change later) | Write | `networks:write` |
| `networks_attach` | Connects a site or an instance. Its container is recreated. | `network`, `kind`: `site`, `instance`, `name` (required); `wait` (sites, default `true`) | Write | `networks:write` |
| `networks_detach` | Disconnects a site or an instance. An instance keeps at least one network. | same as `networks_attach` | Destructive | `networks:write` |

## CLI only

These actions have no MCP tool, on purpose or because they need a terminal:

| Domain | Commands |
|---|---|
| Files and shell | `loch cp`, `loch shell`, `loch proxy`, `loch logs -f` |
| Containers | `loch kill`, `loch rm`, `loch stats` (live; `get_stats` gives a snapshot) |
| Services | `loch services delete`, `reset-password`, `expose`, `unexpose`, `retire`, `purge`, `upgrade --version` |
| Networks | `loch networks update`, `delete`, `disconnect` |
| Users | `loch users …` |
| Namespaces | `loch ns <stack>` |
