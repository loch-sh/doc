---
sidebar_position: 5
title: Codes d'erreur
description: Codes d'erreur S3 renvoyés par Loch S3, avec leur statut HTTP et leur cause habituelle.
---

# Codes d'erreur

Les erreurs sont renvoyées au format XML de S3 : `<Error><Code>…</Code><Message>…</Message><Resource>…</Resource><RequestId>…</RequestId></Error>`. Le message est un texte fixe pour chaque code.

| Code | Statut | Cause habituelle |
|---|---|---|
| `AccessDenied` | 403 | Pas de permission, en-tête `host` ou `x-amz-*` non signé, mauvaise clé SSE-C, expiration d'URL présignée hors limites |
| `SignatureDoesNotMatch` | 403 | Mauvaise clé secrète, ou signature de chunk `aws-chunked` invalide |
| `InvalidAccessKeyId` | 403 | Clé d'accès inconnue |
| `RequestTimeTooSkewed` | 403 | Horloge du client décalée de plus de 15 minutes |
| `ExpiredToken` | 403 | URL présignée expirée |
| `QuotaExceeded` | 403 | Écriture au-delà de `S3_MAX_STORAGE_BYTES`. Les SDK ne réessaient pas |
| `NoSuchBucket` | 404 | Le bucket n'existe pas |
| `NoSuchKey` | 404 | L'objet n'existe pas |
| `NoSuchVersion` | 404 | `versionId` inconnu ou mal formé |
| `NoSuchUpload` | 404 | `uploadId` inconnu ou mal formé |
| `NoSuchBucketPolicy` | 404 | Aucune politique sur le bucket |
| `NoSuchCORSConfiguration` | 404 | Aucune configuration CORS sur le bucket |
| `BucketAlreadyExists` | 409 | Nom déjà pris par un autre utilisateur |
| `BucketAlreadyOwnedByYou` | 409 | Vous possédez déjà ce bucket |
| `BucketNotEmpty` | 409 | Il reste des objets, des versions ou des envois multipart |
| `InvalidBucketName` | 400 | Le nom enfreint les règles de nommage |
| `InvalidArgument` | 400 | Clé invalide (`.`, `..`, segment vide, plus de 1 024 octets ou de 64 niveaux), corps `aws-chunked` mal formé, source de copie invalide, MD5 de clé SSE-C incorrect, `x-amz-content-sha256` non pris en charge |
| `InvalidPart` | 400 | Partie absente ou ETag différent à la finalisation |
| `InvalidPartOrder` | 400 | Parties pas dans l'ordre croissant à la finalisation |
| `MalformedPolicy` | 400 | JSON, champ ou action de politique invalide |
| `MalformedXML` | 400 | Corps XML invalide |
| `XAmzContentSHA256Mismatch` | 400 | Le corps ne correspond pas au hash signé. Rien n'est stocké |
| `RequestTimeout` | 400 | Envoi bloqué 60 secondes ou plus lent que `S3_MIN_UPLOAD_RATE` |
| `MissingSecurityHeader` | 400 | Objet SSE-C lu sans sa clé |
| `InvalidEncryptionAlgorithmError` | 400 | Algorithme autre que `AES256` |
| `ServerSideEncryptionConfigurationNotFoundError` | 400 | SSE-S3 demandé sans clé maître |
| `MethodNotAllowed` | 405 | Méthode non prise en charge sur ce chemin. Souvent sans corps |
| `EntityTooLarge` | 413 | Corps ou métadonnées au-delà de leur [limite](./limits.md) |
| `InvalidRange` | 416 | `Range` en dehors de l'objet |
| `InternalError` | 500 | Échec côté serveur : consultez les journaux |
