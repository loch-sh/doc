---
title: "loch functions egress"
description: "Allow or block the outbound Internet access of a function"
sidebar_label: "functions egress"
slug: "loch-functions-egress"
---

## loch functions egress

Allow or block the outbound Internet access of a function

### Synopsis

Turn the outbound Internet access of a function on or off (off by default). When on, the function also
reaches the host gateway, the LAN and metadata endpoints unless DOCKER-USER rules say otherwise.
The function restarts.

```
loch functions egress <name> on|off [flags]
```

### Options

```
  -h, --help   help for egress
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch functions](loch_functions.md)	 - Manage functions: handlers written for AWS Lambda (Node.js, Python, Go/Rust bootstraps) run on the endpoint

