---
sidebar_position: 3
title: Connecter un assistant IA
description: Connecter Claude Code, Codex, OpenCode ou LM Studio à Loch Panel via le serveur MCP de loch.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Connecter un assistant IA

`loch mcp` lance un serveur MCP (transport stdio). Il utilise les endpoints et les clés API de votre configuration `loch`.

**Avant de commencer :** [installez `loch`](./install.md), puis lancez `loch config`, `loch use` et `loch login`. Indiquez le chemin complet du binaire (`which loch`) : les applications de bureau ne voient souvent pas votre `PATH`.

<Tabs groupId="ai-client">
<TabItem value="claude" label="Claude Code" default>

```bash
claude mcp add --scope user loch /usr/local/bin/loch mcp
```

Vérifiez avec `claude mcp list`.

</TabItem>
<TabItem value="codex" label="Codex">

```bash
codex mcp add loch -- /usr/local/bin/loch mcp
```

Ou dans `~/.codex/config.toml` :

```toml
[mcp_servers.loch]
command = "/usr/local/bin/loch"
args = ["mcp"]
```

</TabItem>
<TabItem value="opencode" label="OpenCode">

Dans `opencode.json` (projet) ou `~/.config/opencode/opencode.json` (global) :

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "loch": {
      "type": "local",
      "command": ["/usr/local/bin/loch", "mcp"],
      "enabled": true
    }
  }
}
```

</TabItem>
<TabItem value="lmstudio" label="LM Studio">

Dans LM Studio, ouvrez **Program → Install → Edit mcp.json**, puis ajoutez :

```json
{
  "mcpServers": {
    "loch": {
      "command": "/usr/local/bin/loch",
      "args": ["mcp"]
    }
  }
}
```

Choisissez un modèle qui sait appeler des outils.

</TabItem>
</Tabs>

## Essayer

Demandez à votre assistant : *« Liste mes endpoints loch, puis les stacks du premier. »*

## Bon à savoir

- L'assistant ne peut faire que ce que votre clé API autorise. Pour un usage courant, utilisez une clé aux scopes limités.
- Les mots de passe ne sont jamais renvoyés à l'assistant. Pour en réinitialiser un, lancez vous-même `loch services reset-password`.
- La suppression d'une base de données et la publication de ports se font uniquement avec la CLI. De même pour le déploiement des fonctions, leurs secrets et leurs identifiants : un assistant invoque seulement les fonctions marquées `--mcp-invocable`.
- `loch ai:howto` affiche ces instructions dans le terminal.

Liste complète des outils : [Outils MCP](./reference/mcp-tools.md).
