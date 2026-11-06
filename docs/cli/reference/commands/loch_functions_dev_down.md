---
title: "loch functions dev down"
description: "Remove a local function: container, network and cache files"
sidebar_label: "functions dev down"
slug: "loch-functions-dev-down"
---

## loch functions dev down

Remove a local function: container, network and cache files

### Synopsis

Remove a local function: its container and network (only objects labeled sh.loch.dev-function), and its variables and credentials files. NAME defaults to the name of the current directory.

```
loch functions dev down [NAME] [flags]
```

### Options

```
  -h, --help   help for down
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch functions dev](loch_functions_dev.md)	 - Run a function locally with Docker and the loch runtime (no panel)

