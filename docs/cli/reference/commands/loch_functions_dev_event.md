---
title: "loch functions dev event"
description: "Print a sample event (JSON) to pipe into loch functions dev invoke"
sidebar_label: "functions dev event"
slug: "loch-functions-dev-event"
---

## loch functions dev event

Print a sample event (JSON) to pipe into loch functions dev invoke

### Synopsis

Print a sample event on stdout, shaped like the AWS Lambda event examples, with fake values (account
000000000000, region us-east-1, the current time):
  s3-put          S3 ObjectCreated:Put notification (--bucket, --key; the key URL-encoded as S3 does)
  sqs             SQS message batch of one record (--body)
  api-gateway-v2  API Gateway HTTP API request, payload format 2.0 (--method, --path with an optional
                  query string, --body)
  schedule        EventBridge scheduled event

```
loch functions dev event <api-gateway-v2|s3-put|schedule|sqs> [flags]
```

### Examples

```
  loch functions dev event s3-put --bucket media --key 'uploads/red flower.jpg' | loch functions dev invoke thumbnail
  loch functions dev event api-gateway-v2 --method POST --path '/items?full=1' --body '{"name":"a"}' > event.json
  loch functions dev invoke --event event.json
```

### Options

```
      --body string     api-gateway-v2, sqs: request or message body
      --bucket string   s3-put: bucket name (default example-bucket)
  -h, --help            help for event
      --key string      s3-put: object key (default uploads/example.jpg)
      --method string   api-gateway-v2: HTTP method (default GET)
      --path string     api-gateway-v2: path and optional query string (default /)
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch functions dev](loch_functions_dev.md)	 - Run a function locally with Docker and the loch runtime (no panel)

