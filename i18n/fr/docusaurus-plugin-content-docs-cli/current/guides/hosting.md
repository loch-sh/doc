---
sidebar_position: 5
title: Hébergement web
description: Créer, modifier, redéployer et supprimer des sites PHP, Nginx et Apache depuis le terminal.
---

# Hébergement web

`loch hosting` (alias `loch host`) gère les sites hébergés par le panel : PHP avec Nginx ou Apache, ou sites statiques Nginx ou Apache. Réservé aux admins ; le module d'hébergement doit être activé sur le serveur. Côté panel : [Hébergement web](/panel/admin/hosting/).

## Commandes

| Commande | Rôle |
|---|---|
| `loch hosting list` | Liste les sites avec leur état, leurs domaines et le HTTPS. |
| `loch hosting get <nom>` | Affiche les réglages, les conteneurs et la dernière opération (`-v` : valeurs d'environnement, snippets, sortie compose). |
| `loch hosting templates` | Liste les templates, les versions PHP et les valeurs par défaut du serveur. |
| `loch hosting sites` | Liste les dossiers de sites et le site qui utilise chacun. |
| `loch hosting php-modules` | Liste les modules PHP d'une image. |
| `loch hosting check-name <nom>` | Vérifie qu'un nom est libre (code de sortie 1 sinon). |
| `loch hosting create <nom>` | Crée et déploie un site. Les réglages non fournis prennent les valeurs par défaut du serveur. |
| `loch hosting update <nom>` | Modifie uniquement les réglages fournis, puis redéploie. |
| `loch hosting deploy <nom>` | Redéploie le site tel qu'il est sur le disque (`--pull` : récupérer l'image d'abord). |
| `loch hosting delete <nom>` | Supprime le site. Les fichiers sont conservés, sauf avec `--purge-data`. |

```bash
loch hosting create blog --template php-nginx --php 8.4 \
  --domain blog.example.com --https --redirect-https
loch hosting update blog --domain www.blog.example.com --env APP_ENV=prod
loch hosting deploy blog --pull
loch hosting delete blog
```

`create`, `update`, `deploy` et `delete` attendent la fin de l'opération. En cas d'échec, elles affichent l'erreur et la fin de la sortie Docker Compose, et sortent avec le code 1. `--no-wait` rend la main dès le lancement de l'opération.

## Droits

| Commande | Scope | Admin |
|---|---|---|
| `list`, `get`, `templates`, `sites`, `php-modules`, `check-name` | `hosting:read` | Oui |
| `create`, `update`, `deploy`, `delete` | `hosting:read` et `hosting:write` | Oui |

## Bon à savoir

- Un `update` qui échoue restaure la configuration précédente.
- Si des fichiers ont été modifiés en dehors du panel, `update` et `deploy` refusent. `--force` les écrase (`update`) ou les déploie tels quels (`deploy`).
- `--network` choisit les réseaux que rejoint le site (répétable). Voir [Réseaux privés](./networks.md).
- Activez `--https` une fois que le DNS des domaines pointe vers le serveur.
- `--purge-data` supprime aussi le dossier du site : ses utilisateurs SFTP perdent leurs fichiers.
