---
sidebar_position: 3
title: Deployment policy
description: Full list of the Loch Deploy compose policy rules, the validation steps of a deploy and the pre-deploy check of existing containers.
---

# Deployment policy

Every compose file sent to `POST /deploy` is checked on the raw file, on the uploaded `.env` and on the model rendered by `docker compose config` (`compose/policy.go`). All violations are returned in one `400` response, at most 20 listed.

## Deploy steps

0. **Request checks.** The form fields (`auto_stop_days`, env file names) are validated and stack ownership is checked: `400` or `403`.
1. **Pre-deploy check.** The stack's existing containers are inspected; a bind mount outside the layout refuses the deploy with `409`. Nothing is written yet.
2. **Staging.** The compose file and env files are written to `COMPOSE_BASE/.staging-<key>-*`.
3. **Raw file.** `include`, and `extends` or `label_file` in any service, are refused.
4. **`.env`.** `COMPOSE_*` and `DOCKER_*` variables are refused.
5. **Render.** `docker compose -p <key> ... config --format json --no-env-resolution`. A failure is a `400`.
6. **Policy.** The rendered model is checked against the rules below.
7. **Install.** Files are moved to `COMPOSE_BASE/<key>/`; files of the previous deploy not re-uploaded are removed.
8. **Run.** `docker compose pull`, then `up -d --remove-orphans --no-build`.
9. **Record.** Ownership is recorded, then the auto-stop is scheduled or cancelled.

Deploy, stop and auto-stop of one stack are serialized by a lock.

## Rules

| Scope | Refused |
|---|---|
| Top level | `include`; a `name:` other than the stack key |
| Service fields (any non-empty value) | `build`, `cap_add`, `cgroup`, `cgroup_parent`, `credential_spec`, `device_cgroup_rules`, `devices`, `extends`, `external_links`, `gpus`, `ipc`, `label_file`, `pid`, `privileged`, `provider`, `runtime`, `security_opt`, `sysctls`, `use_api_socket`, `userns_mode`, `uts` |
| Lifecycle hooks (`post_start`, `pre_stop`) | `privileged` |
| `network_mode` | Anything other than empty, `none`, `bridge`, `default` or `service:<name>` |
| `volumes_from` | `container:<name>` entries |
| `container_name` | A name not starting with `<key>-` |
| `deploy.resources.reservations.devices` | Any value |
| Service volumes | Types other than `bind`, `volume`, `tmpfs`, `image`. A `bind` source other than exactly `WEBSITES_BASE/<key>/<service>/<name>` |
| `env_file` | A path that is not a file uploaded with the deploy |
| Top-level volumes | `external`; a driver other than `local`; `driver_opts`; a `name` not starting with `<key>_` |
| Top-level networks | `external` networks not in `ALLOWED_EXTERNAL_NETWORKS`; for others, a driver other than `bridge`, `driver_opts`, a `name` not starting with `<key>_` |
| Top-level configs and secrets | `external`; a `file` that is not uploaded with the deploy |
| Labels | `com.docker.compose.*`; `traefik.tcp.*`, `traefik.udp.*`; `traefik.http.routers.*.priority` |
| Traefik router rules | A rule not restricted to explicit `Host()` names (`PathPrefix()` alone, `HostRegexp()`, any `!`); an empty `Host()`; a host in `FORBIDDEN_TRAEFIK_HOSTS`; rules over 4096 bytes or nested deeper than 32 levels |

Traefik label keys are compared case-insensitively. ``Host(`a`) && PathPrefix(`/x`)`` is accepted; ``Host(`a`) || PathPrefix(`/x`)`` is not.

## Bind sources

A bind source is accepted only when:

- it is an absolute, clean path (no `.`, `..`, `//` or trailing `/`);
- it is exactly `WEBSITES_BASE/<key>/<service>/<name>`, `<service>` and `<name>` following the [`/directories` rules](./api.md#post-directories);
- `<key>`, `<key>/<service>` and `<key>/<service>/<name>` each exist and are real directories, not symlinks or files.

`<service>` does not have to be a service of the compose file. Levels above `<key>` belong to the operator.

## Not restricted

`ports:`, resource limits, the image source, `user:` and `${VAR}` interpolation from the server environment. See [Security model](../admin/security.md#residual-risks).

## Pre-deploy check

Containers started by an older workflow can keep a writable bind on `<key>/` or `<key>/<service>/` and could swap a bind source for a symlink during the next `pull`. Every deploy therefore inspects the stack's existing containers first.

| Item | Rule |
|---|---|
| Containers inspected | Every state. Label `com.docker.compose.project=<key>`, or a name starting with `<key>-` or `<key>_`, unless the name belongs to another compose project of its own |
| Refused | A bind mount, read-only or not, that does not pass the bind source rule (a missing component is tolerated): `<key>/`, `<key>/<service>/`, deeper, outside `WEBSITES_BASE/<key>/`, the Docker socket |
| Not concerned | Named volumes, `tmpfs`, image mounts |
| Response | `409` listing each refused mount (at most 20) by container and target, without server paths. Full paths in the audit field `legacy_mounts` |
| Inspection failure | `500` (`503` or `504` on cancellation or timeout); the deploy never proceeds unchecked |

Fix a `409`: `DELETE /stack`, move the data to `<service>/<name>`, deploy again ([migration](../guides/migrate-from-ssh.md)).
