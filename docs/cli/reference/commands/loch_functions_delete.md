---
title: "loch functions delete"
description: "Delete a function, its code, secrets and credentials"
sidebar_label: "functions delete"
slug: "loch-functions-delete"
---

## loch functions delete

Delete a function, its code, secrets and credentials

### Synopsis

Delete a function: its container, compose project, every deployment, secrets, invoke credentials and
its network fn-&lt;name> (kept while other members are attached). This cannot be undone: type the name to
confirm, or pass --yes.
--purge deletes a function whose compose project was edited outside the panel (shown as modified) or
whose reference is unreadable, without running any of its files.

```
loch functions delete <name> [--purge] [--yes] [flags]
```

### Examples

```
  loch functions delete thumbnail
  loch functions delete thumbnail --purge --yes
```

### Options

```
  -h, --help    help for delete
      --purge   Delete a function edited outside the panel, without running its files
  -y, --yes     Skip the confirmation (typing the name)
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch functions](loch_functions.md)	 - Manage functions: handlers written for AWS Lambda (Node.js, Python, Go/Rust bootstraps) run on the endpoint

