---
sidebar_position: 9
title: Utilisateurs
description: Lister les utilisateurs, donner ou retirer l'accès à des conteneurs, promouvoir ou rétrograder des admins et supprimer des utilisateurs.
---

# Utilisateurs

`loch users` gère les utilisateurs du panel. Réservé aux admins. Un utilisateur restreint ne voit et ne gère que les conteneurs qui lui ont été attribués.

## Commandes

| Commande | Rôle |
|---|---|
| `loch users ls` | Liste les utilisateurs. |
| `loch users grant <email> <conteneur...>` | Donne l'accès à un ou plusieurs conteneurs. |
| `loch users revoke <email> <conteneur...>` | Retire l'accès à un ou plusieurs conteneurs. |
| `loch users promote <email>` | Fait de l'utilisateur un admin. |
| `loch users demote <email>` | Rend l'utilisateur restreint. |
| `loch users rm <email>` | Supprime l'utilisateur. |

```bash
loch users grant alice@example.com myapp-web-1 myapp-php-1
loch users revoke alice@example.com myapp-php-1
loch users promote bob@example.com
```

## Droits

| Commande | Scope | Admin |
|---|---|---|
| `users …` | Aucun : seul le profil de l'utilisateur de la clé est vérifié | Oui |
| `domains` | Aucun : seul le profil de l'utilisateur de la clé est vérifié | Oui |

## Bon à savoir

- `loch domains` liste les domaines Traefik et leur routage.
- Une clé porte le profil de son utilisateur : un scope admin sur la clé d'un utilisateur restreint ne donne rien.
- Une clé ne peut créer que des clés dans la limite de ses propres scopes.
