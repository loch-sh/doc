---
title: "loch functions update"
description: "Change the resources, handler or variables of a function"
sidebar_label: "functions update"
slug: "loch-functions-update"
---

## loch functions update

Change the resources, handler or variables of a function

### Synopsis

Change a function: only the given flags change. --env sets a variable (others are kept), --unset-env
removes one. A running function restarts with the new configuration; a stopped one stays stopped.
--mcp-invocable / --no-mcp-invocable decide whether AI agents (loch mcp) may invoke it.
Secrets are changed with loch functions secrets set. On the custom runtime (provided), --handler "" resets
the handler to its default, bootstrap.

```
loch functions update <name> [--memory] [--timeout] [--cpus] [--tmp-size] [--handler] [--env K=V]... [--unset-env K]... [flags]
```

### Examples

```
  loch functions update thumbnail --memory 1G --timeout 60
  loch functions update thumbnail --env LOG_LEVEL=debug --unset-env OLD_FLAG
```

### Options

```
      --cpus float              CPU limit (0.1 to 16, in steps of 0.01)
      --env stringArray         Set a variable NAME=value (repeatable)
      --handler string          New handler (provided: "" resets it to bootstrap)
  -h, --help                    help for update
      --mcp-invocable           Let AI agents (loch mcp, functions_invoke) invoke it
      --memory string           Memory limit in MB, or with a unit (512M, 1G); see loch functions config
      --no-mcp-invocable        Stop letting AI agents invoke it
      --timeout int             Timeout of an invocation in seconds (1 to 900)
      --tmp-size string         Size of /tmp in MB, or with a unit; counted in the memory limit
      --unset-env stringArray   Remove a variable (repeatable)
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch functions](loch_functions.md)	 - Manage functions: handlers written for AWS Lambda (Node.js, Python, Go/Rust bootstraps) run on the endpoint

