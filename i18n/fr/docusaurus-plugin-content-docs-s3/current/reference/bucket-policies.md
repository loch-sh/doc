---
sidebar_position: 4
title: Référence des politiques de bucket
description: Syntaxe, principaux, actions, ressources et règles d'évaluation des politiques de bucket de Loch S3.
---

# Référence des politiques de bucket

Une politique de bucket est un document JSON défini avec `PutBucketPolicy` (`aws s3api put-bucket-policy`) par le propriétaire du bucket ou root. Taille maximale : 20 Kio.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadOnlyForReader",
      "Effect": "Allow",
      "Principal": {"AWS": ["arn:loch:iam:::user/reader"]},
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": ["arn:loch:s3:::media", "arn:loch:s3:::media/*"]
    }
  ]
}
```

## Champs

| Champ | Valeurs |
|---|---|
| `Version` | `2012-10-17` ou `2008-10-17` |
| `Statement` | Au moins une instruction |
| `Sid` | Libellé facultatif |
| `Effect` | `Allow` ou `Deny` |
| `Principal` | `"*"` (tout le monde, anonymes compris), ou `{"AWS": "<arn>"}` / `{"AWS": ["<arn>", …]}` avec `arn:loch:iam:::user/<user_id>` |
| `Action` | Une action ou une liste (ci-dessous) |
| `Resource` | Un ARN ou une liste (ci-dessous) |

Tout autre champ (`Condition`, `NotAction`, `NotResource`, `NotPrincipal`…) rend la politique invalide : `400 MalformedPolicy`.

## Actions

| Action | Requête |
|---|---|
| `s3:GetObject` | GET ou HEAD d'un objet |
| `s3:PutObject` | PUT ou POST sur un objet : envoi, destination d'une copie, multipart |
| `s3:DeleteObject` | DELETE d'un objet |
| `s3:ListBucket` | Lister les objets, les envois multipart |
| `s3:GetBucketLocation` | HEAD du bucket |
| `s3:GetObjectVersion` | GET ou HEAD avec `versionId` ; `s3:GetObject` correspond aussi |
| `s3:DeleteObjectVersion` | DELETE avec `versionId` ; `s3:DeleteObject` correspond aussi |
| `s3:ListBucketVersions` | `GET /{bucket}?versions` ; `s3:ListBucket` correspond aussi |

Les actions se comparent comme sur AWS : sans tenir compte de la casse, avec les jokers `*` et `?` (`*`, `s3:*`, `s3:Get*`). Une action autre que `*` ou `s3:<name>` rend la politique invalide.

## Ressources

| Ressource | ARN |
|---|---|
| Le bucket (listage) | `arn:loch:s3:::media` |
| Tous les objets | `arn:loch:s3:::media/*` |
| Objets sous un préfixe | `arn:loch:s3:::media/public/*` |
| Tout | `*` |

`arn:aws:s3:::` est accepté à la place de `arn:loch:s3:::`. Seul un `*` final sert de joker. Les clés sont comparées en respectant la casse.

## Évaluation

1. Root et le propriétaire du bucket sont toujours autorisés. Les politiques ne s'appliquent pas à eux.
2. Seuls root et le propriétaire peuvent modifier la politique, le CORS, le chiffrement, le versionnage et l'ACL du bucket, ou le supprimer.
3. Pour tout autre appelant, un `Deny` qui correspond refuse la requête.
4. Sinon, un `Allow` qui correspond l'accorde.
5. Sinon, une requête anonyme peut encore être accordée par une ACL publique. Les utilisateurs authentifiés sont refusés.

Une copie demande aussi `s3:GetObject` (ou `s3:GetObjectVersion`) sur la source. Une politique stockée devenue illisible refuse toutes les requêtes concernées par l'étape 3.
