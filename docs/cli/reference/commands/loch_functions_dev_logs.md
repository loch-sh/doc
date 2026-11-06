---
title: "loch functions dev logs"
description: "Show the logs of a local function"
sidebar_label: "functions dev logs"
slug: "loch-functions-dev-logs"
---

## loch functions dev logs

Show the logs of a local function

### Synopsis

Show the stdout/stderr logs of a local function (written by the function code). NAME defaults to the name of the current directory.

```
loch functions dev logs [NAME] [-f] [flags]
```

### Options

```
  -f, --follow     Follow the logs
  -h, --help       help for logs
  -n, --tail int   Number of lines to show (0 = all)
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch functions dev](loch_functions_dev.md)	 - Run a function locally with Docker and the loch runtime (no panel)

