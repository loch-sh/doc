---
title: "loch functions show"
description: "Show a function: configuration, variables, secret names, deployments, endpoint"
sidebar_label: "functions show"
slug: "loch-functions-show"
---

## loch functions show

Show a function: configuration, variables, secret names, deployments, endpoint

### Synopsis

Show a function. Secret values and invoke credentials are never shown (they cannot be read back:
rotate the credentials with loch functions credentials rotate).

```
loch functions show <name> [flags]
```

### Options

```
  -h, --help            help for show
  -o, --output string   Output format: table or json (default "table")
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch functions](loch_functions.md)	 - Manage functions: handlers written for AWS Lambda (Node.js, Python, Go/Rust bootstraps) run on the endpoint

