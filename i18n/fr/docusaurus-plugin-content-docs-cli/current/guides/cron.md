---
sidebar_position: 4
title: Tâches planifiées
description: Lister, créer, lancer, activer, désactiver et supprimer des tâches planifiées (cron) depuis le terminal.
---

# Tâches planifiées

Une tâche planifiée s'exécute selon une planification cron. Ce peut être une action sur un conteneur (`docker_action`), une commande lancée dans un conteneur (`docker_exec`) ou une requête HTTP (`http`).

## Commandes

| Commande | Rôle |
|---|---|
| `loch cron ls` | Liste les tâches. |
| `loch cron create` | Crée une tâche. Demande le nom, le type, la planification et les réglages du type. |
| `loch cron run <nom\|id>` | Lance une tâche immédiatement. |
| `loch cron enable <nom\|id>` | Active une tâche. |
| `loch cron disable <nom\|id>` | Désactive une tâche. |
| `loch cron rm <nom\|id>` | Supprime une tâche. |

```bash
loch cron create
#   Name: nightly-sync
#   Type (docker_action / docker_exec / http): docker_exec
#   Schedule (cron expression or @every 5m): 0 3 * * *
#   Container: myapp-php-1
#   Command: php bin/console app:sync
loch cron run nightly-sync
```

## Droits

| Commande | Scope | Admin |
|---|---|---|
| `cron …` | `cron` | Non |

Un utilisateur restreint ne peut cibler que les conteneurs qu'un admin lui a attribués.

## Bon à savoir

- La planification est une expression cron à 5 champs (`0 3 * * *`) ou un descripteur (`@daily`, `@every 5m`).
- `docker_action` accepte `start`, `stop`, `restart` et `kill`.
- Pour modifier une tâche, passez par le panel ou l'outil MCP `cron_update` : voir [Outils MCP](../reference/mcp-tools.md#cron).
