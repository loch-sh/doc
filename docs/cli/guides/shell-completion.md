---
sidebar_position: 10
title: Shell completion
description: Enable tab completion of loch commands, container names and namespaces in bash, zsh, fish or PowerShell.
---

# Shell completion

`loch completion <shell>` prints a completion script. Once loaded, Tab completes commands, flags, container names, namespaces and endpoints.

| Shell | Load it |
|---|---|
| bash | `source <(loch completion bash)` |
| zsh | `echo 'source <(loch completion zsh)' >> ~/.zshrc` |
| fish | `loch completion fish \| source` |
| PowerShell | `loch completion powershell \| Out-String \| Invoke-Expression` |

To load it in every bash session, add the line to `~/.bashrc`. For fish, save it once:

```bash
loch completion fish > ~/.config/fish/completions/loch.fish
```

## Good to know

- Container names and namespaces are read from the active endpoint: completion needs a working API key with `containers:read`.
- No scope is needed to generate the script.
