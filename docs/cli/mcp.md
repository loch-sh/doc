---
sidebar_position: 3
title: Connect an AI assistant
description: Connect Claude Code, Codex, OpenCode or LM Studio to Loch Panel through the loch MCP server.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Connect an AI assistant

`loch mcp` starts an MCP server (stdio transport). It uses the endpoints and API keys of your `loch` configuration.

**Before you start:** [install `loch`](./install.md), then run `loch config`, `loch use` and `loch login`. Use the full path of the binary (`which loch`): desktop apps often do not see your `PATH`.

<Tabs groupId="ai-client">
<TabItem value="claude" label="Claude Code" default>

```bash
claude mcp add --scope user loch /usr/local/bin/loch mcp
```

Check with `claude mcp list`.

</TabItem>
<TabItem value="codex" label="Codex">

```bash
codex mcp add loch -- /usr/local/bin/loch mcp
```

Or in `~/.codex/config.toml`:

```toml
[mcp_servers.loch]
command = "/usr/local/bin/loch"
args = ["mcp"]
```

</TabItem>
<TabItem value="opencode" label="OpenCode">

In `opencode.json` (project) or `~/.config/opencode/opencode.json` (global):

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

In LM Studio, open **Program → Install → Edit mcp.json**, then add:

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

Choose a model that supports tool calls.

</TabItem>
</Tabs>

## Try it

Ask your assistant: *"List my loch endpoints, then the stacks on the first one."*

## Good to know

- The assistant can do only what your API key allows. Use a key with limited scopes for daily work.
- Passwords are never returned to the assistant. To reset one, run `loch services reset-password` yourself.
- Deleting a database and publishing ports are CLI-only. So are deploying functions, their secrets and credentials: an assistant only invokes the functions marked `--mcp-invocable`.
- `loch ai:howto` prints these instructions in the terminal.

Full list of tools: [MCP tools](./reference/mcp-tools.md).
