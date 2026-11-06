---
title: "loch networks docker"
description: "Show the other Docker networks (read-only)"
sidebar_label: "networks docker"
slug: "loch-networks-docker"
---

## loch networks docker

Show the other Docker networks (read-only)

### Synopsis

Without argument, list the Docker networks the panel did not create: Docker's own networks (bridge,
host, none), those of compose projects (CI/CD stacks, the reverse proxy...) and those created by hand.
With a name or an ID prefix, show one of them and its containers. Read-only: the panel never changes them.

```
loch networks docker [<name-or-id>] [flags]
```

### Examples

```
  loch networks docker
  loch networks docker traefik_default
  loch networks docker 3f2a9c
```

### Options

```
  -h, --help   help for docker
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch networks](loch_networks.md)	 - Manage the private networks between sites and services

