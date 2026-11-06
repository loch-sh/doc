---
sidebar_position: 2
title: Buckets et objets
description: Créer des buckets, envoyer et télécharger des objets, utiliser les métadonnées, les URL présignées, l'envoi multipart et le versionnage.
---

# Buckets et objets

Les exemples utilisent l'AWS CLI configurée comme dans [Connecter un client](./connect-a-client.md), sans `--endpoint-url`.

## Buckets

```bash
aws s3 mb s3://my-bucket      # créer
aws s3 ls                     # lister vos buckets
aws s3 rb s3://my-bucket      # supprimer (il doit être vide)
```

| Règle | Valeur |
|---|---|
| Nom | 3 à 63 caractères : minuscules, chiffres, `-` et `.` ; commence et finit par une lettre ou un chiffre |
| Propriétaire | L'utilisateur qui crée le bucket. Il dispose d'un accès complet |
| Suppression | Refusée avec `BucketNotEmpty` tant qu'il reste des objets, d'anciennes versions ou des envois multipart |

## Objets

```bash
aws s3 cp photo.jpg s3://my-bucket/2026/photo.jpg       # envoyer
aws s3 cp s3://my-bucket/2026/photo.jpg ./photo.jpg     # télécharger
aws s3 ls s3://my-bucket/2026/                          # lister un préfixe
aws s3 rm s3://my-bucket/2026/photo.jpg                 # supprimer
```

En-têtes conservés : `Content-Type`, `Cache-Control`, `Content-Disposition`, `Content-Encoding`, `Content-Language`, `Expires` et les métadonnées personnalisées `x-amz-meta-*` (2 Kio au total).

```bash
aws s3api put-object --bucket my-bucket --key notes.txt --body notes.txt \
  --content-type "text/plain; charset=utf-8" --metadata author=alice
```

Les clés sont limitées à 1 024 octets et 64 niveaux séparés par `/`. Une clé contenant un segment `.`, `..` ou vide (`a/./b`, `a//b`) est refusée.

Le `GET` accepte `Range: bytes=a-b`, `bytes=a-` et `bytes=-n`.

## URL présignées

Une URL présignée donne un accès temporaire à un objet, sans identifiants. Validité : de 1 seconde à 7 jours.

```bash
aws s3 presign s3://my-bucket/report.pdf --expires-in 3600
```

`aws s3 presign` ne crée que des URL GET. Créez les URL PUT avec un SDK (`generate_presigned_url("put_object", ...)` avec boto3).

## Envoi multipart

L'AWS CLI et les SDK passent seuls en envoi multipart pour les gros fichiers. Les parties sont numérotées de 1 à 10 000. Le serveur n'impose ni taille minimale ni taille maximale de partie.

Les envois inachevés sont supprimés après `S3_UPLOAD_TTL` (24 heures par défaut). Pour en abandonner un tout de suite :

```bash
aws s3api list-multipart-uploads --bucket my-bucket
aws s3api abort-multipart-upload --bucket my-bucket --key big.iso --upload-id <upload-id>
```

## Versionnage

Le versionnage conserve chaque version d'un objet. Seuls le propriétaire du bucket et root peuvent le modifier.

```bash
aws s3api put-bucket-versioning --bucket my-bucket --versioning-configuration Status=Enabled
aws s3api list-object-versions --bucket my-bucket --prefix report.pdf
aws s3api get-object --bucket my-bucket --key report.pdf --version-id <version-id> old.pdf
```

| Action | Résultat |
|---|---|
| Envoi | Crée une nouvelle version ; la réponse porte `x-amz-version-id` |
| Suppression sans `--version-id` | Ajoute un marqueur de suppression ; les versions précédentes restent |
| Suppression avec `--version-id` | Supprime définitivement cette version |
| `Status=Suspended` | Les nouveaux envois écrasent la version `null` ; les versions existantes restent |

## Bon à savoir

- La suppression multiple (`aws s3api delete-objects`) n'est pas prise en charge. Les outils qui suppriment par lots échouent ; supprimez les objets un par un.
- Dans un bucket versionné, un objet finalisé par un envoi multipart ne crée pas de version.
- Chaque écriture dans un bucket versionné compte double dans le [quota](../admin/production.md#quota).
