---
sidebar_position: 3
title: Référence de l'API d'administration
description: Endpoints de l'API de gestion des utilisateurs de Loch S3 (/_loch/users) et endpoints de service /_loch/health et /_loch/usage.
---

# Référence de l'API d'administration

## API des utilisateurs

Disponible quand `S3_USERS_FILE` et `S3_ADMIN_API_KEY` sont tous deux définis. Chaque requête porte `Authorization: Bearer <S3_ADMIN_API_KEY>`.

| Méthode | Chemin | Corps | Succès |
|---|---|---|---|
| `GET` | `/_loch/users` | aucun | `200` `{"users":[…]}` |
| `GET` | `/_loch/users/{user_id}` | aucun | `200` objet utilisateur |
| `PUT` | `/_loch/users/{user_id}` | `{"display_name","access_key_id","secret_access_key"}` | `201` créé, `200` remplacé. Corps vide |
| `DELETE` | `/_loch/users/{user_id}` | aucun | `204` |

Objet utilisateur :

```json
{"user_id": "backup", "display_name": "Backup job", "access_key_id": "<access key>", "is_root": false}
```

Exemple :

```bash
curl -X PUT -H "Authorization: Bearer $LOCH_ADMIN_KEY" -H "Content-Type: application/json" \
  -d '{"display_name":"Backup job","access_key_id":"<access key>","secret_access_key":"<secret key>"}' \
  http://localhost:8080/_loch/users/backup
```

| Règle | Valeur |
|---|---|
| `user_id` | 1 à 128 caractères : lettres, chiffres, `-`, `_` |
| `access_key_id` | Unique parmi les utilisateurs |
| `secret_access_key` | En écriture seule : jamais renvoyée |
| `is_root` | Non modifiable par l'API. `root` ne peut être ni modifié ni supprimé |
| Taille du corps | 64 Kio |

Les changements sont enregistrés aussitôt dans le fichier des utilisateurs (écriture dans un fichier temporaire, puis renommage) et s'appliquent sans redémarrage.

### Erreurs

Les erreurs utilisent le format XML de S3 (`<Error><Code>…</Code>…</Error>`).

| Statut | Code | Quand |
|---|---|---|
| `400` | `InvalidArgument` | `user_id` ou JSON invalide, clé d'accès en double, utilisateur inconnu, modification de `root` |
| `403` | `AccessDenied` | Clé absente ou fausse, `S3_ADMIN_API_KEY` non défini, ou aucune authentification configurée |
| `405` | `MethodNotAllowed` | Mode utilisateur unique (`S3_ACCESS_KEY_ID`) |

## Endpoints de service

| Méthode | Chemin | Authentification | Réponse |
|---|---|---|---|
| `GET`, `HEAD` | `/_loch/health` | aucune | `200 {"status":"ok"}` ; avec un quota, `"quota":"ok"` ou `"exceeded"` est ajouté. `503 {"status":"error"}` si le répertoire de données est inaccessible. Non journalisé |
| `GET` | `/_loch/usage` | SigV4, root uniquement (ouvert sans authentification) | `200 {"used_bytes":N,"reserved_bytes":N,"limit_bytes":N}` ; `limit_bytes` vaut `null` sans quota |
