---
sidebar_position: 4
title: Chiffrement
description: Chiffrer les objets au repos avec SSE-S3 (clé du serveur) ou SSE-C (clé du client), par requête, par bucket ou pour toute écriture.
---

# Chiffrement

Loch S3 chiffre les objets en AES-256-GCM. Deux modes :

| Mode | Clé | Réglage serveur |
|---|---|---|
| SSE-S3 | Une clé maître sur le serveur ; une clé dérivée par objet | `S3_ENCRYPTION_KEY_FILE` ou `S3_ENCRYPTION_KEY` |
| SSE-C | Envoyée par le client à chaque requête, jamais stockée | Aucun |

## Définir la clé maître

La clé fait 32 octets aléatoires, encodés en base64 :

```bash
openssl rand -base64 32 > master.key
sudo chown 100:101 master.key   # l'utilisateur du conteneur
chmod 0400 master.key
```

Montez le fichier et indiquez son chemin dans `S3_ENCRYPTION_KEY_FILE`. Préférez le fichier à `S3_ENCRYPTION_KEY` : les variables d'environnement apparaissent dans `docker inspect`.

:::warning
Sans la clé maître, les objets SSE-S3 sont illisibles. Sauvegardez-la à part des données, voir [Sauvegarde et restauration](../admin/backup.md).
:::

## Choisir ce qui est chiffré

| Portée | Comment |
|---|---|
| Une requête | En-tête `x-amz-server-side-encryption: AES256` (`--sse AES256` dans `aws s3 cp`) |
| Un bucket | Chiffrement par défaut du bucket (ci-dessous) |
| Toute écriture | `S3_ENCRYPT_BY_DEFAULT=true` |

Chiffrement par défaut d'un bucket (seuls le propriétaire et root peuvent le définir) :

```bash
aws s3api put-bucket-encryption --bucket my-bucket --server-side-encryption-configuration \
  '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
```

Les téléchargements sont déchiffrés de façon transparente.

## SSE-C

```bash
KEY=$(openssl rand -base64 32)
KEY_MD5=$(echo -n "$KEY" | base64 -d | openssl dgst -md5 -binary | base64)
SSE_C="--sse-customer-algorithm AES256 --sse-customer-key $KEY --sse-customer-key-md5 $KEY_MD5"

aws s3api put-object --bucket my-bucket --key secret.txt --body secret.txt $SSE_C
aws s3api get-object --bucket my-bucket --key secret.txt secret.txt $SSE_C
```

Conservez la clé : le serveur ne la stocke pas, et l'objet est illisible sans elle.

Sans la clé, un GET échoue avec `MissingSecurityHeader` ; avec une mauvaise clé, avec `AccessDenied`.

## Bon à savoir

- Les objets écrits avant l'activation du chiffrement restent en clair. Copiez un objet sur lui-même pour le chiffrer.
- Les en-têtes SSE-C l'emportent sur le chiffrement par défaut. Les en-têtes SSE-S3 et SSE-C ne se combinent pas.
- Les parties d'un envoi multipart restent en clair dans `.uploads/` jusqu'à la finalisation.
- Sans HTTPS, les clés SSE-C circulent en clair : gardez un proxy TLS devant.
