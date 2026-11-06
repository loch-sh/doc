---
sidebar_position: 1
title: Deploy from GitLab CI
description: Request an ID token in a GitLab CI job, create bind directories, deploy a compose stack, schedule an auto-stop and stop the stack.
---

# Deploy from GitLab CI

A deploy job requests an ID token, creates its bind-mount directories, then uploads the compose file. No CI secret is needed for the server itself.

:::note
Before the first pipeline, check with the admin: the project is under one of `ALLOWED_NAMESPACES`, the runner egress IP is in `ALLOWED_IPS`, and you know the `GITLAB_AUDIENCE` value and the server URL.
:::

## Pipeline

```yaml
stages: [deploy]

variables:
  DEPLOY_URL: "https://deploy.example.com:8443"

.deploy-api:
  image: alpine:3.23
  id_tokens:
    DEPLOY_JWT:
      aud: "https://deploy.example.com"   # = GITLAB_AUDIENCE
  before_script:
    - apk add --no-cache curl

deploy-staging:
  extends: .deploy-api
  stage: deploy
  environment:
    name: staging
    on_stop: stop-staging
  script:
    - |
      curl --fail-with-body -sS -X POST \
        -H "Authorization: Bearer $DEPLOY_JWT" \
        -H "Content-Type: application/json" \
        -d '{"entries":[{"service":"api","name":"storage","user":"1000","group":"1000"}]}' \
        "$DEPLOY_URL/directories"
    - |
      curl --fail-with-body -sS -X POST \
        -H "Authorization: Bearer $DEPLOY_JWT" \
        -F "compose_file=@docker-compose.yml" \
        -F "env_files=@api.env" \
        -F "auto_stop_days=15" \
        "$DEPLOY_URL/deploy"

stop-staging:
  extends: .deploy-api
  stage: deploy
  when: manual
  environment:
    name: staging
    action: stop
  script:
    - curl --fail-with-body -sS -X DELETE -H "Authorization: Bearer $DEPLOY_JWT" "$DEPLOY_URL/stack"
```

The stack is `<project path slug>-staging`, for example `group-app-staging` for the project `group/app`. See [Stack key and layout](../reference/stack-key-and-layout.md).

## Rules

| Rule | Why |
|---|---|
| Declare `environment:` in every job that calls the server, `/exec` and `/directories` included | Without it the token has no `environment` claim: `400` |
| Set `aud:` to the server's `GITLAB_AUDIENCE` | Otherwise `401` |
| Call the server early in the job | A token is refused 10 minutes after issuance |
| Use `curl --fail-with-body` | The job fails **and** prints the server message, such as the policy violations. `-f` hides it |
| Call `/directories` before `/deploy` | Bind sources must already exist, or the policy refuses them |
| Run jobs of `PROTECTED_ENVS` (default `production`) on a protected branch or tag | Otherwise `403`, on every endpoint |

## Auto-stop

`auto_stop_days` (1 to 365) stops the stack after N days. The server checks deadlines at startup and every 5 minutes. An auto-stop removes the containers and the compose directory, keeps the data under `WEBSITES_BASE` and keeps the ownership, so the same project can redeploy.

A deploy without `auto_stop_days` cancels a pending auto-stop: each deploy fully defines it. `DELETE /stack` cancels it too.

## Run a command

`POST /exec` runs a command in a running service container, without a shell, with a 5 minute timeout:

```bash
curl --fail-with-body -sS -X POST \
  -H "Authorization: Bearer $DEPLOY_JWT" \
  -H "Content-Type: application/json" \
  -d '{"service":"api","command":["php","bin/console","cache:clear"]}' \
  "$DEPLOY_URL/exec"
```

The response is `{"stdout": "...", "stderr": "..."}`, with `200` when the command exits 0 and `422` otherwise.

## Good to know

- Each environment name is a separate stack. A dynamic name (review apps) creates a new stack per name.
- `/exec` and `DELETE /stack` only work on a stack already deployed by the same project.
- The audit log records `/exec` arguments verbatim: never pass secrets as command arguments.
- Decode env files holding secrets in the job that uploads them rather than publishing them as artifacts.
- A full pipeline migrated from SSH, with stop jobs and several environments: [examples/gitlab-ci.example.yml](https://github.com/loch-sh/deploy/blob/v1.0.0/examples/gitlab-ci.example.yml).

Next: [write a compliant compose file](./compose-file.md). Every endpoint: [API reference](../reference/api.md).
