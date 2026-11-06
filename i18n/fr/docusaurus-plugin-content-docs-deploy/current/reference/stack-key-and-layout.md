---
sidebar_position: 4
title: Clé de stack et arborescence
description: Comment Loch Deploy dérive la clé de stack du jeton, où il stocke fichiers compose, données et état, et les formats de registry.json et autostop.json.
---

# Clé de stack et arborescence

## Clé de stack

La clé identifie une stack. Elle est dérivée du jeton vérifié, jamais de la requête :

```text
<key> = slug(project_path) + "-" + slug(environment)
```

Le slug reproduit `CI_PROJECT_PATH_SLUG` de GitLab : minuscules, tout caractère autre que `a-z` et `0-9` devient `-`, tirets de début et de fin retirés, tronqué à 63 octets. Les tirets consécutifs ne sont pas fusionnés.

| `project_path` | `environment` | Clé |
|---|---|---|
| `group/app` | `staging` | `group-app-staging` |
| `Apps/Atmosphere/Shop` | `production` | `apps-atmosphere-shop-production` |
| `acme-shop/api` | `staging` | `acme-shop-api-staging` |
| `acme/shop-api` | `staging` | `acme-shop-api-staging` (collision) |

`environment` est le **nom** de l'environnement. Pour les noms simples (lettres et chiffres, 24 caractères au plus, commençant par une lettre), le slug est égal à `CI_ENVIRONMENT_SLUG`. Pour les autres noms, GitLab ajoute un suffixe de hachage à `CI_ENVIRONMENT_SLUG` et les slugs diffèrent.

Chaque commande compose est limitée à la clé : `docker compose -p <key> --project-directory COMPOSE_BASE/<key> -f COMPOSE_BASE/<key>/docker-compose.yml`.

## Propriété

| Endpoint | Clé libre | Clé du `project_id` appelant | Clé d'un autre projet |
|---|---|---|---|
| `POST /deploy` | Autorisé, revendiquée après un `up` réussi | Autorisé | `403` |
| `POST /directories` | Autorisé, reste libre | Autorisé | `403` |
| `POST /exec` | `403` | Autorisé | `403` |
| `DELETE /stack` | `403` | Autorisé, propriété libérée | `403` |

Le registre stocke aussi le `project_path` et l'`environment` exacts de chaque clé. Un autre projet qui atteint la même clé avec un couple différent reçoit un `403` distinct, et l'avertissement `registry: key collision between distinct deployments` est journalisé. Un arrêt automatique conserve la propriété.

## Arborescence sur disque

| Chemin | Contenu | Supprimé par |
|---|---|---|
| `DATA_DIR/registry.json` | Propriété de chaque clé | Jamais (entrées libérées par `DELETE /stack`) |
| `DATA_DIR/autostop.json` | Arrêts automatiques en attente, indexés `<namespace>/<environment>` | Jamais (entrées retirées une fois exécutées ou annulées) |
| `COMPOSE_BASE/<key>/` | `docker-compose.yml` et les fichiers d'environnement envoyés | `DELETE /stack`, arrêt automatique |
| `COMPOSE_BASE/.staging-<key>-*` | Un déploiement en cours de validation | Le déploiement lui-même |
| `WEBSITES_BASE/<key>/<service>/<name>/` | Données applicatives (bind mounts) | Jamais |

Les fichiers d'état sont écrits de façon atomique (fichier temporaire, renommage, fsync du répertoire).

## registry.json {#registry-json}

C'est aussi le format du fichier de `-import-registry`. Un objet JSON indexé par clé de stack ; chaque valeur est un objet d'entrée ou une simple chaîne `project_id`.

```json
{
  "group-app-staging": {
    "project_id": "42",
    "project_path": "group/app",
    "environment": "staging"
  },
  "other-production": "7"
}
```

| Champ | Obligatoire | Description |
|---|---|---|
| `project_id` | oui | ID du projet GitLab propriétaire de la clé |
| `project_path` | non | Chemin exact du projet ; active la détection des collisions |
| `environment` | non | Nom exact de l'environnement ; active la détection des collisions |
| `claimed_at` | non | Par défaut, l'heure de l'import |

À l'import, une clé déjà détenue par un autre `project_id` annule tout l'import. Une clé détenue par le même `project_id` est conservée et ses champs manquants sont complétés.
