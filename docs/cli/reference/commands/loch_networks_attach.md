---
title: "loch networks attach"
description: "Connect a site or a service instance to a network"
sidebar_label: "networks attach"
slug: "loch-networks-attach"
---

## loch networks attach

Connect a site or a service instance to a network

### Synopsis

Connect a hosted site or a service instance to a network. Its container is recreated: a few seconds of
downtime for it only. A site is redeployed (followed until it finishes, unless --no-wait); an instance is
recreated before the command returns (up to a few minutes).

```
loch networks attach <network> --site <stack> | --instance <instance> [flags]
```

### Examples

```
  loch networks attach shop --site shop
  loch networks attach shop --instance elasticmq-jobs
```

### Options

```
  -h, --help              help for attach
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

