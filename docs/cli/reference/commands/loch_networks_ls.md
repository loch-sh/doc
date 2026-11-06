---
title: "loch networks ls"
description: "List the networks"
sidebar_label: "networks ls"
slug: "loch-networks-ls"
---

## loch networks ls

List the networks

### Synopsis

List the networks of the panel. --all also lists the other Docker networks (read-only: created by
Docker, by a compose project or by hand), as loch networks docker does.

```
loch networks ls [--all] [flags]
```

### Examples

```
  loch networks ls
  loch networks ls --all
```

### Options

```
  -a, --all    Also list the other Docker networks (read-only)
  -h, --help   help for ls
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch networks](loch_networks.md)	 - Manage the private networks between sites and services

