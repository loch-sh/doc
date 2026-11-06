---
title: "loch functions dev runtime"
description: "Show the loch function runtime binary loch functions dev uses, and where it comes from"
sidebar_label: "functions dev runtime"
slug: "loch-functions-dev-runtime"
---

## loch functions dev runtime

Show the loch function runtime binary loch functions dev uses, and where it comes from

### Synopsis

Show the loch function runtime binary of loch functions dev: --runtime-binary, else LOCH_RUNTIME_BINARY (both used
as given, flagged when their sha256 is not a trusted release), else the newest release this loch build trusts
(--runtime-version for another), from the cache directory when it is there and its sha256 matches. Nothing is
downloaded unless --download. It also prints the commands to verify the release by hand (shasum, cosign
verify-blob with the signing identity built into loch, gh attestation verify).

```
loch functions dev runtime [flags]
```

### Options

```
      --arch string              Architecture: amd64 or arm64 (default: the Docker daemon's)
      --download                 Download and verify the release when it is not cached
  -h, --help                     help for runtime
  -o, --output string            Output format: table or json (default "table")
      --runtime-binary string    A local build of the loch function runtime (default: $LOCH_RUNTIME_BINARY)
      --runtime-version string   Trusted release vX.Y.Z (default: the newest)
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch functions dev](loch_functions_dev.md)	 - Run a function locally with Docker and the loch runtime (no panel)

