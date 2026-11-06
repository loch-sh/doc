---
title: "loch functions networks"
description: "Show or replace the networks of a function"
sidebar_label: "functions networks"
slug: "loch-functions-networks"
---

## loch functions networks

Show or replace the networks of a function

### Synopsis

Without --network, show the networks of a function. With --network (repeatable), replace them: the
function restarts on the new list (removed networks are cut first). Keep its own network fn-&lt;name> to
stay reachable by name; never services. Members of these networks can call the function with its
credentials.

```
loch functions networks <name> [--network n]... [flags]
```

### Examples

```
  loch functions networks thumbnail --network fn-thumbnail --network media
```

### Options

```
  -h, --help                  help for networks
      --network stringArray   Network of the function (repeatable; replaces the list)
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch functions](loch_functions.md)	 - Manage functions: handlers written for AWS Lambda (Node.js, Python, Go/Rust bootstraps) run on the endpoint

