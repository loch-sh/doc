---
sidebar_position: 1
slug: /
title: Loch Panel
description: Manage Docker containers, websites and managed services from a web interface, a CLI or an AI assistant.
---

# Loch Panel

Loch Panel manages a Docker server from a web interface, the `loch` CLI or an AI assistant (MCP).

| Component | Role |
|---|---|
| API | REST and WebSocket API, talks to Docker (port 2538) |
| Interface | Web interface, in 10 languages |
| [`loch` CLI](/cli/) | Command line and MCP server |

## Features

| Feature | Who | Enabled by |
|---|---|---|
| Containers and stacks: logs, shell, file copy, stats, actions | Every user, on the containers they are granted | Always on |
| Scheduled jobs | Every user | Always on |
| API keys | Every user, for their own keys | Always on |
| Users and access rights | Admin | Always on |
| Websites (PHP, Nginx, Apache) | Admin | `HOSTING_ENABLED` |
| SFTP accounts for websites | Admin | `SFTP_ENABLED` |
| Managed services: databases, cache, messaging, storage | Admin | `SERVICES_ENABLED` |
| Private networks | Admin | Always on (the shared `services` network needs the services module) |
| Audit trail | Admin | Always on |

A menu entry appears only when its feature is enabled.
