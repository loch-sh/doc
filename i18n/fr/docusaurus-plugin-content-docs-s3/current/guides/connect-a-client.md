---
sidebar_position: 1
title: Connecter un client
description: Configurer l'AWS CLI, un SDK S3 ou Cyberduck pour utiliser un serveur Loch S3 avec des URL de style path.
---

# Connecter un client

Tout client S3 a besoin de trois réglages :

| Réglage | Valeur |
|---|---|
| Endpoint | URL du serveur, par exemple `https://s3.example.com` |
| Style d'adressage | Path (le style virtual-hosted n'est pas pris en charge) |
| Région | N'importe quelle valeur ; utilisez `us-east-1` |

## AWS CLI

```bash
aws configure set aws_access_key_id <access_key_id>
aws configure set aws_secret_access_key <secret_access_key>
aws configure set region us-east-1
aws configure set default.s3.addressing_style path
```

Passez l'endpoint à chaque commande, ou définissez-le une fois avec `aws configure set endpoint_url https://s3.example.com` :

```bash
aws --endpoint-url https://s3.example.com s3 ls
```

HTTP/2 est négocié automatiquement. Activez-le dans l'AWS CLI avec `export AWS_USE_HTTP2=true`.

## SDK

Définissez l'endpoint, la région et l'adressage path. Exemple en Python (boto3) :

```python
import boto3
from botocore.config import Config

s3 = boto3.client(
    "s3",
    endpoint_url="https://s3.example.com",
    region_name="us-east-1",
    aws_access_key_id="<access_key_id>",
    aws_secret_access_key="<secret_access_key>",
    config=Config(s3={"addressing_style": "path"}),
)
```

Les autres SDK ont les mêmes options : `forcePathStyle: true` en JavaScript v3, `usePathStyle` / `forcePathStyle` en Java, `UsePathStyle` en Go v2.

## Cyberduck

1. Téléchargez [`LochS3.cyberduckprofile`](https://github.com/loch-sh/s3/blob/1.4.1/LochS3.cyberduckprofile) depuis le dépôt.
2. Double-cliquez dessus pour l'installer.
3. Ouvrez une nouvelle connexion, choisissez le protocole **Loch S3**, puis saisissez le serveur, le port, la clé d'accès et la clé secrète.

Le profil règle SigV4, les URL de style path et le HTTP en clair sur le port `8080`. Pour un serveur derrière HTTPS, mettez `Scheme` à `https` et `Default Port` à `443` dans le fichier avant de l'installer.

## Bon à savoir

- Les horloges du serveur et du client doivent concorder à 15 minutes près, sinon les requêtes échouent avec `RequestTimeTooSkewed`.
- L'en-tête `host` et chaque en-tête `x-amz-*` doivent être signés. Les SDK standards le font.
- Les SDK récents envoient des corps `aws-chunked` avec des checksums en fin de flux : ils sont acceptés, les checksums ne sont pas vérifiés.
