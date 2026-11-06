---
sidebar_position: 1
title: Exécuter en production
description: Lancez une fonction avec des identifiants, un conteneur en lecture seule et non root, des limites de ressources et un healthcheck Docker.
---

# Exécuter en production

En production, le conteneur a un identifiant, tourne en lecture seule sous un utilisateur non root sans capabilities, a des limites de mémoire, de CPU et de processus, et un healthcheck. Le binaire et le code de la fonction sont montés en lecture seule.

## 1. Créer les identifiants

Seul le SHA-256 du jeton bearer entre dans le conteneur. Donnez le jeton lui-même aux appelants.

```bash
TOKEN=$(openssl rand -hex 32)          # pour les appelants, jamais pour le conteneur
TOKEN_SHA256=$(printf %s "$TOKEN" | openssl dgst -sha256 -r | cut -d' ' -f1)
KEY_ID=$(LC_ALL=C tr -dc A-Z0-9 </dev/urandom | head -c 20)  # paire SigV4 facultative
KEY_SECRET=$(openssl rand -base64 30)
printf 'LOCH_RUNTIME_TOKEN_SHA256=%s\nLOCH_RUNTIME_ACCESS_KEY=%s:%s\n' "$TOKEN_SHA256" "$KEY_ID" "$KEY_SECRET" > fn.env
chmod 600 fn.env
```

Gardez ces deux valeurs secrètes. La paire SigV4 n'est utile qu'à l'AWS CLI et aux SDK AWS. Détails : [Authentification](./authentication.md).

## 2. Lancer le conteneur

`fn/` contient le code de la fonction et `$ARCH` correspond à l'hôte, comme dans le [démarrage rapide](../install.md#quick-start).

```bash
docker network create fn-net
docker run -d --name fn --network fn-net \
  --read-only --user 10001:10001 --cap-drop ALL --security-opt no-new-privileges:true \
  --tmpfs /tmp:size=64m --memory 256m --memory-swap 256m --cpus 0.5 --pids-limit 128 \
  -p 127.0.0.1:8080:8080 \
  -v "$PWD/loch-lambda-runtime-linux-$ARCH:/loch/lambda-runtime:ro" \
  -v "$PWD/fn:/var/task:ro" \
  --env-file fn.env -e AWS_LAMBDA_FUNCTION_TIMEOUT=30 \
  --entrypoint /loch/lambda-runtime \
  public.ecr.aws/lambda/nodejs:22 index.handler
until docker exec fn /loch/lambda-runtime health >/dev/null; do sleep 0.2; done
```

| Option | Pourquoi |
|---|---|
| `--read-only`, `--tmpfs /tmp` | La fonction n'écrit que dans `/tmp`, comme sur AWS Lambda™ |
| `--user 10001:10001` | N'importe quel uid non root. En root, les fichiers d'identifiants sont plus difficiles à protéger |
| `--cap-drop ALL`, `no-new-privileges` | Le runtime n'a besoin d'aucune capability |
| `--memory` = `--memory-swap` | Pas de swap. Le runtime lit la limite et en déduit `AWS_LAMBDA_FUNCTION_MEMORY_SIZE` (256) |
| `--cpus`, `--pids-limit` | Bornent ce que la fonction peut consommer |
| `-p 127.0.0.1:8080:8080` | Publiez sur la loopback uniquement, ou pas du tout : les appelants sur `fn-net` utilisent `http://fn:8080` |

Pour l'invoquer : voir [Invoquer une fonction](./invoke.md).

## 3. Ajouter un healthcheck

`docker run --health-cmd` n'offre que la forme shell, à ne pas utiliser. Utilisez compose et la forme exec :

```yaml
services:
  fn:
    image: public.ecr.aws/lambda/nodejs:22
    entrypoint: ["/loch/lambda-runtime"]
    command: ["index.handler"]
    user: "10001:10001"
    read_only: true
    cap_drop: [ALL]
    security_opt: ["no-new-privileges:true"]
    tmpfs: ["/tmp:size=64m"]
    mem_limit: 256m
    memswap_limit: 256m
    cpus: 0.5
    pids_limit: 128
    env_file: fn.env
    environment:
      AWS_LAMBDA_FUNCTION_TIMEOUT: "30"
    volumes:
      - ./loch-lambda-runtime-linux-amd64:/loch/lambda-runtime:ro  # ou -linux-arm64
      - ./fn:/var/task:ro
    healthcheck:
      test: ["CMD", "/loch/lambda-runtime", "health"]
      interval: 10s
      timeout: 5s
```

Ce fichier compose reprend les options ci-dessus ; il n'est pas testé en CI. `health` renvoie 0 quand la fonction est prête, 1 sinon (initialisation, erreur d'init, arrêt).

## Limites

| Réglage | Défaut | Effet |
|---|---|---|
| `AWS_LAMBDA_FUNCTION_TIMEOUT` | `300` (s) | Les invocations plus longues sont arrêtées et reçoivent `Sandbox.Timedout` |
| `LOCH_RUNTIME_QUEUE_SIZE` | `16` | Invocations en attente ; au-delà, 429 |
| `LOCH_RUNTIME_QUEUE_BYTES` | `min(32MiB, memory/8)` | Taille totale des invocations en attente ; au-delà, 429 |
| `LOCH_RUNTIME_QUEUE_TIMEOUT` | `30s` | Attente maximale dans la file ; au-delà, 429 |
| `LOCH_RUNTIME_MAX_PAYLOAD` | `6MiB` | Les requêtes plus grosses reçoivent 413 |
| `LOCH_RUNTIME_SHUTDOWN_GRACE` | `8s` | Temps laissé à l'invocation en cours lors d'un `docker stop` |

Liste complète : [référence de configuration](../reference/configuration.md).

## Bon à savoir

- N'utilisez jamais `--network host` : la loopback n'exige aucun identifiant, donc tous les processus de l'hôte pourraient invoquer la fonction.
- Gardez `LOCH_RUNTIME_SHUTDOWN_GRACE` plus court que le délai d'arrêt du conteneur (`stop_grace_period`, 10 s par défaut dans Docker). Sur SIGTERM, les invocations en file reçoivent 503.
- Un tmpfs compte dans la limite mémoire du conteneur.
- L'API Invoke est en HTTP clair : gardez-la sur des réseaux privés.
- Ne facturez et n'alertez jamais à partir des logs de la fonction : son code peut forger des lignes `START`/`END`/`REPORT`. Utilisez les [métriques](./logs-and-metrics.md).

---

« AWS » et « AWS Lambda » sont des marques d'Amazon.com, Inc. ou de ses sociétés affiliées. Ce projet n'est ni affilié à Amazon ni approuvé par Amazon. Il implémente les API Runtime et Invoke d'AWS Lambda, documentées publiquement, et ne contient aucun code de l'AWS Lambda Runtime Interface Emulator.
