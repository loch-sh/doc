---
sidebar_position: 6
title: Utilisateurs SFTP
description: Créer, activer, désactiver et supprimer les comptes SFTP des sites hébergés, et réinitialiser leurs mots de passe.
---

# Utilisateurs SFTP

`loch sftp` gère les comptes SFTP qui donnent accès aux fichiers d'un site. Réservé aux admins ; le module SFTP doit être activé sur le serveur. Côté panel : [SFTP](/panel/hosting/sftp/).

## Commandes

| Commande | Rôle |
|---|---|
| `loch sftp sites` | Liste les sites. |
| `loch sftp users` | Liste les utilisateurs (`--site` pour filtrer). |
| `loch sftp create <utilisateur> --site <site>` | Crée un utilisateur dans un site. Demande le mot de passe. |
| `loch sftp reset-password <utilisateur>` | Définit un nouveau mot de passe. |
| `loch sftp enable <utilisateur>` | Active un utilisateur. |
| `loch sftp disable <utilisateur>` | Désactive un utilisateur : il ne peut plus se connecter. |
| `loch sftp delete <utilisateur>` | Supprime le compte. |

```bash
loch sftp create alice --site blog --subpath web/uploads
loch sftp users --site blog
loch sftp reset-password alice
loch sftp delete alice
```

## Droits

| Commande | Scope | Admin |
|---|---|---|
| `sites`, `users` | `sftp:read` | Oui |
| `create`, `reset-password`, `enable`, `disable`, `delete` | `sftp:write` | Oui |

## Bon à savoir

- `--subpath` limite l'utilisateur à un sous-dossier du site. Il ne peut plus changer ensuite.
- `create` accepte aussi une clé SSH (`--ssh-key`), des quotas et une limite de bande passante.
- `--password` apparaît dans la liste des processus : préférez la saisie interactive.
- La suppression d'un utilisateur conserve les fichiers de son dossier personnel.
