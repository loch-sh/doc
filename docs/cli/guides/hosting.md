---
sidebar_position: 5
title: Web hosting
description: Create, change, redeploy and delete PHP, Nginx and Apache websites from the terminal.
---

# Web hosting

`loch hosting` (alias `loch host`) manages the hosted websites of the panel: PHP with Nginx or Apache, or static Nginx or Apache sites. Admin only; the hosting module must be enabled on the server. Panel side: [Web hosting](/panel/hosting/sites/).

## Commands

| Command | Does |
|---|---|
| `loch hosting list` | Lists the sites with their status, domains and HTTPS. |
| `loch hosting get <name>` | Shows the settings, containers and last operation (`-v`: environment values, snippets, compose output). |
| `loch hosting templates` | Lists the templates, PHP versions and server defaults. |
| `loch hosting sites` | Lists the site directories and the site using each. |
| `loch hosting php-modules` | Lists the PHP modules of an image. |
| `loch hosting check-name <name>` | Checks that a name is free (exit code 1 if not). |
| `loch hosting create <name>` | Creates and deploys a site. Unset settings take the server defaults. |
| `loch hosting update <name>` | Changes the given settings only, then redeploys. |
| `loch hosting deploy <name>` | Redeploys the site as it is on disk (`--pull`: pull the image first). |
| `loch hosting delete <name>` | Deletes the site. The files are kept unless `--purge-data`. |

```bash
loch hosting create blog --template php-nginx --php 8.4 \
  --domain blog.example.com --https --redirect-https
loch hosting update blog --domain www.blog.example.com --env APP_ENV=prod
loch hosting deploy blog --pull
loch hosting delete blog
```

`create`, `update`, `deploy` and `delete` wait for the end of the operation. On failure, they print the error and the end of the Docker Compose output, and exit with code 1. `--no-wait` returns as soon as the operation starts.

## Permissions

| Command | Scope | Admin |
|---|---|---|
| `list`, `get`, `templates`, `sites`, `php-modules`, `check-name` | `hosting:read` | Yes |
| `create`, `update`, `deploy`, `delete` | `hosting:read` and `hosting:write` | Yes |

## Good to know

- A failed `update` restores the previous configuration.
- If files were edited outside the panel, `update` and `deploy` refuse. `--force` overwrites them (`update`) or deploys them as they are (`deploy`).
- `--network` sets the networks the site joins (repeatable). See [Networks](./networks.md).
- Turn on `--https` once the DNS of the domains points to the server.
- `--purge-data` also deletes the site directory: its SFTP users lose their files.
