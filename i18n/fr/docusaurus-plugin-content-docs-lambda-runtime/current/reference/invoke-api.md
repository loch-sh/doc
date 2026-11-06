---
sidebar_position: 3
title: Référence de l'API Invoke
description: Le point d'accès de l'API Invoke, ses en-têtes, les résultats de la fonction, les formes d'erreur et les codes de statut.
---

# Référence de l'API Invoke

Le runtime implémente l'API Invoke d'AWS Lambda™ sur `LOCH_RUNTIME_INVOKE_ADDR` (`0.0.0.0:8080`), en HTTP clair.

## Point d'accès

```text
POST /2015-03-31/functions/{name}/invocations
```

| Élément | Valeurs acceptées |
|---|---|
| `{name}` | `function` ou `AWS_LAMBDA_FUNCTION_NAME` ; `<name>:$LATEST` ; l'ARN `arn:aws:lambda:<AWS_REGION>:000000000000:function:<name>` ; l'ARN partiel `000000000000:function:<name>` |
| `?Qualifier=` | Absent ou `$LATEST` |
| Méthode | `POST` uniquement ; toute autre méthode reçoit 405 et n'invoque jamais |
| Corps | L'événement brut, jusqu'à `LOCH_RUNTIME_MAX_PAYLOAD` (6 Mio). Un corps vide est transmis tel quel |

## En-têtes de requête

| En-tête | Effet |
|---|---|
| `Authorization` | Jeton bearer ou signature SigV4, sauf si l'appelant est sur la loopback |
| `X-Amz-Invocation-Type` | `RequestResponse` (défaut) ; `DryRun` répond 204 ; `Event` répond 400 (non pris en charge) |
| `X-Amz-Log-Type: Tail` | Renvoie les 4 derniers Ko de logs de l'invocation, en base64, dans `X-Amz-Log-Result` |
| `X-Amz-Client-Context` | Objet JSON en base64, 3 583 octets au plus ; transmis à la fonction |
| `X-Amzn-Trace-Id` | Devient l'identifiant de trace s'il est valide |

En SigV4, chaque en-tête `x-amz-*` et `Content-Type` doivent être signés, comme sur AWS.

## Résultats de la fonction

La livraison répond 200, avec `x-amzn-RequestId`, `X-Amz-Executed-Version: $LATEST` et `Content-Type`.

| Résultat | Corps |
|---|---|
| Succès | La réponse de la fonction, jamais tronquée |
| Erreur de la fonction | `X-Amz-Function-Error: Unhandled` et l'erreur postée par la fonction, telle quelle |
| Erreur d'init | `X-Amz-Function-Error: Unhandled` et l'erreur d'init (`Runtime.ImportModuleError`, `Runtime.HandlerNotFound`, …) |
| Réponse de plus de 6 Mio + 100 octets | `Function.ResponseSizeTooLarge`, puis réinitialisation |
| Timeout | `Sandbox.Timedout`, `Task timed out after N seconds`, puis réinitialisation |
| Mémoire épuisée | `Runtime.OutOfMemory`, puis réinitialisation |
| Bootstrap arrêté | `Runtime.ExitError`, `Runtime exited with error: exit status N`, puis réinitialisation |

Les corps d'erreur sont de la forme `{"errorType":"…","errorMessage":"…"}`. Comparez sur `errorType`, pas sur le message.

## Erreurs de l'API

Les erreurs de l'API elle-même (pas celles de la fonction) portent l'en-tête `x-amzn-ErrorType: <Name>`, `x-amzn-RequestId`, et le corps `{"Type":"User","message":"…"}` (`"Type":"Service"` pour les 5xx). Le corps d'un 429 contient aussi `"Reason":"ReservedFunctionConcurrentInvocationLimitExceeded"`.

| Statut | Nom | Quand |
|---|---|---|
| 400 | `InvalidParameterValueException` | `X-Amz-Invocation-Type: Event`, ou un autre paramètre invalide |
| 400 | `InvalidRequestContentException` | `X-Amz-Client-Context` invalide |
| 401 | `MissingAuthenticationTokenException` | Aucun identifiant |
| 403 | `UnrecognizedClientException` | Mauvais jeton bearer ou access key id inconnu |
| 403 | `InvalidSignatureException`, `IncompleteSignatureException` | Signature SigV4 fausse, expirée ou mal formée |
| 403 | `AccessDeniedException` | Requête d'un navigateur web (`Origin`, `Sec-Fetch-Site`, `Sec-Fetch-Dest`, `Sec-Fetch-User`) |
| 404 | `ResourceNotFoundException` | Nom de fonction, qualificateur ou route inconnus |
| 405 | `MethodNotAllowedException` | Méthode autre que `POST` |
| 408 | `RequestTimeoutException` | Corps non reçu à temps |
| 413 | `RequestTooLargeException` | Requête au-delà de `LOCH_RUNTIME_MAX_PAYLOAD` |
| 429 | `TooManyRequestsException` | File pleine ou attente trop longue, trop de connexions ou de requêtes d'une même IP. `Retry-After` est présent ; les SDK AWS réessaient d'eux-mêmes |
| 503 | `ServiceException` | Le runtime s'arrête. `Retry-After: 1` |

Les erreurs d'authentification ferment la connexion.

## Autres routes

| Route | Identifiant | Réponse |
|---|---|---|
| `GET /_loch/health` | Aucun | 200 `{"status":"ready","queueDepth":0}`, ou 503 avec `initializing`, `error` ou `stopping` |
| `GET /_loch/metrics` | Obligatoire, sauf depuis la loopback | Format texte Prometheus : voir la [référence des métriques](./metrics.md) |

---

« AWS » et « AWS Lambda » sont des marques d'Amazon.com, Inc. ou de ses sociétés affiliées. Ce projet n'est ni affilié à Amazon ni approuvé par Amazon. Il implémente les API Runtime et Invoke d'AWS Lambda, documentées publiquement, et ne contient aucun code de l'AWS Lambda Runtime Interface Emulator.
