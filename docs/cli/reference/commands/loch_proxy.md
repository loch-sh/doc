---
title: "loch proxy"
description: "Forward local ports to a container via WebSocket tunnel (i.e. get container port 80 on port 8000 in your machine)"
sidebar_label: "proxy"
slug: "loch-proxy"
---

## loch proxy

Forward local ports to a container via WebSocket tunnel (i.e. get container port 80 on port 8000 in your machine)

### Synopsis

Create a TCP-over-WebSocket tunnel to a container.
Remote ports become accessible locally, even if they are not exposed.

Examples:
  loch proxy postgres 5432:15432
  loch proxy myapp 8080:8080 5432:15432

```
loch proxy <service> <distant:local> [<distant:local> ...] [flags]
```

### Options

```
  -h, --help   help for proxy
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch](loch.md)	 - CLI to manage your containers via Host Panel

