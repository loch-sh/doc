---
sidebar_position: 3
title: Files, shell, logs and tunnels
description: Copy files to and from a container, open a shell, read logs and log files, and reach a container port from your machine.
---

# Files, shell, logs and tunnels

These commands work on a container of the active namespace. All traffic goes through the panel over HTTPS (WebSocket), so they work behind a firewall or a corporate proxy.

## Copy files

Use `service:path` for the container side. Files and directories are copied as a tar stream.

```bash
loch cp php:/var/www/html ./html      # container to local
loch cp ./file.txt php:/tmp/file.txt  # local to container
```

## Open a shell

```bash
loch shell php
```

The terminal supports resizing and passes Ctrl+C to the container.

## Read logs

| Command | Shows |
|---|---|
| `loch logs <service>` | The container output (stdout/stderr) and exits. |
| `loch logs -f <service>` | Follows the output in real time. |
| `loch logs <service> <file>` | The last 1000 lines of a file inside the container. |
| `loch logs -f <service> <file>` | Follows the file. |

`-n <lines>` limits the number of lines (`0` = all).

```bash
loch logs -n 200 php
loch logs -f php /var/log/app.log
```

Reading a file needs the `tail` command in the container.

## Open a tunnel to a port

`loch proxy` forwards a container port to a local port, even if the port is not published.

```bash
loch proxy postgres 5432:15432        # container port 5432 on localhost:15432
psql -h 127.0.0.1 -p 15432 -U myuser mydb
```

Give several `remote:local` pairs to open several ports over one connection. Stop the tunnel with Ctrl+C.

## Permissions

| Command | Scope |
|---|---|
| `cp` | `containers:cp` |
| `shell` | `containers:shell` |
| `logs` | `containers:logs` |
| `proxy` | `containers:proxy` |

Each command also needs `containers:read`, to find the container.

## Good to know

- A tunnel accepts at most 10 port mappings and 256 simultaneous connections.
- `loch cp` to a container fails if the destination directory does not exist.
- A shell runs any command in the container: give `containers:shell` only to keys that need it.
