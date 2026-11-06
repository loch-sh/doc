---
sidebar_position: 2
title: Compatibilité de l'API S3
description: Toutes les opérations S3 prises en charge par Loch S3, avec leur route HTTP, et les opérations non prises en charge.
---

# Compatibilité de l'API S3

Loch S3 n'accepte que les URL de style path : `/{bucket}` et `/{bucket}/{key}`. Toute région est acceptée dans la signature.

## Opérations prises en charge

| Opération | Route |
|---|---|
| ListBuckets | `GET /` |
| CreateBucket | `PUT /{bucket}` (un corps `LocationConstraint` est ignoré) |
| HeadBucket | `HEAD /{bucket}` |
| DeleteBucket | `DELETE /{bucket}` |
| ListObjectsV2 | `GET /{bucket}` avec `prefix`, `delimiter`, `max-keys` (jusqu'à 1000), `start-after`, `continuation-token` |
| PutObject | `PUT /{bucket}/{key}` |
| CopyObject | `PUT /{bucket}/{key}` avec `x-amz-copy-source` ; `x-amz-metadata-directive: COPY` ou `REPLACE` |
| GetObject | `GET /{bucket}/{key}`, `Range` et `versionId` facultatifs |
| HeadObject | `HEAD /{bucket}/{key}`, `versionId` facultatif |
| DeleteObject | `DELETE /{bucket}/{key}`, `versionId` facultatif |
| CreateMultipartUpload | `POST /{bucket}/{key}?uploads` |
| UploadPart | `PUT /{bucket}/{key}?partNumber=N&uploadId=X` (N de 1 à 10 000) |
| CompleteMultipartUpload | `POST /{bucket}/{key}?uploadId=X` |
| AbortMultipartUpload | `DELETE /{bucket}/{key}?uploadId=X` |
| ListParts | `GET /{bucket}/{key}?uploadId=X` |
| ListMultipartUploads | `GET /{bucket}?uploads` |
| Put/GetBucketVersioning | `PUT`, `GET /{bucket}?versioning` |
| ListObjectVersions | `GET /{bucket}?versions` |
| Put/Get/DeleteBucketPolicy | `PUT`, `GET`, `DELETE /{bucket}?policy` |
| Put/Get/DeleteBucketCors | `PUT`, `GET`, `DELETE /{bucket}?cors` |
| Preflight CORS | `OPTIONS /{bucket}` ou `/{bucket}/{key}` |
| Put/GetBucketAcl | `PUT`, `GET /{bucket}?acl` (`x-amz-acl` prédéfinie ou corps XML) |
| Put/GetObjectAcl | `PUT`, `GET /{bucket}/{key}?acl` |
| Put/Get/DeleteBucketEncryption | `PUT`, `GET`, `DELETE /{bucket}?encryption` (`AES256` uniquement) |

Les URL présignées fonctionnent pour toutes ces opérations.

## Authentification

| Méthode | Détail |
|---|---|
| SigV4 en en-tête | `Authorization: AWS4-HMAC-SHA256 …`. `host` et chaque en-tête `x-amz-*` doivent être signés |
| URL présignée | Paramètres `X-Amz-*` dans la query string, `X-Amz-Expires` de 1 à 604 800 secondes |
| `x-amz-content-sha256` | Un hash SHA-256 (vérifié), `UNSIGNED-PAYLOAD`, `STREAMING-AWS4-HMAC-SHA256-PAYLOAD[-TRAILER]` (signatures de chunks vérifiées) ou `STREAMING-UNSIGNED-PAYLOAD-TRAILER`. Les autres valeurs sont refusées |

## Non pris en charge

| Fonction | Remarque |
|---|---|
| URL de style virtual-hosted | Utilisez le style path |
| ListObjects v1 | `GET /{bucket}` répond toujours au format V2 ; `marker` est ignoré |
| DeleteObjects (suppression multiple) | `405` |
| GetBucketLocation (`?location`) | Non implémenté |
| `partNumber` sur GetObject | Ignoré, l'objet entier est renvoyé |
| En-têtes `Range` multiples | Ignorés, l'objet entier est renvoyé |
| Tags, cycle de vie, réplication, verrouillage d'objets, site web, journalisation, notifications | Non implémentés |
| SSE-KMS, IAM, STS, régions | Non implémentés |
| `Content-MD5` et `x-amz-checksum-*` | Non vérifiés |

:::warning
Les requêtes vers une sous-ressource non prise en charge ne sont pas toujours refusées : elles peuvent être traitées comme l'opération simple sur le même chemin. Par exemple, `PUT /{bucket}/{key}?tagging` remplace l'objet par le corps de la requête. N'envoyez pas de requêtes de tags ou de cycle de vie à Loch S3.
:::
