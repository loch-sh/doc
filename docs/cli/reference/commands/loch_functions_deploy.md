---
title: "loch functions deploy"
description: "Deploy code (a directory, zipped here, or a zip file) and activate it"
sidebar_label: "functions deploy"
slug: "loch-functions-deploy"
---

## loch functions deploy

Deploy code (a directory, zipped here, or a zip file) and activate it

### Synopsis

Deploy the code of a function: a zip of the handler and its dependencies (never built on the server).
A directory is zipped here, deterministically: entries sorted, fixed dates, normalized modes (files 0644,
or 0755 when executable; directories 0755), .git skipped; relative symlinks staying inside the directory
are kept, absolute or escaping ones are refused; *.credentials.json files are skipped and dotenv files
warned about. The zip is reproducible with the same loch build (the API identifies a deployment by the
hash of its extracted tree). Install the dependencies first (npm ci, pip install -t .).
The new deployment is activated at once; the previous ones are kept for a rollback (loch functions activate).

```
loch functions deploy <name> <dir|zip> [flags]
```

### Examples

```
  loch functions deploy thumbnail ./build
  loch functions deploy thumbnail function.zip
```

### Options

```
  -h, --help   help for deploy
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch functions](loch_functions.md)	 - Manage functions: handlers written for AWS Lambda (Node.js, Python, Go/Rust bootstraps) run on the endpoint

