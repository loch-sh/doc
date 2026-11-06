---
title: "loch functions secrets"
description: "List the secret names of a function, set or remove a secret"
sidebar_label: "functions secrets"
slug: "loch-functions-secrets"
---

## loch functions secrets

List the secret names of a function, set or remove a secret

### Synopsis

List the secret names of a function (values are never shown, nor readable back).
Secrets are environment variables kept out of compose.yaml (a 0400 file of the panel).

```
loch functions secrets <name> [flags]
```

### Options

```
  -h, --help   help for secrets
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch functions](loch_functions.md)	 - Manage functions: handlers written for AWS Lambda (Node.js, Python, Go/Rust bootstraps) run on the endpoint
* [loch functions secrets rm](loch_functions_secrets_rm.md)	 - Remove a secret
* [loch functions secrets set](loch_functions_secrets_set.md)	 - Set a secret (value typed without echo, or read from stdin)

