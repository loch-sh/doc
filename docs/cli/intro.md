---
sidebar_position: 1
slug: /
title: Loch CLI
description: The loch command line manages Loch Panel servers and runs an MCP server for AI assistants.
---

# Loch CLI

`loch` manages one or more Loch Panel servers from a terminal. It also runs an MCP server, so an AI assistant can use the same features.

1. [Install `loch`](./install.md).
2. Connect it to a server:

   ```bash
   loch config my-server --url https://panel-api.example.com   # add an endpoint
   loch use my-server                                          # make it active
   loch login                                                  # paste an API key
   loch ps                                                     # list containers
   ```

3. Optional: [connect an AI assistant](./mcp.md).

Every command and flag: [command reference](./reference/commands/loch.md).

The configuration is stored in `~/.config/loch/config.yaml`. Create the API key in the panel, under **API keys**. Its scopes decide which commands work.
