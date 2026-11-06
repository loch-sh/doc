---
sidebar_position: 2
title: Utilisateurs et API d'administration
description: Gérer les utilisateurs de Loch S3 avec le fichier des utilisateurs, la CLI loch-s3 ou l'API d'administration /_loch/users.
---

# Utilisateurs et API d'administration

Le mode multi-utilisateur démarre quand `S3_USERS_FILE` est défini. Chaque utilisateur a un `user_id`, une clé d'accès et une clé secrète. Un seul utilisateur est `root`.

## Fichier des utilisateurs

Si le fichier n'existe pas, le serveur le crée au premier démarrage avec un utilisateur `root` et des clés aléatoires (mode `0600`), et affiche la clé d'accès. Le secret se trouve dans le fichier.

Vous pouvez aussi l'écrire vous-même avant le premier démarrage :

```json
{
  "users": [
    {"user_id": "root", "display_name": "Root", "access_key_id": "<20 random chars>", "secret_access_key": "<40 random chars>", "is_root": true},
    {"user_id": "backup", "display_name": "Backup job", "access_key_id": "<20 random chars>", "secret_access_key": "<40 random chars>"}
  ]
}
```

Règles : un seul `root`, des `user_id` et `access_key_id` uniques, aucun champ vide. Un fichier invalide empêche le serveur de démarrer. Sans API d'administration, modifiez le fichier et redémarrez.

## Activer l'API d'administration

Donnez à `S3_ADMIN_API_KEY` une longue valeur aléatoire :

```bash
openssl rand -hex 32
```

L'API répond sur `/_loch/users` et s'authentifie avec `Authorization: Bearer <key>`. Elle écrit alors le fichier des utilisateurs, qui doit donc être modifiable.

:::warning
L'API d'administration n'est protégée que par cette clé. N'exposez jamais `/_loch/users` sur Internet : bloquez-le au niveau du reverse proxy, comme dans [Déploiement en production](./production.md#reverse-proxy).
:::

## CLI loch-s3

`loch-s3` est livrée dans l'image Docker et dans les archives des releases.

```bash
export LOCH_SERVER=http://localhost:8080 LOCH_ADMIN_KEY=<admin key>
loch-s3 users create "Backup job"
```

`create` dérive le `user_id` du nom (`backup-job`), génère les clés et les affiche une seule fois.

| Commande | Action |
|---|---|
| `loch-s3 users list` | Lister les utilisateurs |
| `loch-s3 users get <user_id>` | Afficher un utilisateur |
| `loch-s3 users create <name>` | Créer un utilisateur avec des clés générées (remplace les clés s'il existe) |
| `loch-s3 users put <user_id> --display-name <name> --access-key <id> --secret-key <secret>` | Créer ou modifier avec vos propres clés |
| `loch-s3 users delete <user_id>` | Supprimer un utilisateur |

| Option | Variable | Défaut |
|---|---|---|
| `--server` | `LOCH_SERVER` | `http://localhost:8080` |
| `--api-key` | `LOCH_ADMIN_KEY` | obligatoire |
| `--access-key`, `--secret-key` (`put`) | `LOCH_ACCESS_KEY`, `LOCH_SECRET_KEY` | obligatoire |

Préférez les variables aux options : les options apparaissent dans la liste des processus.

Depuis le conteneur :

```bash
docker compose exec s3 sh -c 'loch-s3 --api-key "$S3_ADMIN_API_KEY" users list'
```

## Bon à savoir

- L'API ne renvoie jamais les clés secrètes : notez-les à la création de l'utilisateur.
- L'API ne peut ni créer, ni modifier, ni supprimer `root`. Changez les clés root dans le fichier.
- Un nouvel utilisateur ne possède aucun bucket. Donnez-lui accès par une [politique de bucket](../guides/access-control.md#bucket-policies) sur `arn:loch:iam:::user/<user_id>`, ou laissez-le créer ses buckets.
- Supprimer un utilisateur conserve ses buckets. Un nouvel utilisateur avec le même `user_id` en redevient propriétaire.
- Le mode utilisateur unique (`S3_ACCESS_KEY_ID`) n'a pas d'API d'administration.

Endpoints : [Référence de l'API d'administration](../reference/admin-api.md).
