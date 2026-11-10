---
sidebar_position: 6
title: Stockage
description: Créez des instances de stockage objet Loch S3 avec un quota et un chiffrement facultatif, et connectez un site Laravel.
---

# Stockage

Le menu **Stockage** propose [Loch S3](/s3/), un stockage objet compatible avec l'API Amazon S3. Les sites stockent et servent fichiers envoyés, médias et sauvegardes avec n'importe quel client ou SDK S3. Chaque instance tourne dans son propre conteneur (`svc-s3-<nom>`) avec un seul utilisateur root ; un bucket au nom de l'instance est créé au démarrage.

:::note
Réservé aux admins. Nécessite le [module services](./overview.md).
:::

## Créer une instance

1. Ouvrez **Stockage → Loch S3**, puis cliquez sur **Nouvelle instance**.
2. Choisissez la **Version**, les réglages, les **Réseaux** et le **Nom** (lettres minuscules et chiffres), puis cliquez sur **Créer**.
3. Copiez le secret dans **Informations de connexion**.

| Réglage | Valeurs | Défaut | Modifiable |
|---|---|---|---|
| **Mémoire** | 128 Mo à 1 Go, ou **Personnalisé** jusqu'à 8 Go | 256 Mo | Oui |
| **Quota de stockage** | 1 Go à 500 Go, ou **Personnalisé** jusqu'à 10 To | 10 Go | Oui |
| **Chiffrement côté serveur** | SSE-S3 (AES-256-GCM) sur chaque objet, avec une clé générée pour l'instance. Loch S3 1.4 et suivants | **Désactivé** | Non |

Le quota compte les objets, leurs versions et les envois en cours. Le baisser sous l'espace utilisé refuse les nouvelles écritures ; rien n'est supprimé.

```bash
loch services create media --engine s3 --version 1.4 --option quota=10240
```

## Informations de connexion

| Champ | Valeur |
|---|---|
| **Point d'accès** | `http://svc-s3-<nom>:8080` |
| **Région** | `us-east-1` |
| **Bucket** | Au nom de l'instance. L'utilisateur peut en créer d'autres |
| **Identifiant de clé d'accès**, **Clé d'accès secrète** | Le secret est affiché une seule fois |
| **URLs en mode chemin** | Obligatoires |

<Screenshot id="services-credentials-s3" alt="La fenêtre Informations de connexion d'une instance Loch S3 avec le point d'accès, le bucket et la clé d'accès" />

**Copier les lignes .env Laravel** copie, secret compris :

```bash
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=...
AWS_ENDPOINT=http://svc-s3-media:8080
AWS_USE_PATH_STYLE_ENDPOINT=true
```

## Bon à savoir

- URLs en mode chemin uniquement, pas de TLS. Publier sur une adresse publique exige `SERVICES_TLS=off`.
- **Nouveau mot de passe** change la clé d'accès et le secret, puis redémarre l'instance. Les URL présignées avec l'ancienne clé cessent de fonctionner.
- Les URL présignées utilisent l'adresse interne : elles ne fonctionnent pas depuis un navigateur.
- Buckets, politiques et CORS : [documentation Loch S3](/s3/).
- Mise à jour, redimensionnement, port publié et suppression : [services managés](./overview.md).
