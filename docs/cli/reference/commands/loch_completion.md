---
title: "loch completion"
description: "Generate shell completion script"
sidebar_label: "completion"
slug: "loch-completion"
---

## loch completion

Generate shell completion script

### Synopsis

Generate the autocompletion script for your shell.

To load completions:

```
bash:
  source <(loch completion bash)

zsh:
  echo 'source <(loch completion zsh)' >> ~/.zshrc

fish:
  loch completion fish | source

powershell:
  loch completion powershell | Out-String | Invoke-Expression
```

```
loch completion [bash|zsh|fish|powershell]
```

### Options

```
  -h, --help   help for completion
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch](loch.md)	 - CLI to manage your containers via Host Panel

