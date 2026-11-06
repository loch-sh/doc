---
sidebar_position: 2
title: Installation
description: Téléchargez le binaire loch-lambda-runtime, vérifiez sa signature et sa provenance, et lancez une première fonction Node.js avec l'image de base AWS.
---

# Installation

Loch Lambda Runtime est distribué sous forme de binaire Linux statique sur [GitHub Releases](https://github.com/loch-sh/lambda-runtime/releases). Il n'y a pas d'image Docker : vous montez le binaire dans l'image de base de votre fonction (les images de base AWS Lambda™, par exemple).

## Fichiers d'une release

| Fichier | Contenu |
|---|---|
| `loch-lambda-runtime-linux-amd64` | Binaire pour x86-64 |
| `loch-lambda-runtime-linux-arm64` | Binaire pour ARM64 |
| `loch-lambda-runtime-linux-<arch>.cdx.json` | SBOM CycloneDX de chaque binaire |
| `SHA256SUMS` | Sommes de contrôle des quatre fichiers ci-dessus |
| `SHA256SUMS.cosign.bundle` | Signature cosign keyless de `SHA256SUMS` |

## Télécharger et vérifier {#download-and-verify}

Il vous faut [cosign](https://docs.sigstore.dev/cosign/system_config/installation/) et, pour la vérification de provenance, la [CLI GitHub](https://cli.github.com/).

1. Téléchargez le binaire de votre architecture, les sommes de contrôle et la signature :

   ```bash
   VERSION=v1.0.1
   ARCH=amd64   # ou arm64
   BASE=https://github.com/loch-sh/lambda-runtime/releases/download/$VERSION
   curl -fLO "$BASE/loch-lambda-runtime-linux-$ARCH"
   curl -fLO "$BASE/SHA256SUMS"
   curl -fLO "$BASE/SHA256SUMS.cosign.bundle"
   ```

2. Vérifiez la signature de `SHA256SUMS`. L'identité la lie au workflow de release et au tag :

   ```bash
   cosign verify-blob SHA256SUMS --bundle SHA256SUMS.cosign.bundle \
     --certificate-identity "https://github.com/loch-sh/lambda-runtime/.github/workflows/ci.yml@refs/tags/$VERSION" \
     --certificate-oidc-issuer https://token.actions.githubusercontent.com
   ```

3. Vérifiez la somme de contrôle du binaire (`--ignore-missing` : vous n'avez pas téléchargé tous les fichiers) :

   ```bash
   sha256sum -c --ignore-missing SHA256SUMS
   # macOS : shasum -a 256 -c --ignore-missing SHA256SUMS
   ```

4. Facultatif : vérifiez la provenance du build, qui lie le binaire au commit et au tag qui l'ont produit :

   ```bash
   gh attestation verify "loch-lambda-runtime-linux-$ARCH" --repo loch-sh/lambda-runtime
   ```

5. Rendez-le exécutable. Il tourne sous un utilisateur non root dans le conteneur : il doit être lisible et exécutable par tous :

   ```bash
   chmod 0755 "loch-lambda-runtime-linux-$ARCH"
   ```

## Démarrage rapide {#quick-start}

Lancez une fonction Node.js avec l'image de base publiée par AWS, le binaire monté comme point d'entrée. Docker choisit l'image adaptée à votre machine ; `ARCH` doit lui correspondre.

```bash
mkdir -p fn && echo 'exports.handler = async (event) => ({ hello: event.name ?? "world" });' > fn/index.js
ARCH=$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/')

docker run --rm -p 127.0.0.1:8080:8080 \
  -v "$PWD/loch-lambda-runtime-linux-$ARCH:/loch/lambda-runtime:ro" \
  -v "$PWD/fn:/var/task:ro" \
  -e LOCH_RUNTIME_AUTH=off \
  --entrypoint /loch/lambda-runtime \
  public.ecr.aws/lambda/nodejs:22 index.handler
```

`index.handler` est le handler, comme sur AWS : l'export `handler` de `index.js`. Invoquez-le depuis un autre terminal :

```bash
curl localhost:8080/2015-03-31/functions/function/invocations -d '{"name":"you"}'
# {"hello":"you"}
```

Ou avec l'AWS CLI. Authentification désactivée, les identifiants ne sont pas vérifiés, mais la CLI en a besoin pour signer :

```bash
AWS_ACCESS_KEY_ID=x AWS_SECRET_ACCESS_KEY=x AWS_DEFAULT_REGION=us-east-1 \
  aws lambda invoke --endpoint-url http://localhost:8080 --function-name function \
  --payload '{"name":"cli"}' --cli-binary-format raw-in-base64-out /dev/stdout
```

:::warning
`LOCH_RUNTIME_AUTH=off` sert uniquement à cet essai local. Par défaut, le runtime refuse de démarrer sans identifiant. Voir [Exécuter en production](./guides/production.md).
:::

## Bon à savoir

- `function` est le nom de fonction par défaut. Définissez `AWS_LAMBDA_FUNCTION_NAME` pour en utiliser un autre dans l'URL.
- Le binaire ne dépend ni de la libc ni des outils de l'image : il fonctionne sur toute image de base Linux.
- Pour ajouter le binaire à une image au lieu de le monter, voir [Runtimes et images personnalisés](./guides/custom-runtimes.md#build-an-image).

---

« AWS » et « AWS Lambda » sont des marques d'Amazon.com, Inc. ou de ses sociétés affiliées. Ce projet n'est ni affilié à Amazon ni approuvé par Amazon. Il implémente les API Runtime et Invoke d'AWS Lambda, documentées publiquement, et ne contient aucun code de l'AWS Lambda Runtime Interface Emulator.
