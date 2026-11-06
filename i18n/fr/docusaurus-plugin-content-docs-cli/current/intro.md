---
sidebar_position: 1
slug: /
title: Loch CLI
description: La ligne de commande loch gère des serveurs Loch Panel et lance un serveur MCP pour les assistants IA.
---

# Loch CLI

`loch` gère un ou plusieurs serveurs Loch Panel depuis un terminal. Elle lance aussi un serveur MCP, pour qu'un assistant IA utilise les mêmes fonctionnalités.

1. [Installez `loch`](./install.md).
2. Connectez-la à un serveur :

   ```bash
   loch config mon-serveur --url https://panel-api.example.com   # ajouter un endpoint
   loch use mon-serveur                                          # le rendre actif
   loch login                                                    # coller une clé API
   loch ps                                                       # lister les conteneurs
   ```

3. Facultatif : [connectez un assistant IA](./mcp.md).

Toutes les commandes et options : [référence des commandes](/cli/reference/commands/loch/) (en anglais).

La configuration est enregistrée dans `~/.config/loch/config.yaml`. Créez la clé API dans le panel, rubrique **Clés API**. Ses scopes déterminent les commandes autorisées.
