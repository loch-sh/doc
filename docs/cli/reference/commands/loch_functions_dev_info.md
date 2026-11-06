---
title: "loch functions dev info"
description: "Print the endpoint, credentials and invoke commands of a local function"
sidebar_label: "functions dev info"
slug: "loch-functions-dev-info"
---

## loch functions dev info

Print the endpoint, credentials and invoke commands of a local function

### Synopsis

Print the endpoint on 127.0.0.1, the generated credentials and ready-to-use curl / aws commands of a local
function. The credentials only reach this function. NAME defaults to the name of the current directory.

```
loch functions dev info [NAME] [flags]
```

### Options

```
  -h, --help            help for info
  -o, --output string   Output format: table or json (default "table")
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch functions dev](loch_functions_dev.md)	 - Run a function locally with Docker and the loch runtime (no panel)

