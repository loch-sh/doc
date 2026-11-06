---
sidebar_position: 3
title: Invoquer une fonction
description: Invoquez une fonction avec curl et un jeton bearer, l'AWS CLI ou un SDK AWS en SigV4, ou la sous-commande invoke via docker exec.
---

# Invoquer une fonction

Le runtime implémente l'API Invoke d'AWS Lambda™ sur le port 8080 : `POST /2015-03-31/functions/{name}/invocations`. `{name}` vaut `function`, ou la valeur de `AWS_LAMBDA_FUNCTION_NAME`. Les exemples utilisent le conteneur `fn` et les identifiants de [Exécuter en production](./production.md).

## curl, avec un jeton bearer

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  localhost:8080/2015-03-31/functions/function/invocations -d '{"name":"curl"}'
```

Une erreur de la fonction répond tout de même 200, avec l'en-tête `X-Amz-Function-Error: Unhandled` et l'erreur dans le corps. Ajoutez `-i` pour la voir.

## AWS CLI, en SigV4

Depuis un conteneur sur le réseau de la fonction :

```bash
docker run --rm --network fn-net \
  -e AWS_ACCESS_KEY_ID="$KEY_ID" -e AWS_SECRET_ACCESS_KEY="$KEY_SECRET" -e AWS_DEFAULT_REGION=us-east-1 \
  amazon/aws-cli:2.39.5 lambda invoke --endpoint-url http://fn:8080 --function-name function \
  --payload '{"name":"cli"}' --cli-binary-format raw-in-base64-out /dev/stdout
```

N'importe quelle région convient. Ajoutez `--log-type Tail` pour obtenir les 4 derniers Ko de logs de l'invocation.

## SDK AWS

Pointez le client Lambda sur le runtime avec l'option d'endpoint et la paire SigV4. SDK AWS v3 pour JavaScript :

```js
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

const client = new LambdaClient({ endpoint: 'http://fn:8080', region: 'us-east-1' });
const out = await client.send(new InvokeCommand({
  FunctionName: 'function',
  Payload: Buffer.from(JSON.stringify({ name: 'sdk' })),
}));
console.log(out.FunctionError ?? 'ok', Buffer.from(out.Payload).toString());
```

Le SDK lit `AWS_ACCESS_KEY_ID` et `AWS_SECRET_ACCESS_KEY` dans l'environnement. Il relance de lui-même les réponses 429.

## Depuis l'intérieur du conteneur

`invoke` lit l'événement sur stdin et invoque par la loopback, sans identifiant :

```bash
echo '{"name":"exec"}' | docker exec -i fn /loch/lambda-runtime invoke --log-tail
```

Il affiche une enveloppe JSON : `statusCode`, `functionError`, `requestId`, `durationMs`, `payload` (base64) et `logTail` (base64). Codes de sortie : 0 livré (quel que soit le résultat de la fonction), 1 erreur de transport ou appelant parti, 2 événement inutilisable.

Options : [référence de la ligne de commande](../reference/command-line.md#invoke).

## Bon à savoir

- Une seule invocation s'exécute à la fois. Les autres attendent dans la file ; une file pleine répond 429 avec `Retry-After`.
- Les invocations asynchrones (`--invocation-type Event`) reçoivent 400. `DryRun` reçoit 204.
- L'identifiant de requête est toujours généré par le runtime : lisez-le dans `x-amzn-RequestId`.
- Tous les codes de statut et erreurs : [référence de l'API Invoke](../reference/invoke-api.md).

---

« AWS » et « AWS Lambda » sont des marques d'Amazon.com, Inc. ou de ses sociétés affiliées. Ce projet n'est ni affilié à Amazon ni approuvé par Amazon. Il implémente les API Runtime et Invoke d'AWS Lambda, documentées publiquement, et ne contient aucun code de l'AWS Lambda Runtime Interface Emulator.
