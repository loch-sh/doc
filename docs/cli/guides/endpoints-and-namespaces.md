---
sidebar_position: 1
title: Endpoints and namespaces
description: Add Loch Panel servers to loch, switch between them, save an API key and choose the active Docker Compose stack.
---

# Endpoints and namespaces

An **endpoint** is a Loch Panel server. A **namespace** is a Docker Compose stack on that server. Most commands act on the active endpoint and the active namespace.

## Add a server

1. Add the endpoint. On a terminal, `loch` then asks for the API key (leave it empty to skip):

   ```bash
   loch config my-server --url https://panel.example.com
   ```

2. Make it the active endpoint:

   ```bash
   loch use my-server
   ```

3. Save the API key of the active endpoint, if you skipped it:

   ```bash
   loch login
   ```

Create the API key in the panel, under **API keys**. Its scopes decide which commands work: see [API key scopes](/panel/reference/scopes/).

## Commands

| Command | Does |
|---|---|
| `loch config <name>` | Adds or changes an endpoint (`--url`, `--name`). Without flags, shows it. |
| `loch config ls` | Lists the endpoints. The active one is marked. |
| `loch use <name>` | Switches the active endpoint. Without argument, lists the endpoints. |
| `loch login` | Saves an API key for the active endpoint (hidden input). |
| `loch ns` | Lists the namespaces of the active endpoint. |
| `loch ns <stack>` | Switches the active namespace. |

```bash
loch config ls
loch use staging
loch ns            # list the stacks
loch ns blog       # work on the "blog" stack
```

## Permissions

| Command | Scope |
|---|---|
| `config`, `use`, `login` | None (local configuration) |
| `ns` | `containers:read` |

## Good to know

- The configuration is stored in `~/.config/loch/config.yaml`, readable by your user only.
- A namespace is the `com.docker.compose.project` label of the containers. Containers without it are in `default`.
- The active namespace is shared by all endpoints: run `loch ns` again after `loch use`.
- `--token` also sets the key, but it is visible in the process list. Prefer the prompt or `loch login`.
