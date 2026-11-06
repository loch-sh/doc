---
sidebar_position: 10
title: Complétion du shell
description: Activer la complétion par Tab des commandes loch, des noms de conteneurs et des namespaces dans bash, zsh, fish ou PowerShell.
---

# Complétion du shell

`loch completion <shell>` affiche un script de complétion. Une fois chargé, Tab complète les commandes, les options, les noms de conteneurs, les namespaces et les endpoints.

| Shell | Chargement |
|---|---|
| bash | `source <(loch completion bash)` |
| zsh | `echo 'source <(loch completion zsh)' >> ~/.zshrc` |
| fish | `loch completion fish \| source` |
| PowerShell | `loch completion powershell \| Out-String \| Invoke-Expression` |

Pour la charger dans chaque session bash, ajoutez la ligne à `~/.bashrc`. Pour fish, enregistrez-la une fois :

```bash
loch completion fish > ~/.config/fish/completions/loch.fish
```

## Bon à savoir

- Les noms de conteneurs et les namespaces sont lus sur l'endpoint actif : la complétion demande une clé API valide avec `containers:read`.
- Générer le script ne demande aucun scope.
