---
sidebar_position: 5
title: CORS
description: Allow web pages on other origins to call a Loch S3 bucket from the browser.
---

# CORS

A CORS configuration lets a web page on another origin read or upload objects of a bucket from the browser. Only the bucket owner or root can set it.

```bash
aws s3api put-bucket-cors --bucket my-bucket --cors-configuration '{
  "CORSRules": [{
    "AllowedOrigins": ["https://app.example.com"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }]
}'
```

| Field | Role |
|---|---|
| `AllowedOrigins` | Origins allowed. `*` for any, or one `*` inside a pattern: `https://*.example.com` |
| `AllowedMethods` | `GET`, `PUT`, `POST`, `DELETE`, `HEAD` |
| `AllowedHeaders` | Request headers allowed in the preflight. `*` for any |
| `ExposeHeaders` | Response headers the browser may read, for example `ETag` |
| `MaxAgeSeconds` | How long the browser caches the preflight answer |

The first rule that matches the origin and the method applies. Read or remove the configuration with `get-bucket-cors` and `delete-bucket-cors`.

## Good to know

- CORS does not grant access: the request still needs a signature, a presigned URL or a public policy or ACL.
- Preflight `OPTIONS` requests are answered without authentication.
- For browser uploads, give the page a presigned PUT URL created by your backend.
