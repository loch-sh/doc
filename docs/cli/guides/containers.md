---
sidebar_position: 2
title: Containers
description: List, inspect, start, stop, restart, kill and remove containers, act on a whole stack and watch live resource usage.
---

# Containers

These commands act on the containers of the active namespace (see [Endpoints and namespaces](./endpoints-and-namespaces.md)). Name a container by its Compose service name, e.g. `php`. A restricted user only sees the containers an admin granted.

## Commands

| Command | Does |
|---|---|
| `loch ps` | Lists the containers of the active namespace (`-a`: all namespaces). |
| `loch inspect <service>` | Shows the full details of a container. |
| `loch start <service...>` | Starts one or more containers. |
| `loch stop <service...>` | Stops one or more containers. |
| `loch restart <service...>` | Restarts one or more containers. |
| `loch kill <service...>` | Kills one or more containers. |
| `loch rm <service...>` | Removes one or more containers. |
| `loch stack start\|stop\|restart [stack]` | Acts on every container of a stack, in dependency order (`depends_on`). Default: the active namespace. |
| `loch stats [service...]` | Live CPU, memory, network and PID usage. Default: every running container of the namespace. |

```bash
loch ps
loch inspect php
loch restart php worker
loch stack restart blog
loch stats
```

## Permissions

| Command | Scope |
|---|---|
| `ps`, `inspect` | `containers:read` |
| `start`, `stop`, `restart`, `kill`, `rm`, `stack` | `containers:actions` |
| `stats` | `containers:stats` |

Commands that take a service name also need `containers:read`, to find the container.

## Good to know

- `loch stack` refuses the `default` namespace: it only works on Docker Compose stacks.
- Admins can list the Traefik domains with `loch domains`.
