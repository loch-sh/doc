---
title: "loch functions invoke"
description: "Invoke a function with a JSON event and print its response"
sidebar_label: "functions invoke"
slug: "loch-functions-invoke"
---

## loch functions invoke

Invoke a function with a JSON event and print its response

### Synopsis

Invoke a function. The event is one JSON value (at most 6 MiB): --event &lt;file> (- for stdin),
--event-json, stdin when it is not a terminal (empty: \{\}), or \{\}. An event holding tokens belongs in a
file or on stdin, not in --event-json (shell history, process list).
The response (payload) is printed on stdout, the end of the invocation's logs and the status on stderr.
Both were written by the function code: control characters are replaced unless --raw (payload
bytes exactly as returned, e.g. to redirect them to a file). The exit code is 1 when the function
returned an error (functionError) or the invocation failed.

```
loch functions invoke <name> [--event file.json | --event-json '<json>' | < event.json] [flags]
```

### Examples

```
  loch functions invoke thumbnail --event-json '{"key": "photos/cat.jpg"}'
  loch functions invoke thumbnail --event s3-put.json
  echo '{}' | loch functions invoke thumbnail --raw > response.json
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

* [loch functions](loch_functions.md)	 - Manage functions: handlers written for AWS Lambda (Node.js, Python, Go/Rust bootstraps) run on the endpoint

