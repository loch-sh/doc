---
sidebar_position: 4
title: Scheduled jobs
description: List, create, run, enable, disable and delete scheduled jobs (cron) from the terminal.
---

# Scheduled jobs

A scheduled job runs on a cron schedule. It can be a container action (`docker_action`), a command run in a container (`docker_exec`), an HTTP request (`http`) or a function invocation (`function_invoke`, admin only).

## Commands

| Command | Does |
|---|---|
| `loch cron ls` | Lists the jobs, why the panel disabled one and when a run was last skipped. |
| `loch cron create` | Creates a job. Asks for what `--name`, `--schedule` and `--function` do not give. |
| `loch cron run <name\|id>` | Runs a job now. |
| `loch cron enable <name\|id>` | Enables a job. |
| `loch cron disable <name\|id>` | Disables a job. |
| `loch cron rm <name\|id>` | Deletes a job. |

```bash
loch cron create
#   Name: nightly-sync
#   Type (docker_action / docker_exec / http / function_invoke): docker_exec
#   Schedule (cron expression or @every 5m): 0 3 * * *
#   Container: myapp-php-1
#   Command: php bin/console app:sync
loch cron run nightly-sync
loch cron create --name nightly-report --schedule '0 3 * * *' --function report --event-json '{"period": "day"}'
```

## Permissions

| Command | Scope | Admin |
|---|---|---|
| `cron …` | `cron` | No |
| `cron create --function`, `cron run` on a `function_invoke` job | `cron` and `functions:invoke` | Yes |

A restricted user can only target the containers an admin granted.

## Good to know

- The schedule is a 5-field cron expression (`0 3 * * *`) or a descriptor (`@daily`, `@every 5m`).
- `docker_action` accepts `start`, `stop`, `restart` and `kill`.
- A `function_invoke` job keeps the status, duration and response size, never the response. The event is at most 64 KiB (`--event <file>` for one holding tokens); at most 5 jobs per function. See [Functions](./functions.md).
- To change a job, use the panel or the `cron_update` MCP tool: see [MCP tools](../reference/mcp-tools.md#cron).
