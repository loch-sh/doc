---
title: "loch networks detach"
description: "Disconnect a site or a service instance from a network"
sidebar_label: "networks detach"
slug: "loch-networks-detach"
---

## loch networks detach

Disconnect a site or a service instance from a network

### Synopsis

Disconnect a hosted site or a service instance from a network: it no longer reaches (or is no longer
reachable from) the other members. Its container is recreated. An instance keeps at least one network.

```
loch networks detach <network> --site <stack> | --instance <instance> [flags]
```

### Examples

```
  loch networks detach services --site blog
  loch networks detach shop --instance elasticmq-jobs
```

### Options

```
  -h, --help              help for detach
  -i, --instance string   Service instance (e.g. postgres-17, see loch services instances)
      --no-wait           Site: return as soon as its redeployment is started
  -s, --site string       Hosted site (stack name, see loch hosting ls)
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch networks](loch_networks.md)	 - Manage the private networks between sites and services

