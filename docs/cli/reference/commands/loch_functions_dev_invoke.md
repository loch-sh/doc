---
title: "loch functions dev invoke"
description: "Invoke a local function (docker exec, no credential)"
sidebar_label: "functions dev invoke"
slug: "loch-functions-dev-invoke"
---

## loch functions dev invoke

Invoke a local function (docker exec, no credential)

### Synopsis

Invoke a local function through docker exec of the runtime's invoke subcommand, as the panel does:
same event rules and output as loch functions invoke (payload on stdout, log tail and status on stderr,
exit code 1 on a function error). NAME defaults to the name of the current directory.

```
loch functions dev invoke [NAME] [--event file.json | --event-json '<json>' | < event.json] [flags]
```

### Examples

```
  loch functions dev invoke --event-json '{"name": "world"}'
  loch functions dev invoke thumbnail --event s3-put.json --raw > response.json
```

### Options

```
      --event string        File holding the JSON event (- for stdin)
      --event-json string   The JSON event itself
  -h, --help                help for invoke
  -o, --output string       Output format: table or json (default "table")
      --raw                 Write the payload bytes exactly as returned (no newline added, no character replaced)
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch functions dev](loch_functions_dev.md)	 - Run a function locally with Docker and the loch runtime (no panel)

