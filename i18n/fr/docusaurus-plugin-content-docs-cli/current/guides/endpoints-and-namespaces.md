---
sidebar_position: 1
title: Endpoints et namespaces
description: Ajouter des serveurs Loch Panel à loch, passer de l'un à l'autre, enregistrer une clé API et choisir la stack Docker Compose active.
---

# Endpoints et namespaces

Un **endpoint** est un serveur Loch Panel. Un **namespace** est une stack Docker Compose de ce serveur. La plupart des commandes agissent sur l'endpoint actif et le namespace actif.

## Ajouter un serveur

1. Ajoutez l'endpoint. Dans un terminal, `loch` demande ensuite la clé API (laissez vide pour passer) :

   ```bash
   loch config mon-serveur --url https://panel.example.com
   ```

2. Rendez-le actif :

   ```bash
   loch use mon-serveur
   ```

3. Si vous avez passé l'étape de la clé, enregistrez-la pour l'endpoint actif :

   ```bash
   loch login
   ```

Créez la clé API dans le panel, rubrique **Clés API**. Ses scopes déterminent les commandes autorisées : voir [Scopes des clés API](/panel/reference/scopes/).

## Commandes

| Commande | Rôle |
|---|---|
| `loch config <nom>` | Ajoute ou modifie un endpoint (`--url`, `--name`). Sans option, l'affiche. |
| `loch config ls` | Liste les endpoints. L'actif est marqué. |
| `loch use <nom>` | Change d'endpoint actif. Sans argument, liste les endpoints. |
| `loch login` | Enregistre une clé API pour l'endpoint actif (saisie masquée). |
| `loch ns` | Liste les namespaces de l'endpoint actif. |
| `loch ns <stack>` | Change de namespace actif. |

```bash
loch config ls
loch use staging
loch ns            # lister les stacks
loch ns blog       # travailler sur la stack « blog »
```

## Droits

| Commande | Scope |
|---|---|
| `config`, `use`, `login` | Aucun (configuration locale) |
| `ns` | `containers:read` |

## Bon à savoir

- La configuration est enregistrée dans `~/.config/loch/config.yaml`, lisible par votre seul utilisateur.
- Un namespace correspond au label `com.docker.compose.project` des conteneurs. Les conteneurs sans ce label sont dans `default`.
- Le namespace actif est commun à tous les endpoints : relancez `loch ns` après `loch use`.
- `--token` enregistre aussi la clé, mais elle apparaît dans la liste des processus. Préférez la saisie interactive ou `loch login`.
