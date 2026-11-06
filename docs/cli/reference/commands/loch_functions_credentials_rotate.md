---
title: "loch functions credentials rotate"
description: "Generate new invoke credentials (shown once; the old ones stop working)"
sidebar_label: "functions credentials rotate"
slug: "loch-functions-credentials-rotate"
---

## loch functions credentials rotate

Generate new invoke credentials (shown once; the old ones stop working)

### Synopsis

Generate a new bearer token (and, with SigV4 enabled, a new key pair). The old credentials stop working
and the function restarts. --sigv4 also accepts AWS SDK (SigV4) callers: the key pair is then readable by
the function code (it only lets the function invoke itself); --no-sigv4 removes it.
The credentials are printed on a terminal, or saved with --credentials-file in a new 0600 file.

```
loch functions credentials rotate <name> [--sigv4|--no-sigv4] [--credentials-file <path>] [flags]
```

### Examples

```
  loch functions credentials rotate thumbnail --credentials-file ~/.config/loch/thumbnail.credentials.json
```

### Options

```
      --credentials-file string   Save the invoke credentials (JSON) in this new file, mode 0600, instead of printing them
  -h, --help                      help for rotate
      --no-sigv4                  Remove the SigV4 key pair (bearer token only)
      --show-credentials          Print the credentials even when stdout is not a terminal
      --sigv4                     Also accept SigV4 callers (AWS SDKs): a key pair readable by the function code
  -y, --yes                       Skip the confirmation prompt
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch functions credentials](loch_functions_credentials.md)	 - Manage the invoke credentials of a function

