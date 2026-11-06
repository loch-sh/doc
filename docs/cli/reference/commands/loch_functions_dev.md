---
title: "loch functions dev"
description: "Run a function locally with Docker and the loch runtime (no panel)"
sidebar_label: "functions dev"
slug: "loch-functions-dev"
---

## loch functions dev

Run a function locally with Docker and the loch runtime (no panel)

### Synopsis

Run a function on this machine, in a container that mirrors the one the panel runs: same AWS base image
(from mirror.gcr.io), loch function runtime, environment, limits and hardening. The code directory is
bind-mounted read-only (no zip); dir defaults to the current directory and the name to its name
(normalized to the panel's rules, so the same name can be deployed; --name otherwise).

In the foreground (default) it starts the function, streams its logs, and Ctrl-C removes it. --detach
leaves it running: loch functions dev invoke|logs|info|down then work on it. The invoke port is published
on 127.0.0.1 only and requires the credentials generated at start (printed, and by loch functions dev
info): a web page could otherwise POST to it. --no-auth turns that off. --egress=false gives an internal
network, as deployed by default: no port can be published then, invoke with loch functions dev invoke.

Docker objects: compose project, container and network loch-dev-&lt;name> (label sh.loch.dev-function),
never the panel's fn-*. Files: the variables and credentials in 0600 files of the loch cache directory
(--print-compose shows their paths, never their values), removed by loch functions dev down. A remote
Docker daemon (DOCKER_HOST or a context on tcp:// or ssh://) is refused.

Runtime binary: the loch function runtime release (github.com/loch-sh/lambda-runtime) of the architecture, the
newest this loch build trusts (--runtime-version vX.Y.Z for another trusted one). It is downloaded once over
HTTPS, its sha256 checked against the table built into loch before it is kept in the cache directory
($XDG_CACHE_HOME/loch/lambda-runtime, else the OS cache directory), and checked again on every run (a
modified copy is downloaded again). --runtime-binary &lt;path> or LOCH_RUNTIME_BINARY run a local build as
given (warned when its sha256 is not a trusted release). loch functions dev runtime shows the binary used
and how to verify a release by hand (cosign, gh attestation).

Variables: --env NAME=value (repeatable) and --env-file (NAME=value lines, # comments, raw values: no
quotes nor interpolation); --env wins. Names the panel reserves (AWS_LAMBDA_*, LOCH_RUNTIME_*, PATH, ...)
are refused. A *.credentials.json file in the code directory is refused (the function could read it).

Dependencies: the panel never installs them, they are part of the code. Install them with the runtime
image and architecture, in the code directory (on an amd64 daemon: linux/amd64 and the -x86_64 tag):
  docker run --rm --platform linux/arm64 -u "$(id -u):$(id -g)" -e HOME=/tmp -v "$PWD":/var/task -w /var/task --entrypoint npm mirror.gcr.io/amazon/aws-lambda-nodejs:24-arm64 ci --omit=dev
  docker run --rm --platform linux/arm64 -u "$(id -u):$(id -g)" -e HOME=/tmp -v "$PWD":/var/task -w /var/task --entrypoint pip mirror.gcr.io/amazon/aws-lambda-python:3.13-arm64 install -r requirements.txt -t .
(Linux with SELinux: add :z to the -v option.)

Custom runtime (provided:al2023, Go, Rust): the code directory holds an executable named bootstrap at its
root, checked as the panel does at deploy time (a Linux ELF of --arch, static or glibc, or a #! script) and
for its mode bits (o+x: the function runs as uid 10001; Docker Desktop hides a missing exec bit, a Linux
host does not). The handler is optional (default bootstrap, exported as _HANDLER). For Go:
  CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -tags lambda.norpc -o bootstrap .

Stopping: Ctrl-C (or SIGTERM, SIGHUP) removes the function, giving it its stop grace period
(min(timeout, 30) + 10 s). After loch was killed (SIGKILL), run loch functions dev down &lt;name>.
--env values show in the process list and the shell history: prefer --env-file for secrets.

--watch (foreground only: --watch --detach is refused) polls the code directory every 500 ms (mtime, size,
file count), skipping node_modules, .venv, site-packages, __pycache__, .git and editor swap files; the
contents of symlinked directories are not watched, and a rewrite keeping both the size and the mtime can be
missed. Above 50000 entries it polls every 2 s and watches only the top-level entries and the files one
directory down. 300 ms after a burst of changes (at most 2 s after its first change) it restarts the
container (docker restart -t 2: a new cold start loads the code again) and prints "reloaded (cold start)".
Enter restarts it too, when stdin is a terminal (after a dependency change).

--from FUNCTION reads a deployed function from the active endpoint (functions:read): runtime, version,
handler, memory, timeout, /tmp, CPUs, architecture, egress, its name, and the NAMES of its variables and
secrets. Values are never kept nor printed: each name not given with --env/--env-file is warned about. Flags given
explicitly win. The endpoint's limits may differ. --exact-image also runs the deployed image, pinned by its
digest, instead of the line tag.

loch functions dev event s3-put|sqs|api-gateway-v2|schedule prints a sample event to pipe into dev invoke.

```
loch functions dev [dir] (--runtime nodejs:24|python:3.13|provided | --from FUNCTION) [flags]
```

### Examples

```
  loch functions dev --runtime nodejs:24 --handler index.handler
  loch functions dev ./thumbnail --runtime python:3.13 --handler app.handler --env-file .env.local --detach
  loch functions dev invoke thumbnail --event-json '{"key": "cat.jpg"}'
  loch functions dev ./logs --runtime nodejs:24     # a directory named like a subcommand
  loch functions dev --runtime nodejs:24 --print-compose > compose.yaml
  loch functions dev --runtime nodejs:24 --watch
  loch functions dev ./hello-go --runtime provided     # ./hello-go/bootstrap built for the daemon's arch
  loch functions dev --from thumbnail --env-file .env.local --exact-image
  loch functions dev event s3-put --bucket media --key 'in/cat.jpg' | loch functions dev invoke thumbnail
```

### Options

```
      --arch string              Architecture: amd64 or arm64 (default: the Docker daemon's)
      --cpus float               CPU limit (default 1)
  -d, --detach                   Leave the function running in the background
      --egress                   Outbound Internet access (--egress=false: internal network, no port published) (default true)
      --env stringArray          Variable NAME=value (repeatable)
      --env-file string          File of NAME=value lines (raw values, # comments)
      --exact-image              With --from: run the deployed image, pinned by its digest
      --from string              Take the settings of a deployed function of the active endpoint (its values are never kept nor printed: give them with --env/--env-file)
      --handler string           Handler: <file>.<function> (default index.handler for Node.js, lambda_function.lambda_handler for Python, bootstrap for provided)
  -h, --help                     help for dev
      --memory string            Memory limit, MB or with a unit (1G) (default "512")
      --name string              Function name (default: the directory name, normalized)
      --no-auth                  Invoke port without credentials (any local process or web page can invoke)
      --port int                 Invoke port on 127.0.0.1 (default 9000)
      --print-compose            Print the compose file without starting, downloading nor writing anything (its env files exist once the function was started; the runtime binary once downloaded)
      --pull                     Pull the runtime image again (refresh the line tag)
      --runtime string           Runtime and version: nodejs:26|24|22, python:3.14|3.13|3.12, provided:al2023 (Go, Rust: a bootstrap; no version = the newest)
      --runtime-binary string    A local build of the loch function runtime (default: $LOCH_RUNTIME_BINARY, else the trusted release, downloaded and verified)
      --runtime-version string   Trusted loch function runtime release vX.Y.Z (default: the newest this loch build trusts)
      --timeout int              Timeout of an invocation, seconds (default 30)
      --tmp string               Size of /tmp (counted in the memory), MB or with a unit (default "512")
  -w, --watch                    Restart the function when the code changes (polling, foreground only; Enter restarts it too when stdin is a terminal)
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch functions](loch_functions.md)	 - Manage functions: handlers written for AWS Lambda (Node.js, Python, Go/Rust bootstraps) run on the endpoint
* [loch functions dev down](loch_functions_dev_down.md)	 - Remove a local function: container, network and cache files
* [loch functions dev event](loch_functions_dev_event.md)	 - Print a sample event (JSON) to pipe into loch functions dev invoke
* [loch functions dev info](loch_functions_dev_info.md)	 - Print the endpoint, credentials and invoke commands of a local function
* [loch functions dev invoke](loch_functions_dev_invoke.md)	 - Invoke a local function (docker exec, no credential)
* [loch functions dev logs](loch_functions_dev_logs.md)	 - Show the logs of a local function
* [loch functions dev ls](loch_functions_dev_ls.md)	 - List the local functions, and the files left in the loch cache
* [loch functions dev runtime](loch_functions_dev_runtime.md)	 - Show the loch function runtime binary loch functions dev uses, and where it comes from

