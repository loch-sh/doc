---
sidebar_position: 4
title: Bucket policy reference
description: Syntax, principals, actions, resources and evaluation rules of Loch S3 bucket policies.
---

# Bucket policy reference

A bucket policy is a JSON document set with `PutBucketPolicy` (`aws s3api put-bucket-policy`) by the bucket owner or root. Maximum size: 20 KiB.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadOnlyForReader",
      "Effect": "Allow",
      "Principal": {"AWS": ["arn:loch:iam:::user/reader"]},
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": ["arn:loch:s3:::media", "arn:loch:s3:::media/*"]
    }
  ]
}
```

## Fields

| Field | Values |
|---|---|
| `Version` | `2012-10-17` or `2008-10-17` |
| `Statement` | At least one statement |
| `Sid` | Optional label |
| `Effect` | `Allow` or `Deny` |
| `Principal` | `"*"` (everyone, anonymous included), or `{"AWS": "<arn>"}` / `{"AWS": ["<arn>", …]}` with `arn:loch:iam:::user/<user_id>` |
| `Action` | One action or a list (below) |
| `Resource` | One ARN or a list (below) |

Any other field (`Condition`, `NotAction`, `NotResource`, `NotPrincipal`…) makes the policy invalid: `400 MalformedPolicy`.

## Actions

| Action | Request |
|---|---|
| `s3:GetObject` | GET or HEAD of an object |
| `s3:PutObject` | PUT or POST on an object: upload, copy destination, multipart |
| `s3:DeleteObject` | DELETE of an object |
| `s3:ListBucket` | List objects, multipart uploads |
| `s3:GetBucketLocation` | HEAD of the bucket |
| `s3:GetObjectVersion` | GET or HEAD with `versionId`; `s3:GetObject` also matches |
| `s3:DeleteObjectVersion` | DELETE with `versionId`; `s3:DeleteObject` also matches |
| `s3:ListBucketVersions` | `GET /{bucket}?versions`; `s3:ListBucket` also matches |

Actions match like on AWS: case-insensitive, with `*` and `?` wildcards (`*`, `s3:*`, `s3:Get*`). An action that is not `*` or `s3:<name>` makes the policy invalid.

## Resources

| Resource | ARN |
|---|---|
| The bucket (listing) | `arn:loch:s3:::media` |
| Every object | `arn:loch:s3:::media/*` |
| Objects under a prefix | `arn:loch:s3:::media/public/*` |
| Everything | `*` |

`arn:aws:s3:::` is accepted in place of `arn:loch:s3:::`. Only a trailing `*` is a wildcard. Keys are compared case-sensitively.

## Evaluation

1. Root and the bucket owner are always allowed. Policies do not apply to them.
2. Only root and the owner can change the bucket's policy, CORS, encryption, versioning and ACL, or delete it.
3. For anyone else, a matching `Deny` refuses the request.
4. Otherwise, a matching `Allow` grants it.
5. Otherwise, anonymous requests may still be granted by a public ACL. Authenticated users are refused.

A copy also needs `s3:GetObject` (or `s3:GetObjectVersion`) on the source. A stored policy that can no longer be read refuses every request covered by step 3.
