---
sidebar_position: 4
title: Tâches planifiées
description: Lister, créer, lancer, activer, désactiver et supprimer des tâches planifiées (cron) depuis le terminal.
---

# Tâches planifiées

Une tâche planifiée s'exécute selon une planification cron. Ce peut être une action sur un conteneur (`docker_action`), une commande lancée dans un conteneur (`docker_exec`) une requête HTTP (`http`) ou une invocation de fonction (`function_invoke`, réservée aux admins).

## Commandes

| Commande | Rôle |
|---|---|
| `loch cron ls` | Liste les tâches, la raison pour laquelle le panel en a désactivé une et la dernière exécution sautée. |
| `loch cron create` | Crée une tâche. Demande ce que `--name`, `--schedule` et `--function` ne donnent pas. |
| `loch cron run <nom\|id>` | Lance une tâche immédiatement. |
| `loch cron enable <nom\|id>` | Active une tâche. |
| `loch cron disable <nom\|id>` | Désactive une tâche. |
| `loch cron rm <nom\|id>` | Supprime une tâche. |

```bash
loch cron create
#   Name: nightly-sync
#   Type (docker_action / docker_exec / http / function_invoke): docker_exec
#   Schedule (cron expression or @every 5m): 0 3 * * *
#   Container: myapp-php-1
#   Command: php bin/console app:sync
loch cron run nightly-sync
loch cron create --name nightly-report --schedule '0 3 * * *' --function report --event-json '{"period": "day"}'
```

## Droits

| Commande | Scope | Admin |
|---|---|---|
| `cron …` | `cron` | Non |
| `cron create --function`, `cron run` sur une tâche `function_invoke` | `cron` et `functions:invoke` | Oui |

Un utilisateur restreint ne peut cibler que les conteneurs qu'un admin lui a attribués.

## Bon à savoir

- La planification est une expression cron à 5 champs (`0 3 * * *`) ou un descripteur (`@daily`, `@every 5m`).
- `docker_action` accepte `start`, `stop`, `restart` et `kill`.
- Une tâche `function_invoke` conserve le statut, la durée et la taille de la réponse, jamais la réponse. L'événement fait 64 Kio au plus (`--event <fichier>` s'il contient des jetons) ; 5 tâches au plus par fonction. Voir [Fonctions](./functions.md).
- Pour modifier une tâche, passez par le panel ou l'outil MCP `cron_update` : voir [Outils MCP](../reference/mcp-tools.md#cron).
