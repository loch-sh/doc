---
title: "loch networks update"
description: "Change the description of a network"
sidebar_label: "networks update"
slug: "loch-networks-update"
---

## loch networks update

Change the description of a network

### Synopsis

Change the description of a network (empty clears it). Docker cannot change the subnet of a network.

```
loch networks update <name> --description TEXT [flags]
```

### Examples

```
  loch networks update shop --description "Shop, its queue and its cache"
```

### Options

```
      --description string   New description (empty clears it)
  -h, --help                 help for update
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch networks](loch_networks.md)	 - Manage the private networks between sites and services

