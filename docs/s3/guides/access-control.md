---
sidebar_position: 3
title: Access control
description: Understand authentication modes, bucket ownership, canned ACLs and bucket policies in Loch S3.
---

# Access control

## Authentication modes

The server picks one mode at startup, in this order:

| Mode | Set | Behavior |
|---|---|---|
| Multi-user | `S3_USERS_FILE` | Users from a JSON file, one of them `root`. See [Users and admin API](../admin/users.md) |
| Single user | `S3_ACCESS_KEY_ID` + `S3_SECRET_ACCESS_KEY` | One key pair, with root rights |
| Open | nothing | Every request is accepted without a signature. Local tests only |

## Who can do what

| Caller | Access |
|---|---|
| `root` | Everything |
| Bucket owner | Everything on the buckets they created |
| Other user | Create buckets. On other buckets: only what a bucket policy grants. `ListBuckets` shows the buckets they own or may list (`s3:ListBucket`) |
| Anonymous | Only what a bucket policy or a public ACL grants |

Buckets are private by default. Only root and the owner can change a bucket's policy, CORS, encryption, versioning or ACL, or delete it.

## Canned ACLs

Make a bucket or an object public:

```bash
aws s3api put-bucket-acl --bucket my-bucket --acl public-read
aws s3api put-object-acl --bucket my-bucket --key logo.png --acl public-read
```

| ACL | Anonymous access |
|---|---|
| `private` | None |
| `public-read` | Read |
| `public-read-write` | Read and write |

## Bucket policies {#bucket-policies}

A bucket policy is a JSON document of `Allow` and `Deny` statements. A user is named by `arn:loch:iam:::user/<user_id>`, a resource by `arn:loch:s3:::<bucket>/<key>`.

Give the user `reader` read-only access to `media`:

```bash
aws s3api put-bucket-policy --bucket media --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"AWS": "arn:loch:iam:::user/reader"},
    "Action": ["s3:GetObject", "s3:ListBucket"],
    "Resource": ["arn:loch:s3:::media", "arn:loch:s3:::media/*"]
  }]
}'
```

Make every object public: use `"Principal": "*"` and `"Action": "s3:GetObject"` on `arn:loch:s3:::media/*`.

Read or remove it with `get-bucket-policy` and `delete-bucket-policy`. Syntax, actions and evaluation: [Bucket policy reference](../reference/bucket-policies.md).

## Good to know

- An explicit `Deny` wins over any `Allow` and over ACLs.
- `Condition`, `NotAction`, `NotResource` and `NotPrincipal` are rejected with `MalformedPolicy`.
- A bucket-level `READ` grant (`public-read`) also allows anonymous downloads of every object in the bucket, not only the listing.
- Policies match keys case-sensitively: keep the data directory on a case-sensitive filesystem.
