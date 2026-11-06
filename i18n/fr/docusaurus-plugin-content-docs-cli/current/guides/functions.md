---
sidebar_position: 8.5
title: Fonctions
description: Créer des fonctions à partir de handlers écrits pour AWS Lambda, déployer le code, les invoquer, lire leurs journaux, gérer secrets et identifiants, et les exécuter en local avec loch functions dev.
---

# Fonctions

:::caution Travail en cours
Les fonctions sont en cours de développement : l'API, l'interface et la CLI existent, mais la fonctionnalité peut encore changer. Les mises à jour du runtime, les gestionnaires de secrets externes, l'accès HTTP public et un quota disque par fonction ne sont pas encore disponibles.
:::

`loch functions` (alias `loch fn`) exécute des handlers écrits pour AWS Lambda™ (Node.js, Python, ou un `bootstrap` compilé pour Go, Rust…) sur un serveur Loch Panel, avec [Loch Lambda Runtime](/lambda-runtime/). Réservé aux admins ; le module des fonctions doit être activé. Côté panel : [Fonctions](/panel/user-guide/functions/).

## Commandes

| Commande | Rôle |
|---|---|
| `loch functions config` | Affiche les runtimes et versions, les limites, les valeurs par défaut et si le binaire du runtime est prêt. |
| `loch functions ls` | Liste les fonctions et leur état. |
| `loch functions show <nom>` | Affiche la configuration, les variables, les noms des secrets, les déploiements et l'endpoint. |
| `loch functions create <nom> --runtime <r> --version <v>` | Crée une fonction. Affiche une seule fois les identifiants d'invocation. |
| `loch functions deploy <nom> <dossier\|zip>` | Déploie un dossier (zippé sur place) ou un zip, et l'active. |
| `loch functions deployments <nom>` | Liste les déploiements conservés. |
| `loch functions activate <nom> <id>` | Active un déploiement conservé (alias `rollback`). |
| `loch functions invoke <nom>` | Invoque avec un événement JSON et affiche la réponse. |
| `loch functions logs <nom>` | Affiche la sortie de la fonction (`-f` pour suivre). |
| `loch functions update <nom>` | Modifie les ressources, le handler, les variables ou l'autorisation MCP. |
| `loch functions secrets <nom>` | Liste les noms des secrets (`set`, `rm` pour les modifier). |
| `loch functions credentials rotate <nom>` | Génère de nouveaux identifiants d'invocation (`--sigv4` / `--no-sigv4`). |
| `loch functions networks <nom> [--network <n>…]` | Affiche ou remplace les réseaux. |
| `loch functions egress <nom> on\|off` | Autorise ou bloque l'accès sortant à Internet. |
| `loch functions start\|stop\|restart <nom>` | Démarre, arrête ou redémarre une fonction. |
| `loch functions delete <nom>` | Supprime une fonction, son code, ses secrets et ses identifiants (`--purge` pour une fonction modifiée hors du panel). |
| `loch functions dev` | Exécute une fonction sur votre machine (ci-dessous). |

Toutes les options : [référence de `loch functions`](/cli/reference/commands/loch-functions/) (en anglais).

## Créer, déployer, invoquer

```bash
loch functions create thumbnail --runtime nodejs --version 22 --handler index.handler \
  --memory 512 --env BUCKET=media --secret S3_SECRET --network media \
  --credentials-file ~/.config/loch/thumbnail.credentials.json
loch functions deploy thumbnail ./build
loch functions invoke thumbnail --event-json '{"key": "cat.jpg"}'
loch functions logs thumbnail -f
```

- **Runtimes** : `nodejs`, `python`, `provided` (runtime personnalisé, version `al2023`). `loch functions config` liste les versions du serveur.
- **Code** : installez d'abord les dépendances (`node_modules`, `pip install -t .`) : rien n'est compilé sur le serveur. Un dossier est zippé sur place, sans `.git` ni `*.credentials.json`.
- **Invocation** : l'événement vient de `--event-json`, de `--event <fichier>` ou de l'entrée standard (vide équivaut à `{}`), une valeur JSON de 6 Mio au plus. La réponse va sur la sortie standard, la fin des journaux et le statut sur la sortie d'erreur. Code de sortie 1 quand la fonction renvoie une erreur.

Pour une fonction Go ou Rust, compilez un exécutable Linux nommé `bootstrap` pour l'architecture du serveur (`arch` dans `loch functions config`) et placez-le à la racine du code. Voir [Runtimes personnalisés](/lambda-runtime/guides/custom-runtimes/).

## Secrets et identifiants

