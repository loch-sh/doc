---
sidebar_position: 1
title: Déploiement en production
description: Faire tourner Loch S3 derrière un reverse proxy TLS dans un conteneur durci, avec un quota de stockage, des sondes de santé et des limites de connexions.
---

# Déploiement en production

## Reverse proxy {#reverse-proxy}

Loch S3 parle HTTP en clair. Placez un reverse proxy TLS devant et gardez le port S3 hors du réseau. Exemple avec Caddy :

```text
s3.example.com {
	# The admin API is protected by a single key: keep it off the Internet
	@admin path /_loch/users /_loch/users/*
	respond @admin 403
	reverse_proxy s3:8080
}
```

Les clients utilisent `https://s3.example.com` avec des URL de style path. Le proxy doit transmettre l'en-tête `Host` sans le modifier : il fait partie de la signature.

## Conteneur durci {#hardened-container}

Le serveur n'écrit que dans `S3_DATA_DIR`. Il tourne avec un système de fichiers racine en lecture seule et sans capacités :

```yaml
services:
  s3:
    image: ghcr.io/loch-sh/s3:1.4.1
    restart: unless-stopped
    read_only: true
    cap_drop: [ALL]
    security_opt: ["no-new-privileges:true"]
    user: "100:101"
    mem_limit: 128m
    pids_limit: 64
    environment:
      S3_USERS_FILE: /etc/s3/users.json
      S3_ENCRYPTION_KEY_FILE: /run/secrets/master.key
      S3_ENCRYPT_BY_DEFAULT: "true"
      S3_MAX_STORAGE_BYTES: "107374182400"   # 100 GiB
      S3_INIT_BUCKETS: backups,media
    volumes:
      - /srv/s3/data:/data
      - /srv/s3/conf:/etc/s3:ro
      - /srv/s3/secrets:/run/secrets:ro
```

| Montage | Mode | Contenu |
|---|---|---|
| `/data` | lecture-écriture | Buckets, objets, métadonnées. Un seul système de fichiers, sensible à la casse (Linux) |
| fichier des utilisateurs | lecture seule | Jamais écrit tant que `S3_ADMIN_API_KEY` n'est pas défini |
| clé maître | lecture seule | Mode `0400`, propriété de l'uid du conteneur |

Avec un fichier des utilisateurs en lecture seule, le fichier doit déjà exister : le serveur s'arrête au lieu de le créer. Les utilisateurs ne changent alors qu'en modifiant le fichier puis en redémarrant.

Gardez la limite de PID au-dessus de `S3_MAX_BLOCKING_THREADS` (32), plus le nombre de CPU, plus une petite marge.

## Quota {#quota}

`S3_MAX_STORAGE_BYTES` plafonne tout le répertoire de données : objets, versions, parties multipart en cours et fichiers de métadonnées. Une écriture qui le dépasserait échoue avec `403 QuotaExceeded` ; les suppressions fonctionnent toujours. Les buckets versionnés réservent deux fois la taille de l'objet.

Le quota compte la taille des fichiers, pas les blocs disque ni les inodes. Pour une limite disque stricte, donnez aussi au répertoire de données son propre volume ou un quota de système de fichiers.

## Santé et utilisation

| Endpoint | Authentification | Réponse |
|---|---|---|
| `GET` ou `HEAD /_loch/health` | aucune | `200 {"status":"ok"}`, plus `"quota":"ok"` ou `"exceeded"` si un quota est défini ; `503` si le répertoire de données est inaccessible |
| `GET /_loch/usage` | SigV4, root | `{"used_bytes":…,"reserved_bytes":…,"limit_bytes":…}` |

```bash
curl --aws-sigv4 "aws:amz:us-east-1:s3" -u "$ROOT_KEY:$ROOT_SECRET" https://s3.example.com/_loch/usage
```

## Journaux

Le serveur écrit ses journaux sur la sortie d'erreur (`docker logs`) : les réglages au démarrage, puis une ligne par requête et par réponse avec la méthode, le chemin et le statut. Les en-têtes et les query strings ne sont jamais journalisés. Les sondes de santé ne le sont pas non plus. Il n'y a pas d'endpoint de métriques.

## Arrêt

Sur `SIGTERM`, le serveur cesse d'accepter des connexions et laisse `S3_SHUTDOWN_GRACE` secondes aux requêtes en cours (8 par défaut, sous le délai d'arrêt de 10 secondes de Docker). Un envoi interrompu ne laisse aucun objet.

## Bon à savoir

- Les envois lents sont coupés : aucune donnée pendant 60 secondes, ou moins de `S3_MIN_UPLOAD_RATE` octets/s (4096) sur 60 secondes, se termine par `400 RequestTimeout`.
- Au plus `S3_MAX_CONNECTIONS` (1024) connexions simultanées ; les suivantes sont fermées.
- Les connexions HTTP/2 qui répondent aux pings n'expirent jamais : gardez le proxy devant.
- Toutes les limites : [Limites](../reference/limits.md). Toutes les variables : [Référence de configuration](../reference/configuration.md).
