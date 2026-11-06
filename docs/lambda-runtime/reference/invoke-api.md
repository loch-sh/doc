---
sidebar_position: 3
title: Invoke API reference
description: The Invoke API endpoint, its headers, function results, error shapes and status codes.
---

# Invoke API reference

The runtime implements the AWS Lambda™ Invoke API on `LOCH_RUNTIME_INVOKE_ADDR` (`0.0.0.0:8080`), plain HTTP.

## Endpoint

```text
POST /2015-03-31/functions/{name}/invocations
```

| Part | Accepted values |
|---|---|
| `{name}` | `function` or `AWS_LAMBDA_FUNCTION_NAME`; `<name>:$LATEST`; the ARN `arn:aws:lambda:<AWS_REGION>:000000000000:function:<name>`; the partial ARN `000000000000:function:<name>` |
| `?Qualifier=` | Absent or `$LATEST` |
| Method | `POST` only; any other method gets 405 and never invokes |
| Body | The raw event, up to `LOCH_RUNTIME_MAX_PAYLOAD` (6 MiB). An empty body is passed as is |

## Request headers

| Header | Effect |
|---|---|
| `Authorization` | Bearer token or SigV4 signature, unless the caller is on the loopback |
| `X-Amz-Invocation-Type` | `RequestResponse` (default); `DryRun` answers 204; `Event` answers 400 (not supported) |
| `X-Amz-Log-Type: Tail` | Returns the last 4 KB of the invocation logs, base64, in `X-Amz-Log-Result` |
| `X-Amz-Client-Context` | Base64 JSON object, 3,583 bytes at most; passed to the function |
| `X-Amzn-Trace-Id` | Becomes the trace id when valid |

With SigV4, every `x-amz-*` header and `Content-Type` must be signed, as on AWS.

## Function results

The delivery answers 200, with `x-amzn-RequestId`, `X-Amz-Executed-Version: $LATEST` and `Content-Type`.

| Result | Body |
|---|---|
| Success | The function's response, never truncated |
| Function error | `X-Amz-Function-Error: Unhandled` and the error the function posted, verbatim |
| Init error | `X-Amz-Function-Error: Unhandled` and the init error (`Runtime.ImportModuleError`, `Runtime.HandlerNotFound`, …) |
| Response over 6 MiB + 100 bytes | `Function.ResponseSizeTooLarge`, then re-init |
| Timeout | `Sandbox.Timedout`, `Task timed out after N seconds`, then re-init |
| Out of memory | `Runtime.OutOfMemory`, then re-init |
| Bootstrap exited | `Runtime.ExitError`, `Runtime exited with error: exit status N`, then re-init |

Error bodies are `{"errorType":"…","errorMessage":"…"}`. Match on `errorType`, not on the message.

## Errors of the API

Errors of the API itself (not of the function) have the header `x-amzn-ErrorType: <Name>`, `x-amzn-RequestId`, and the body `{"Type":"User","message":"…"}` (`"Type":"Service"` for 5xx). A 429 body also has `"Reason":"ReservedFunctionConcurrentInvocationLimitExceeded"`.

| Status | Name | When |
|---|---|---|
| 400 | `InvalidParameterValueException` | `X-Amz-Invocation-Type: Event`, or another invalid parameter |
| 400 | `InvalidRequestContentException` | Invalid `X-Amz-Client-Context` |
| 401 | `MissingAuthenticationTokenException` | No credential |
| 403 | `UnrecognizedClientException` | Wrong bearer token or unknown access key id |
| 403 | `InvalidSignatureException`, `IncompleteSignatureException` | Wrong, expired or malformed SigV4 signature |
| 403 | `AccessDeniedException` | Request from a web browser (`Origin`, `Sec-Fetch-Site`, `Sec-Fetch-Dest`, `Sec-Fetch-User`) |
| 404 | `ResourceNotFoundException` | Unknown function name, qualifier or route |
| 405 | `MethodNotAllowedException` | Method other than `POST` |
| 408 | `RequestTimeoutException` | Body not received in time |
| 413 | `RequestTooLargeException` | Request over `LOCH_RUNTIME_MAX_PAYLOAD` |
| 429 | `TooManyRequestsException` | Queue full or wait too long, too many connections or requests from one IP. `Retry-After` is set; AWS SDKs retry by themselves |
| 503 | `ServiceException` | The runtime is shutting down. `Retry-After: 1` |

Authentication errors close the connection.

## Other routes

| Route | Credential | Answer |
|---|---|---|
| `GET /_loch/health` | None | 200 `{"status":"ready","queueDepth":0}`, or 503 with `initializing`, `error` or `stopping` |
| `GET /_loch/metrics` | Required, except from the loopback | Prometheus text: see [Metrics reference](./metrics.md) |

---

"AWS" and "AWS Lambda" are trademarks of Amazon.com, Inc. or its affiliates. This project is not affiliated with or endorsed by Amazon. It implements the publicly documented AWS Lambda Runtime and Invoke APIs and contains no code from the AWS Lambda Runtime Interface Emulator.
