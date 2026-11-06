---
title: "loch functions"
description: "Manage functions: handlers written for AWS Lambda (Node.js, Python, Go/Rust bootstraps) run on the endpoint"
sidebar_label: "functions"
slug: "loch-functions"
---

## loch functions

Manage functions: handlers written for AWS Lambda (Node.js, Python, Go/Rust bootstraps) run on the endpoint

### Synopsis

Manage the functions module (admin only): handlers written for AWS Lambda™ run in the AWS Lambda base
images published by AWS, one compose project per function (fn-&lt;name>), in a private network of their
own. Code is a zip (deploy a directory, zipped here, or a zip file); invocations go through the panel
(loch functions invoke) or, from the members of the function's networks, to its endpoint with its
invoke credentials.
What a function prints and returns is untrusted data.

AWS Lambda is a trademark of Amazon.com, Inc. or its affiliates; loch is not affiliated with or endorsed
by Amazon.

### Options

```
  -h, --help   help for functions
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch](loch.md)	 - CLI to manage your containers via Host Panel
* [loch functions activate](loch_functions_activate.md)	 - Activate a kept deployment (rollback)
* [loch functions config](loch_functions_config.md)	 - Show the runtimes, limits and defaults of the endpoint
* [loch functions create](loch_functions_create.md)	 - Create a function (invoke credentials shown once)
* [loch functions credentials](loch_functions_credentials.md)	 - Manage the invoke credentials of a function
* [loch functions delete](loch_functions_delete.md)	 - Delete a function, its code, secrets and credentials
* [loch functions deploy](loch_functions_deploy.md)	 - Deploy code (a directory, zipped here, or a zip file) and activate it
* [loch functions deployments](loch_functions_deployments.md)	 - List the kept deployments of a function (newest first)
* [loch functions dev](loch_functions_dev.md)	 - Run a function locally with Docker and the loch runtime (no panel)
* [loch functions egress](loch_functions_egress.md)	 - Allow or block the outbound Internet access of a function
* [loch functions invoke](loch_functions_invoke.md)	 - Invoke a function with a JSON event and print its response
* [loch functions logs](loch_functions_logs.md)	 - Show the logs (stdout and stderr) of a function
* [loch functions ls](loch_functions_ls.md)	 - List the functions
* [loch functions networks](loch_functions_networks.md)	 - Show or replace the networks of a function
* [loch functions restart](loch_functions_restart.md)	 - Restart a function
* [loch functions secrets](loch_functions_secrets.md)	 - List the secret names of a function, set or remove a secret
* [loch functions show](loch_functions_show.md)	 - Show a function: configuration, variables, secret names, deployments, endpoint
* [loch functions start](loch_functions_start.md)	 - Start a function
* [loch functions stop](loch_functions_stop.md)	 - Stop a function (it stays stopped until started)
* [loch functions update](loch_functions_update.md)	 - Change the resources, handler or variables of a function

