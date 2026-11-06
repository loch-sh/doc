---
sidebar_position: 2
title: Buckets and objects
description: Create buckets, upload and download objects, use metadata, presigned URLs, multipart uploads and versioning.
---

# Buckets and objects

The examples use the AWS CLI configured as in [Connect a client](./connect-a-client.md), with `--endpoint-url` omitted.

## Buckets

```bash
aws s3 mb s3://my-bucket      # create
aws s3 ls                     # list your buckets
aws s3 rb s3://my-bucket      # delete (must be empty)
```

| Rule | Value |
|---|---|
| Name | 3 to 63 characters: lowercase letters, digits, `-` and `.`; starts and ends with a letter or digit |
| Owner | The user who creates the bucket. The owner has full access to it |
| Delete | Refused with `BucketNotEmpty` while objects, old versions or multipart uploads remain |

## Objects

```bash
aws s3 cp photo.jpg s3://my-bucket/2026/photo.jpg       # upload
aws s3 cp s3://my-bucket/2026/photo.jpg ./photo.jpg     # download
aws s3 ls s3://my-bucket/2026/                          # list a prefix
aws s3 rm s3://my-bucket/2026/photo.jpg                 # delete
```

Stored headers: `Content-Type`, `Cache-Control`, `Content-Disposition`, `Content-Encoding`, `Content-Language`, `Expires` and custom `x-amz-meta-*` metadata (2 KiB in total).

```bash
aws s3api put-object --bucket my-bucket --key notes.txt --body notes.txt \
  --content-type "text/plain; charset=utf-8" --metadata author=alice
```

Keys are limited to 1,024 bytes and 64 `/`-separated levels. A key with a `.`, `..` or empty segment (`a/./b`, `a//b`) is rejected.

`GET` supports `Range: bytes=a-b`, `bytes=a-` and `bytes=-n`.

## Presigned URLs

A presigned URL gives temporary access to one object without credentials. Validity: 1 second to 7 days.

```bash
aws s3 presign s3://my-bucket/report.pdf --expires-in 3600
```

`aws s3 presign` only creates GET URLs. Create PUT URLs with an SDK (`generate_presigned_url("put_object", ...)` in boto3).

## Multipart upload

The AWS CLI and SDKs switch to multipart upload for large files on their own. Parts are numbered 1 to 10,000. The server sets no minimum or maximum part size.

Unfinished uploads are deleted after `S3_UPLOAD_TTL` (24 hours by default). To abort one now:

```bash
aws s3api list-multipart-uploads --bucket my-bucket
aws s3api abort-multipart-upload --bucket my-bucket --key big.iso --upload-id <upload-id>
```

## Versioning

Versioning keeps every version of an object. Only the bucket owner or root can change it.

```bash
aws s3api put-bucket-versioning --bucket my-bucket --versioning-configuration Status=Enabled
aws s3api list-object-versions --bucket my-bucket --prefix report.pdf
aws s3api get-object --bucket my-bucket --key report.pdf --version-id <version-id> old.pdf
```

| Action | Result |
|---|---|
| Upload | Creates a new version; the response carries `x-amz-version-id` |
| Delete without `--version-id` | Adds a delete marker; older versions stay |
| Delete with `--version-id` | Removes that version for good |
| `Status=Suspended` | New uploads overwrite the `null` version; existing versions stay |

## Good to know

- Multi-object delete (`aws s3api delete-objects`) is not supported. Tools that delete in batches fail; delete objects one by one.
- In a versioned bucket, an object completed by a multipart upload does not create a version.
- Each write in a versioned bucket counts twice against the [quota](../admin/production.md#quota).
