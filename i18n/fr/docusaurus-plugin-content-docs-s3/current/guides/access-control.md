---
sidebar_position: 3
title: Contrôle d'accès
description: Comprendre les modes d'authentification, la propriété des buckets, les ACL prédéfinies et les politiques de bucket de Loch S3.
---

# Contrôle d'accès

## Modes d'authentification

Le serveur choisit un mode au démarrage, dans cet ordre :

| Mode | Variable | Comportement |
|---|---|---|
| Multi-utilisateur | `S3_USERS_FILE` | Utilisateurs lus dans un fichier JSON, dont un `root`. Voir [Utilisateurs et API d'administration](../admin/users.md) |
| Utilisateur unique | `S3_ACCESS_KEY_ID` + `S3_SECRET_ACCESS_KEY` | Une seule paire de clés, avec les droits root |
| Ouvert | aucune | Toutes les requêtes sont acceptées sans signature. Tests locaux uniquement |

## Qui peut faire quoi

| Appelant | Accès |
|---|---|
| `root` | Tout |
| Propriétaire du bucket | Tout, sur les buckets qu'il a créés |
| Autre utilisateur | Créer des buckets. Sur les autres buckets : seulement ce qu'une politique de bucket accorde. `ListBuckets` montre les buckets qu'il possède ou qu'il peut lister (`s3:ListBucket`) |
| Anonyme | Seulement ce qu'une politique de bucket ou une ACL publique accorde |

Les buckets sont privés par défaut. Seuls root et le propriétaire peuvent modifier la politique, le CORS, le chiffrement, le versionnage ou l'ACL d'un bucket, ou le supprimer.

## ACL prédéfinies

Rendez un bucket ou un objet public :

```bash
aws s3api put-bucket-acl --bucket my-bucket --acl public-read
aws s3api put-object-acl --bucket my-bucket --key logo.png --acl public-read
```

| ACL | Accès anonyme |
|---|---|
| `private` | Aucun |
| `public-read` | Lecture |
| `public-read-write` | Lecture et écriture |

## Politiques de bucket {#bucket-policies}

Une politique de bucket est un document JSON d'instructions `Allow` et `Deny`. Un utilisateur se désigne par `arn:loch:iam:::user/<user_id>`, une ressource par `arn:loch:s3:::<bucket>/<key>`.

Donnez à l'utilisateur `reader` un accès en lecture seule à `media` :

```bash
aws s3api put-bucket-policy --bucket media --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"AWS": "arn:loch:iam:::user/reader"},
    "Action": ["s3:GetObject", "s3:ListBucket"],
    "Resource": ["arn:loch:s3:::media", "arn:loch:s3:::media/*"]
  }]
}'
```

Pour rendre tous les objets publics : `"Principal": "*"` et `"Action": "s3:GetObject"` sur `arn:loch:s3:::media/*`.

Lisez-la ou supprimez-la avec `get-bucket-policy` et `delete-bucket-policy`. Syntaxe, actions et évaluation : [Référence des politiques de bucket](../reference/bucket-policies.md).

## Bon à savoir

- Un `Deny` explicite l'emporte sur tout `Allow` et sur les ACL.
- `Condition`, `NotAction`, `NotResource` et `NotPrincipal` sont refusés avec `MalformedPolicy`.
- Un droit `READ` au niveau du bucket (`public-read`) permet aussi le téléchargement anonyme de tous ses objets, pas seulement le listage.
- Les politiques comparent les clés en respectant la casse : gardez le répertoire de données sur un système de fichiers sensible à la casse.
