---
sidebar_position: 5
title: CORS
description: Autoriser des pages web d'autres origines à appeler un bucket Loch S3 depuis le navigateur.
---

# CORS

Une configuration CORS permet à une page web d'une autre origine de lire ou d'envoyer des objets d'un bucket depuis le navigateur. Seuls le propriétaire du bucket et root peuvent la définir.

```bash
aws s3api put-bucket-cors --bucket my-bucket --cors-configuration '{
  "CORSRules": [{
    "AllowedOrigins": ["https://app.example.com"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }]
}'
```

| Champ | Rôle |
|---|---|
| `AllowedOrigins` | Origines autorisées. `*` pour toutes, ou un seul `*` dans un motif : `https://*.example.com` |
| `AllowedMethods` | `GET`, `PUT`, `POST`, `DELETE`, `HEAD` |
| `AllowedHeaders` | En-têtes de requête autorisés dans le preflight. `*` pour tous |
| `ExposeHeaders` | En-têtes de réponse lisibles par le navigateur, par exemple `ETag` |
| `MaxAgeSeconds` | Durée de mise en cache de la réponse au preflight par le navigateur |

La première règle qui correspond à l'origine et à la méthode s'applique. Lisez ou supprimez la configuration avec `get-bucket-cors` et `delete-bucket-cors`.

## Bon à savoir

- Le CORS n'accorde aucun accès : la requête a toujours besoin d'une signature, d'une URL présignée, ou d'une politique ou ACL publique.
- Les requêtes de preflight `OPTIONS` reçoivent une réponse sans authentification.
- Pour les envois depuis le navigateur, donnez à la page une URL PUT présignée créée par votre backend.
