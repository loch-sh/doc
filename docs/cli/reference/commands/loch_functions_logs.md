---
title: "loch functions logs"
description: "Show the logs (stdout and stderr) of a function"
sidebar_label: "functions logs"
slug: "loch-functions-logs"
---

## loch functions logs

Show the logs (stdout and stderr) of a function

### Synopsis

Show the stdout/stderr logs of the function container (admins only). The lines were written by the
function code. -f follows them.

```
loch functions logs <name> [-f] [-n lines] [flags]
```

### Options

```
  -f, --follow     Follow the logs
  -h, --help       help for logs
  -n, --tail int   Number of lines to show (0 = all; 100 when following)
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch functions](loch_functions.md)	 - Manage functions: handlers written for AWS Lambda (Node.js, Python, Go/Rust bootstraps) run on the endpoint

