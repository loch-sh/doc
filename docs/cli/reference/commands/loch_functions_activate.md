---
title: "loch functions activate"
description: "Activate a kept deployment (rollback)"
sidebar_label: "functions activate"
slug: "loch-functions-activate"
---

## loch functions activate

Activate a kept deployment (rollback)

### Synopsis

Activate a kept deployment (see loch functions deployments): its files are verified first, then the function restarts on it.

```
loch functions activate <name> <deployment> [flags]
```

### Examples

```
  loch functions rollback thumbnail 20261106T101500Z-1a2b3c4d
```

### Options

```
  -h, --help   help for activate
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch functions](loch_functions.md)	 - Manage functions: handlers written for AWS Lambda (Node.js, Python, Go/Rust bootstraps) run on the endpoint

