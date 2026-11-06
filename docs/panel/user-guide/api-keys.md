---
sidebar_position: 5
title: API keys
description: Create an API key for the Loch CLI or a script, limit its permissions and revoke it.
---

# API keys

An API key lets the [`loch` CLI](/cli/), its MCP server or a script act on the panel in your name. Every user manages their own keys on the **API keys** page (menu **Administration**).

## Create a key

1. Click **New key**.
2. Fill in the form:

| Field | Value |
|---|---|
| **Name** | A name to recognize the key, for example `CLI MacBook Pro` |
| **Validity period (days)** | From 1 to 365 days (90 by default) |
| **Permissions** | **All permissions**, or only the ones the key needs |

3. Click **Create**.
4. Copy the key, then click **I have copied my key**.

<Screenshot id="apikey-created" alt="The API key created dialog with the key and the CLI commands" />

:::warning
The key is shown only once. If you lose it, revoke it and create a new one.
:::

The dialog also shows the commands to configure the CLI:

```bash
loch config my-server --url https://panel-api.example.com
loch login
```

Paste the key when `loch login` asks for it. See [Install the CLI](/cli/install/).

## Permissions

A key never grants more than your profile: an administrator permission on a user's key gives nothing. Choose the narrowest set, for example **Read (list, inspect)** and **Logs (download, streaming)** for a monitoring script.

Full list: [API key scopes](../reference/scopes.md).

## The key list

<Screenshot id="apikeys-list" alt="The API keys page with the prefix, permissions and expiry of each key" />

| Column | Content |
|---|---|
| **Prefix** | The first characters of the key, to identify it |
| **Permissions** | The granted permissions, or **All** |
| **Expires on** | Expiry date; **(expired)** once it has passed |
| **Last used** | Last request made with the key |

To revoke a key, click **Revoke** on its row and confirm. This cannot be undone.

## Good to know

- 20 keys at most per user.
- A key created with a limited key cannot have more permissions than that key.
- Deleting your user revokes all your keys.
- Store the key like a password: anyone who has it acts as you.
