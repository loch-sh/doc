---
sidebar_position: 2
title: Référence de l'API
description: Les endpoints HTTP de Loch Deploy - health, deploy, stack, directories, exec - avec leurs champs et leurs codes de statut.
---

# Référence de l'API

Tous les endpoints sauf `/health` exigent `Authorization: Bearer <id_token>`. Il n'y a aucun paramètre de chemin : le projet, le namespace et l'environnement viennent du jeton. Les réponses d'erreur sont en `text/plain`.

| Endpoint | Rôle |
|---|---|
| [`GET /health`](#get-health) | Sonde de vivacité |
| [`POST /deploy`](#post-deploy) | Valider et démarrer une stack compose |
| [`DELETE /stack`](#delete-stack) | Arrêter et supprimer la stack |
| [`POST /directories`](#post-directories) | Créer les répertoires de bind mount |
| [`POST /exec`](#post-exec) | Lancer une commande dans un conteneur de service |

## Codes de statut communs

Vérifiés dans cet ordre : liste d'IP autorisées, jeton, namespace, environnement protégé, puis le handler.

| Statut | Cause |
|---|---|
| `400` | Jeton sans `project_path`, `project_id` ou `environment`, slug dérivé invalide, corps invalide |
| `401` | Jeton absent ou invalide |
| `403` | IP non autorisée, namespace non autorisé, règle des environnements protégés, propriété |

## GET /health {#get-health}

Sans authentification, exempté de la liste d'IP autorisées, non audité. Renvoie `200` avec `{"status":"ok"}`.

## POST /deploy {#post-deploy}

`multipart/form-data`, au plus `MAX_UPLOAD_MB`.

| Champ | Obligatoire | Description |
|---|---|---|
| `compose_file` | oui | Le `docker-compose.yml` |
| `env_files` ou `env_files[]` | non | Un champ par fichier d'environnement, les deux graphies sont fusionnées. Nom : point initial facultatif, puis jusqu'à 128 lettres, chiffres, `.`, `_`, `-`. `docker-compose.yml` et `*.tmp` réservés ; pas de doublon |
| `auto_stop_days` | non | Entier de `1` à `365`. Absent, il annule un arrêt automatique en attente |

```bash
curl --fail-with-body -sS -X POST -H "Authorization: Bearer $DEPLOY_JWT" \
  -F "compose_file=@docker-compose.yml" -F "env_files=@api.env" -F "auto_stop_days=7" \
  "$DEPLOY_URL/deploy"
```

| Statut | Cause |
|---|---|
| `204` | Stack déployée |
| `400` | Formulaire invalide, corps trop gros, `auto_stop_days` ou nom de fichier d'environnement invalide, `compose_file` absent, `include`/`extends`/`label_file`, variable `.env` réservée, erreur de `docker compose config`, violation de la politique |
| `403` | Règle des environnements protégés, clé détenue par un autre projet, collision de clé |
| `409` | Un conteneur existant de la stack a un bind mount hors de l'arborescence |
| `500` | Erreur du système de fichiers, échec de l'inspection des conteneurs, échec de `pull` ou `up`, propriété non enregistrée |
| `503` | Requête annulée pendant l'attente du verrou de la stack, ou pendant l'inspection, `config` ou `pull` |
| `504` | L'inspection, `config`, `pull` ou `up` a dépassé son délai |

Le serveur écrit les fichiers dans un répertoire de staging, les valide, puis remplace le répertoire de la stack et lance `pull` et `up -d --remove-orphans --no-build`. Rien ne touche la stack en cours avant la fin de la validation. Les fichiers d'environnement d'un déploiement précédent qui ne sont pas renvoyés sont supprimés. Une fois `up` lancé, l'annulation du pipeline ne l'arrête plus. Les messages d'échec contiennent un extrait expurgé de la sortie compose (400 derniers octets). Étapes en détail : [Politique de déploiement](./deployment-policy.md).

## DELETE /stack {#delete-stack}

Pas de corps.

1. Si le fichier compose existe, `docker compose down --remove-orphans`.
2. Chaque conteneur restant de la stack (ancienne stack sans fichier compose, conteneurs nommés d'après la clé) est arrêté et supprimé.
3. Le répertoire compose est supprimé, la propriété libérée, l'arrêt automatique annulé.

Les données sous `WEBSITES_BASE` sont conservées.

```bash
curl --fail-with-body -sS -X DELETE -H "Authorization: Bearer $DEPLOY_JWT" "$DEPLOY_URL/stack"
```

| Statut | Cause |
|---|---|
| `204` | Stack supprimée |
| `403` | Clé non revendiquée, ou détenue par un autre projet |
| `500` | Échec de `down`, de la suppression des conteneurs ou du répertoire ; propriété et répertoire conservés, relancez |
| `503` | Requête annulée pendant l'attente du verrou de la stack |

## POST /directories {#post-directories}

`application/json`, 1 Mio au plus. Crée `WEBSITES_BASE/<key>/<service>/<name>/`.

```json
{"entries": [{"service": "api", "name": "storage", "user": "1000", "group": "1000", "mode": "0750"}]}
```

| Champ | Obligatoire | Règle |
|---|---|---|
| `service` | oui | Lettres minuscules, chiffres, `-` ; 63 caractères au plus ; commence et finit par une lettre ou un chiffre |
| `name` | oui | Lettres, chiffres, `.`, `_`, `-` ; 128 caractères au plus ; pas de point initial |
| `user` | non | UID numérique, de `0` à `2147483647`. Les noms sont refusés |
| `group` | non | GID numérique, de `0` à `2147483647`. Les noms sont refusés |
| `mode` | non | Chaîne octale (`"0750"`, préfixe `0o` facultatif), `0777` au plus. Défaut `0755` |

`mode`, `user` et `group` s'appliquent au seul répertoire `<name>`, même s'il existe déjà. `<key>/` et `<key>/<service>/` sont créés en `root:root 0755` et jamais modifiés. Chaque entrée est validée avant la première écriture. Une clé libre est acceptée et reste libre.

| Statut | Cause |
|---|---|
| `204` | Répertoires créés (aussi pour une liste vide) |
| `400` | JSON ou entrée invalide |
| `403` | Clé détenue par un autre projet |
| `409` | Un lien symbolique ou un non-répertoire bloque le chemin, ou un chemin sort du répertoire de la stack |
| `500` | Autre erreur du système de fichiers |

## POST /exec {#post-exec}

`application/json`, 1 Mio au plus. Lance `docker compose exec -T` dans un conteneur en cours d'exécution, sans shell, avec un délai de 5 minutes. Non sérialisé avec les déploiements.

```json
{"service": "api", "command": ["php", "bin/console", "app:client:install", "acme"]}
```

| Statut | Corps | Cause |
|---|---|---|
| `200` | `{"stdout": "...", "stderr": "..."}` | Code de sortie 0 |
| `400` | texte | JSON ou service invalide, commande vide |
| `403` | texte | Clé non revendiquée, ou détenue par un autre projet |
| `422` | `{"stdout": "...", "stderr": "..."}` | Code de sortie non nul |
| `503` | `{"stdout": "...", "stderr": "..."}` | Requête annulée ; la commande est interrompue |
| `504` | `{"stdout": "...", "stderr": "..."}` | Délai dépassé |

`stdout` et `stderr` sont plafonnés à 1 Mio chacun ; une sortie tronquée se termine par `[truncated]`. La commande est écrite telle quelle dans le journal d'audit.