- Les valeurs des secrets ne sont jamais prises sur la ligne de commande : `--secret NAME` et `loch functions secrets set <nom> NAME` lisent la valeur sans l'afficher, ou depuis l'entrée standard ; `--secret-file NAME=chemin` lit un fichier.
- Les identifiants d'invocation (un jeton bearer et, avec `--sigv4`, une paire de clés pour les SDK AWS lisible par le code de la fonction) ne sont renvoyés qu'une fois, à la création et au renouvellement. Ils ne s'affichent que dans un terminal ; `--credentials-file` les écrit dans un nouveau fichier en mode 0600, hors du dossier du code.
- Si la réponse est perdue (erreur réseau, Ctrl+C), vérifiez avec `loch functions show`, puis renouvelez les identifiants.

```bash
printf '%s\n' "$TOKEN" | loch functions secrets set thumbnail API_TOKEN
loch functions credentials rotate thumbnail --credentials-file ~/.config/loch/thumbnail.credentials.json
```

## Exécuter une fonction en local

`loch functions dev` exécute une fonction sur votre machine avec Docker, dans un conteneur qui reproduit celui déployé (même image de base AWS, mêmes limites et durcissement). Ni panel ni clé d'API ne sont nécessaires. La commande télécharge la version de Loch Lambda Runtime à laquelle ce build de `loch` fait confiance, vérifie son SHA-256 et la garde dans le répertoire de cache (`$XDG_CACHE_HOME/loch/lambda-runtime/`).

| Commande | Rôle |
|---|---|
| `loch functions dev [dossier] --runtime <r:v>` | Démarre la fonction au premier plan et affiche ses journaux ; Ctrl-C la supprime. `--detach` la laisse tourner. |
| `loch functions dev invoke [nom]` | L'invoque via `docker exec` (sans identifiant). |
| `loch functions dev info [nom]` | Affiche l'endpoint local, les identifiants et des commandes `curl` / `aws` prêtes à l'emploi. |
| `loch functions dev logs [nom]` | Affiche ses journaux. |
| `loch functions dev ls` | Liste les fonctions locales. |
| `loch functions dev down [nom]` | Supprime le conteneur, le réseau et les fichiers de cache. |
| `loch functions dev event <type>` | Affiche un événement d'exemple : `s3-put`, `sqs`, `api-gateway-v2`, `schedule`. |
| `loch functions dev runtime` | Affiche le binaire du runtime utilisé et comment le vérifier à la main. |

```bash
loch functions dev --runtime nodejs:24 --handler index.handler --watch
loch functions dev event s3-put --bucket media --key in/cat.jpg | loch functions dev invoke
```

- Le port d'invocation est publié sur `127.0.0.1` uniquement (9000 par défaut) et demande les identifiants affichés au démarrage. `--no-auth` les désactive.
- L'accès sortant est activé par défaut en local, contrairement à une fonction déployée. `--egress=false` donne un réseau interne, comme au déploiement par défaut.
- `--watch` redémarre la fonction quand le code change. `--from <fonction>` reprend les réglages d'une fonction déployée (jamais ses valeurs ; donnez-les avec `--env` / `--env-file`).
- `--runtime-binary <chemin>` ou `LOCH_RUNTIME_BINARY` exécute à la place un build local du runtime.

Toutes les options : [référence de `loch functions dev`](/cli/reference/commands/loch-functions-dev/) (en anglais).

## Droits

| Commande | Scope | Admin |
|---|---|---|
| `config`, `ls`, `show`, `deployments`, `dev --from` | `functions:read` | Oui |
| `create`, `update` (ressources), `start`, `stop`, `restart`, `delete` | `functions:write` | Oui |
| `deploy`, `activate`, `secrets`, `credentials`, `networks`, `egress`, `update` (handler, variables, autorisation MCP) | `functions:deploy` | Oui |
| `invoke` | `functions:invoke` | Oui |
| `logs` | `containers:read` et `containers:logs` (routes des conteneurs, aucun scope `functions:*`) | Oui |
| `dev` (sauf `--from`) | Aucun : local uniquement | Non |

Créer une fonction avec des variables, des réseaux, `--egress`, `--sigv4` ou `--mcp-invocable` demande aussi `functions:deploy`.

## Bon à savoir

- Noms : 1 à 21 lettres minuscules, chiffres ou tirets, commençant par une lettre.
- Une fonction ne rejoint jamais le réseau `services`. Rattachez les sites qui l'appellent à son réseau `fn-<name>`.
- `--egress` permet au code de joindre Internet, l'hôte, le réseau local et les points de métadonnées, sauf si des règles de pare-feu les bloquent.
- Ce qu'une fonction affiche et renvoie n'est pas fiable : les caractères de contrôle sont remplacés, sauf avec `--raw`.
- `--mcp-invocable` permet aux assistants IA d'invoquer la fonction via `loch mcp` : voir [Outils MCP](../reference/mcp-tools.md#functions).
