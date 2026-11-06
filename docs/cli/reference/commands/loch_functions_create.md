---
title: "loch functions create"
description: "Create a function (invoke credentials shown once)"
sidebar_label: "functions create"
slug: "loch-functions-create"
---

## loch functions create

Create a function (invoke credentials shown once)

### Synopsis

Create a function: a handler written for AWS Lambda (Node.js or Python), or a compiled bootstrap on the custom
runtime (provided, version al2023: Go, Rust, ...), run in the AWS Lambda base image published by AWS,
in its own private network fn-&lt;name> (never the shared services network). Nothing runs until code is
deployed (--code here, or loch functions deploy).

Names: 1 to 21 lowercase letters, digits or dashes, starting with a letter. Handler: &lt;file>.&lt;function>
for Node.js (index.handler), &lt;module>.&lt;function> for Python (lambda_function.lambda_handler), required for
both; optional for provided (default bootstrap, exported as _HANDLER): the code must hold an executable named
bootstrap at its root, a Linux binary of the endpoint's architecture (loch functions config), e.g. for Go:
  CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -tags lambda.norpc -o bootstrap .

Secrets (--secret NAME, repeatable) are typed without echo, or read from stdin one line per name in
order; --secret-file NAME=path reads one from a file. Values are never taken from the command line.

The invoke credentials (bearer token, and a SigV4 key pair with --sigv4) are shown once: on a terminal,
or saved with --credentials-file in a new 0600 file (outside the code directory, e.g. ~/.config/loch/).
--mcp-invocable lets AI agents using loch mcp invoke the function (off by default).
--egress gives outbound Internet access: it also reaches the host gateway, the LAN and metadata endpoints
unless DOCKER-USER rules say otherwise.

```
loch functions create <name> --runtime nodejs|python|provided --version <v> [--handler <handler>] [flags]
```

### Examples

```
  loch functions create thumbnail --runtime nodejs --version 22 --handler index.handler --code ./build
  loch functions create resize --runtime python --version 3.13 --handler app.handler --memory 1G \
      --env BUCKET=media --secret AWS_SECRET_ACCESS_KEY --network media \
      --credentials-file ~/.config/loch/resize.credentials.json
  loch functions create hello-go --runtime provided --version al2023 --code ./hello-go   # ./hello-go/bootstrap
```

### Options

```
      --code string               Code to deploy after the creation: a directory (zipped here) or a zip file
      --cpus float                CPU limit (0.1 to 16, in steps of 0.01)
      --credentials-file string   Save the invoke credentials (JSON) in this new file, mode 0600, instead of printing them
      --egress                    Allow outbound Internet access (off by default)
      --env stringArray           Variable NAME=value (repeatable; not secret: shown by loch functions show)
      --handler string            Handler: index.handler (Node.js), lambda_function.lambda_handler (Python); optional for provided (default bootstrap)
  -h, --help                      help for create
      --mcp-invocable             Let AI agents (loch mcp, functions_invoke) invoke it (off by default)
      --memory string             Memory limit in MB, or with a unit (512M, 1G); see loch functions config
      --network stringArray       Private network to join besides fn-<name> (repeatable; never services)
      --no-mcp-invocable          Do not let AI agents invoke it (the default)
      --runtime string            Runtime: nodejs, python or provided (custom runtime: Go, Rust, a bootstrap)
      --secret stringArray        Secret NAME, its value typed without echo or read from stdin (repeatable)
      --secret-file stringArray   Secret NAME=path, its value read from the file (repeatable)
      --show-credentials          Print the credentials even when stdout is not a terminal
      --sigv4                     Also accept SigV4 callers (AWS SDKs): a key pair readable by the function code
      --timeout int               Timeout of an invocation in seconds (1 to 900)
      --tmp-size string           Size of /tmp in MB, or with a unit; counted in the memory limit
      --version string            Runtime version (see loch functions config), e.g. 22, 3.13 or al2023
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch functions](loch_functions.md)	 - Manage functions: handlers written for AWS Lambda (Node.js, Python, Go/Rust bootstraps) run on the endpoint

