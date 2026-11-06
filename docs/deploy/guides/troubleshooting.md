---
sidebar_position: 4
title: Troubleshooting
description: Fix the common Loch Deploy errors seen in GitLab CI jobs - 400, 401, 403, 409, 5xx and silent failures.
---

# Troubleshooting

Error responses are plain text. Use `curl --fail-with-body` so the job prints them. The admin finds the precise reason of every refusal in the audit log (`auth_error`, `authz_error`, `error`).

| Symptom | Cause | Fix |
|---|---|---|
| Job fails with no message | `curl -f` hides the response body | Use `curl --fail-with-body` |
| `400` "token is missing the environment claim" | The job has no `environment:` | Add `environment:` to every job that calls the server |
| `400` with a list of violations | The compose file breaks the policy | Fix each item: [compose rules](./compose-file.md) |
| `400` on a bind mount "does not exist" or not a directory | The directory was not created by `/directories` before `/deploy` | Call `/directories` first, then mount exactly `<key>/<service>/<name>` |
| `401` | Token missing, expired, older than 10 minutes, or wrong `aud` | Check `id_tokens.aud` = `GITLAB_AUDIENCE`; call the server early in the job |
| `403` on every call | Runner IP not in `ALLOWED_IPS`, or project outside `ALLOWED_NAMESPACES` | Ask the admin to add it |
| `403` on `production` | `PROTECTED_ENVS` environment from an unprotected branch, or environment explicitly unprotected in GitLab | Run the job on a protected branch or tag |
| `403` on `/exec` or `DELETE /stack` | The stack was never deployed by this project (legacy stack not imported, already stopped) | Deploy first, or ask the admin to [import it](./migrate-from-ssh.md) |
| `403` on `/deploy`, key owned by another project | Another project owns the same stack key (slugs are lossy: `acme/shop-api` and `acme-shop/api` give the same key) | Rename the environment, or ask the admin to fix the registry |
| `409` on `/deploy` | Containers from an older deployment have bind mounts outside the layout | Run `DELETE /stack`, move the data to `<service>/<name>`, deploy again: [migration](./migrate-from-ssh.md) |
| `409` on `/directories` | A symlink or a file is in place of a directory | Ask the admin to remove it on the host |
| `422` on `/exec` | The command exited non-zero | Read `stdout` and `stderr` in the response |
| `500` on `/deploy` | `pull` or `up` failed, or Docker could not be inspected | Read the excerpt in the message; retrying is safe |
| `503` | The job was cancelled, or waited for another operation on the same stack | Retry |
| `504` | A docker step exceeded its timeout (`pull` 7 min, `up` 7 min, `/exec` 5 min) | Check the registry and the image size; retry |

## Good to know

- A first deploy that fails during `up` leaves containers without an owner: `DELETE /stack` is refused until a deploy of the stack succeeds.
- Deploy, stop and auto-stop on the same stack run one at a time; a second request waits.
- Status codes per endpoint: [API reference](../reference/api.md).
