---
sidebar_position: 3
title: Stacks
description: See a compose stack as a whole, and start, stop or restart all its containers in one click.
---

# Stacks

A stack is a group of containers started by the same compose project. On the **Containers** page, each stack row has a **Stack details** button and the stack actions.

<Screenshot id="stack-actions" alt="Stack rows with the Stack details button and the Stop, Start and Restart the stack buttons" />

## Stack details

Click **Stack details** (the info icon) on a stack row to open its panel. The header shows the stack's status (green: all running, orange: some stopped, red: a container exited with an error) and the stack actions.

<Screenshot id="stack-panel" alt="The stack panel in full screen, on its Services tab" />

Under the tags, four figures: running containers, services, published ports and networks. A hosting site shows **Open the site**, a managed service **Open the service**.

| Tab | Content |
|---|---|
| **Services** | One row per container: service, state, image, ports, **Depends on**. Click the info icon, or double-click the row, to open the [container details](./containers.md#container-details) |
| **Compose** | Compose project, working directory, compose files and Compose version |
| **Networks** | Each network with the stack's containers attached to it and their addresses |
| **Mounts** | The mounts of every container; read-only ones are marked |
| **Monitoring** | Live CPU, RAM, network and PIDs of the running containers |

In **Ports**, a green tag is published on the host (`8081→80/tcp`); a grey one is only exposed to the other containers (`9000/tcp`).

<Screenshot id="stack-panel-compose" alt="The Compose tab of the stack panel with the project, working directory and compose files" />

The panel is built from the compose labels of the containers: a container started without compose shows only what Docker reports.

## Act on a stack

On the stack row, or at the top of the stack panel, click a button:

| Button | Shown when | Confirmation |
|---|---|---|
| **Start the stack** | At least one container is not running | No |
| **Stop the stack** | At least one container is running | Yes |
| **Restart the stack** | At least one container is running | Yes: its services are briefly unavailable |

A message confirms the result. If some containers fail, it says how many: for example **2 of 5 containers could not be processed**.

## How it works

- Containers start in dependency order (`depends_on`) and stop in reverse order. Containers at the same level run in parallel.
- **Start** skips containers already running; **Stop** skips those already stopped.
- One failure does not stop the other containers.
- With a user profile, only the containers granted to you are shown and processed.

## Good to know

- Containers under **No stack** have no compose project: they have no stack panel, act on them one by one.
- System containers and the panel's own API container are never processed.
- In the CLI: `loch stack start`, `loch stack stop` or `loch stack restart`, with the stack name or the active namespace. See the [`loch` CLI](/cli/).
