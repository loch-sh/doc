---
title: "loch functions secrets set"
description: "Set a secret (value typed without echo, or read from stdin)"
sidebar_label: "functions secrets set"
slug: "loch-functions-secrets-set"
---

## loch functions secrets set

Set a secret (value typed without echo, or read from stdin)

### Synopsis

Set a secret of a function. The value is typed without echo on a terminal, or read from stdin (a
trailing newline is removed): never from the command line. One line of UTF-8, at most 4096 bytes.
A running function restarts to use it.

```
loch functions secrets set <name> <NAME> [flags]
```

### Examples

```
  loch functions secrets set thumbnail AWS_SECRET_ACCESS_KEY
  pass show s3/thumbnail | loch functions secrets set thumbnail AWS_SECRET_ACCESS_KEY
```

### Options

```
  -h, --help   help for set
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch functions secrets](loch_functions_secrets.md)	 - List the secret names of a function, set or remove a secret

