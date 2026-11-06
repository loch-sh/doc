---
sidebar_position: 1
slug: /
title: Loch Lambda Runtime
description: Exécutez des handlers écrits pour AWS Lambda dans de simples conteneurs Docker, avec les images de base AWS, grâce à un petit binaire statique qui implémente les API Runtime et Invoke.
---

# Loch Lambda Runtime

Loch Lambda Runtime exécute des handlers écrits pour AWS Lambda™ dans de simples conteneurs Docker, sans les modifier, avec les images de base publiées par AWS. C'est une alternative open source au Runtime Interface Emulator (RIE) fourni dans ces images de base. Il ne contient aucun code du RIE et ignore tout de la plateforme qui l'entoure.

C'est un binaire statique unique, `loch-lambda-runtime`, monté en lecture seule dans le conteneur sous `/loch/lambda-runtime` et utilisé comme point d'entrée.

1. [Installez le binaire et lancez une première fonction](./install.md).
2. [Exécutez-le en production](./guides/production.md).
3. [Invoquez la fonction](./guides/invoke.md) avec curl, l'AWS CLI ou un SDK AWS.

## Fonctionnement

Le binaire est le PID 1 du conteneur. Il lance le bootstrap de l'image (`/lambda-entrypoint.sh <handler>`) comme processus enfant et se place entre le bootstrap et les appelants.

| Côté | Ce qu'il sert | Adresse |
|---|---|---|
| Bootstrap | L'API Runtime d'AWS Lambda, version `2018-06-01` | `127.0.0.1:9001` (loopback uniquement) |
| Appelants | L'API Invoke d'AWS Lambda : `POST /2015-03-31/functions/{name}/invocations` | `0.0.0.0:8080` |
| Sondes | `/_loch/health`, `/_loch/metrics` (Prometheus) | port 8080, et `127.0.0.1:8081` pour `health` |

`aws lambda invoke --endpoint-url` et les SDK AWS fonctionnent sur le port 8080.

## Fonctionnalités

| Fonctionnalité | Comportement |
|---|---|
| Concurrence | Une invocation à la fois ; les autres attendent dans une file FIFO bornée (16 invocations, 30 s au plus). File pleine : 429 |
| Timeout | Appliqué (`AWS_LAMBDA_FUNCTION_TIMEOUT`, 300 s par défaut), puis le bootstrap est réinitialisé |
| Erreurs | Signalées comme AWS Lambda les signale : `X-Amz-Function-Error: Unhandled` et le corps de l'erreur |
| Mémoire épuisée | Détectée et signalée en `Runtime.OutOfMemory` |
| Payloads | Requêtes de 6 Mio ; une requête plus grosse reçoit 413. Une réponse n'est jamais tronquée |
| Logs | Lignes `START`, `END` et `REPORT`, en texte ou en JSON (`AWS_LAMBDA_LOG_FORMAT=JSON`) |
| Authentification | Obligatoire par défaut : jeton bearer (stocké sous forme de SHA-256) ou AWS SigV4 |
| Santé et métriques | `/_loch/health`, `/_loch/metrics`, et une sous-commande `health` pour les healthchecks Docker |

## Runtimes testés

La CI exécute ces images en amd64 et en arm64 :

| Runtime | Images |
|---|---|
| Node.js 22, 24, 26 | `mirror.gcr.io/amazon/aws-lambda-nodejs` ; `public.ecr.aws/lambda/nodejs:22` |
| Python 3.12, 3.13, 3.14 | `mirror.gcr.io/amazon/aws-lambda-python` ; `public.ecr.aws/lambda/python:3.13` |
| Runtime personnalisé (`provided.al2023`) | `public.ecr.aws/lambda/provided:al2023` avec un bootstrap Go (`aws-lambda-go`) |

Clients testés : curl avec un jeton bearer, AWS CLI 2.39.5 (SigV4), le SDK AWS v3 pour JavaScript, et la sous-commande `invoke` via `docker exec`. Les images Java, .NET et Ruby ne sont pas testées.

## Non pris en charge

- API Extensions et Telemetry : les extensions de layer dans `/opt/extensions` ne sont pas lancées.
- Streaming de la réponse vers le client : les réponses streamées sont mises en mémoire tampon, puis renvoyées en entier.
- SnapStart, l'export X-Ray, l'en-tête `Lambda-Runtime-Invocation-Id`.
- Invocations asynchrones (`X-Amz-Invocation-Type: Event`) : réponse 400.
- `Max Memory Used` dans `REPORT` est le pic du conteneur depuis son démarrage, pas celui de l'invocation.

## Différences avec AWS Lambda

- Un conteneur exécute une fonction, toujours chaude : pas de scale-to-zero.
- Pas de mise à l'échelle : un conteneur sert une invocation à la fois.
- C'est vous qui lancez le conteneur : options Docker, réseau et limites sont à votre charge.

---

« AWS » et « AWS Lambda » sont des marques d'Amazon.com, Inc. ou de ses sociétés affiliées. Ce projet n'est ni affilié à Amazon ni approuvé par Amazon. Il implémente les API Runtime et Invoke d'AWS Lambda, documentées publiquement, et ne contient aucun code de l'AWS Lambda Runtime Interface Emulator.
