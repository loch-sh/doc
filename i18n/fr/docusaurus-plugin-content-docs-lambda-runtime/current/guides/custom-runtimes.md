---
sidebar_position: 4
title: Runtimes et images personnalisés
description: Lancez un bootstrap Go sur provided.al2023, passez la commande de n'importe quelle image après --, ou construisez une image qui contient le runtime.
---

# Runtimes et images personnalisés

Le runtime lance la commande qui exécute la fonction. Par défaut, c'est le script d'entrée des images de base AWS : `index.handler` signifie `/lambda-entrypoint.sh index.handler`. Passez toute autre commande après `--`.

## Un bootstrap Go sur provided.al2023

Sur `provided.al2023`, la fonction est un exécutable nommé `bootstrap` dans `/var/task`. Avec `aws-lambda-go` :

1. Compilez un binaire statique pour l'architecture de l'image, lisible et exécutable par tous :

   ```bash
   CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -tags lambda.norpc -o fn/bootstrap .
   chmod 0755 fn/bootstrap
   ```

2. Lancez-le. `/lambda-entrypoint.sh` exige un argument handler, que Go ignore : utilisez `bootstrap`.

   ```bash
   docker run -d --name fn --read-only --user 10001:10001 --cap-drop ALL \
     -v "$PWD/loch-lambda-runtime-linux-arm64:/loch/lambda-runtime:ro" \
     -v "$PWD/fn:/var/task:ro" \
     --env-file fn.env \
     --entrypoint /loch/lambda-runtime \
     public.ecr.aws/lambda/provided:al2023 bootstrap
   ```

`-- ./bootstrap` fonctionne aussi : la commande est résolue depuis le répertoire de travail, `/var/task`.

| Problème | Cause |
|---|---|
| `Runtime.InvalidEntrypoint`, `no bootstrap found at /var/task/bootstrap or /opt/bootstrap` | Pas de fichier `bootstrap` |
| `Runtime.InvalidEntrypoint`, `failed to exec /var/task/bootstrap` | Non exécutable ou non lisible par l'utilisateur du conteneur, ou mauvaise architecture (raison sur stderr) |
| `Runtime.ExitError` | Le bootstrap s'est arrêté pendant l'init |

Dans chaque cas, `health` échoue, chaque invocation répond avec cette erreur, et l'init est relancée.

## N'importe quelle image : passer la commande après `--`

Pour une image qui n'utilise pas `/lambda-entrypoint.sh`, placez l'ENTRYPOINT et le CMD de l'image après `--` :

```bash
docker image inspect --format '{{json .Config.Entrypoint}} {{json .Config.Cmd}}' my-function:latest
docker run … --entrypoint /loch/lambda-runtime my-function:latest -- <entrypoint> <cmd...>
```

Seules les images de base AWS sont testées en CI.

## Construire une image {#build-an-image}

Vous pouvez copier le binaire dans une image au lieu de le monter. Cette variante n'est pas testée en CI. `COPY --chmod` nécessite BuildKit (par défaut depuis Docker 23).

```dockerfile
FROM public.ecr.aws/lambda/nodejs:22
COPY --chmod=0755 loch-lambda-runtime-linux-amd64 /loch/lambda-runtime
COPY index.js /var/task/
ENTRYPOINT ["/loch/lambda-runtime"]
CMD ["index.handler"]
```

Lancez-la avec les mêmes options que dans [Exécuter en production](./production.md), sans le `-v` du binaire ni `--entrypoint`.

## Bon à savoir

- Docker Desktop sur macOS n'applique pas les propriétaires de fichiers sur les bind mounts : un bootstrap en `0700` y fonctionne, mais échoue sous Linux. Utilisez `0755`.
- Un binaire de la mauvaise architecture échoue avec `Exec format error`, sauf si Docker émule cette architecture.
- `/var/task` est en lecture seule : n'écrivez que dans `/tmp`.
- Utilisez `/loch/lambda-runtime`, hors de `/opt` : `/opt` est le dossier des layers (le bootstrap de `provided.al2023` y cherche `/opt/bootstrap`).

---

« AWS » et « AWS Lambda » sont des marques d'Amazon.com, Inc. ou de ses sociétés affiliées. Ce projet n'est ni affilié à Amazon ni approuvé par Amazon. Il implémente les API Runtime et Invoke d'AWS Lambda, documentées publiquement, et ne contient aucun code de l'AWS Lambda Runtime Interface Emulator.
