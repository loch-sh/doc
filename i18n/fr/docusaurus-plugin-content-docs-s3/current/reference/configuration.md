---
sidebar_position: 1
title: Référence de configuration
description: Toutes les variables d'environnement du serveur Loch S3 et de la CLI loch-s3, avec leur valeur par défaut.
---

# Référence de configuration

Loch S3 lit sa configuration uniquement dans des variables d'environnement. La plupart des valeurs invalides arrêtent le serveur au démarrage avec `Invalid configuration: …` et le code de sortie 1.

## Serveur {#server}

| Variable | Défaut | Description |
|---|---|---|
| `S3_PORT` | `8080` | Port d'écoute, sur toutes les interfaces |
| `S3_DATA_DIR` | `./data` (`/data` dans l'image) | Répertoire de données. Créé s'il n'existe pas |
| `S3_USERS_FILE` | aucun | Fichier JSON des utilisateurs. Active le mode multi-utilisateur ; créé avec un utilisateur `root` s'il n'existe pas |
| `S3_ACCESS_KEY_ID` | aucun | Clé d'accès du mode utilisateur unique. À définir avec `S3_SECRET_ACCESS_KEY`. Ignorée si `S3_USERS_FILE` est défini |
| `S3_SECRET_ACCESS_KEY` | aucun | Clé secrète du mode utilisateur unique |
| `S3_ADMIN_API_KEY` | aucun | Clé Bearer de l'API d'administration `/_loch/users`. Uniquement avec `S3_USERS_FILE`. Non définie : l'API est coupée et le fichier des utilisateurs n'est jamais écrit |
| `S3_ENCRYPTION_KEY` | aucun | Clé maître SSE-S3 : 32 octets encodés en base64 (`openssl rand -base64 32`) |
| `S3_ENCRYPTION_KEY_FILE` | aucun | Fichier contenant la clé maître en base64. Incompatible avec `S3_ENCRYPTION_KEY` |
| `S3_ENCRYPT_BY_DEFAULT` | `false` | `true` : chiffre en SSE-S3 toute écriture sans en-tête SSE. Exige une clé maître. Accepte `true`/`false`, `1`/`0`, `yes`/`no` |
| `S3_MAX_STORAGE_BYTES` | illimité | Quota de tout le répertoire de données, en octets |
| `S3_INIT_BUCKETS` | aucun | Buckets séparés par des virgules, créés au démarrage s'ils n'existent pas, propriété de `root` |
| `S3_UPLOAD_TTL` | `86400` | Secondes avant la suppression d'un envoi multipart inachevé. Vérifié toutes les 5 minutes |
| `S3_MIN_UPLOAD_RATE` | `4096` | Débit d'envoi minimal en octets/s sur des fenêtres de 60 secondes. `0` désactive |
| `S3_MAX_CONNECTIONS` | `1024` | Nombre maximal de connexions simultanées. Les suivantes sont fermées. Une valeur invalide revient au défaut |
| `S3_SHUTDOWN_GRACE` | `8` | Secondes laissées aux requêtes en cours après `SIGTERM` ou `SIGINT` |
| `S3_MAX_BLOCKING_THREADS` | `32` | Taille maximale du pool de threads d'E/S fichier. Gardez-la sous la limite de PID du conteneur |

Le serveur refuse de démarrer quand :

- une seule des variables `S3_ACCESS_KEY_ID` et `S3_SECRET_ACCESS_KEY` est définie, ou l'une est vide ;
- le fichier des utilisateurs est invalide ou ne peut pas être créé ;
- la clé maître est vide, illisible, n'est pas en base64 ou ne fait pas 32 octets une fois décodée, ou les deux variables de clé sont définies ;
- `S3_ENCRYPT_BY_DEFAULT=true` sans clé maître ;
- un nom de `S3_INIT_BUCKETS` n'est pas un nom de bucket valide ;
- une variable numérique n'est pas un nombre.

## CLI loch-s3 {#cli}

| Variable | Option | Défaut | Description |
|---|---|---|---|
| `LOCH_SERVER` | `--server` | `http://localhost:8080` | URL du serveur |
| `LOCH_ADMIN_KEY` | `--api-key` | obligatoire | Valeur de `S3_ADMIN_API_KEY` |
| `LOCH_ACCESS_KEY` | `--access-key` | obligatoire pour `users put` | Clé d'accès à définir |
| `LOCH_SECRET_KEY` | `--secret-key` | obligatoire pour `users put` | Clé secrète à définir |

Les options l'emportent sur les variables.
