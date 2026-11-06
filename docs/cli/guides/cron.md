---
sidebar_position: 4
title: Scheduled jobs
description: List, create, run, enable, disable and delete scheduled jobs (cron) from the terminal.
---

# Scheduled jobs

A scheduled job runs on a cron schedule. It can be a container action (`docker_action`), a command run in a container (`docker_exec`) or an HTTP request (`http`).

## Commands

| Command | Does |
|---|---|
| `loch cron ls` | Lists the jobs. |
| `loch cron create` | Creates a job. Asks for the name, type, schedule and settings of the type. |
| `loch cron run <name\|id>` | Runs a job now. |
| `loch cron enable <name\|id>` | Enables a job. |
| `loch cron disable <name\|id>` | Disables a job. |
| `loch cron rm <name\|id>` | Deletes a job. |

```bash
loch cron create
#   Name: nightly-sync
#   Type (docker_action / docker_exec / http): docker_exec
#   Schedule (cron expression or @every 5m): 0 3 * * *
#   Container: myapp-php-1
#   Command: php bin/console app:sync
loch cron run nightly-sync
```

## Permissions

| Command | Scope | Admin |
|---|---|---|
| `cron …` | `cron` | No |

A restricted user can only target the containers an admin granted.

## Good to know

- The schedule is a 5-field cron expression (`0 3 * * *`) or a descriptor (`@daily`, `@every 5m`).
- `docker_action` accepts `start`, `stop`, `restart` and `kill`.
- To change a job, use the panel or the `cron_update` MCP tool: see [MCP tools](../reference/mcp-tools.md#cron).
