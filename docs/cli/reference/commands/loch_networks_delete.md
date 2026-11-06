---
title: "loch networks delete"
description: "Delete a private network without members"
sidebar_label: "networks delete"
slug: "loch-networks-delete"
---

## loch networks delete

Delete a private network without members

### Synopsis

Delete a private network. It must have no member left (detach them first); the network "services" cannot be deleted.

```
loch networks delete <name> [flags]
```

### Examples

```
  loch networks delete shop
```

### Options

```
  -h, --help   help for delete
  -y, --yes    Skip the confirmation prompt
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch networks](loch_networks.md)	 - Manage the private networks between sites and services

