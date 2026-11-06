---
sidebar_position: 1
title: Déployer depuis GitLab CI
description: Demander un jeton d'identité dans un job GitLab CI, créer les répertoires de bind, déployer une stack compose, programmer un arrêt automatique et arrêter la stack.
---

# Déployer depuis GitLab CI

Un job de déploiement demande un jeton, crée ses répertoires de bind mount, puis envoie le fichier compose. Aucun secret CI n'est nécessaire pour le serveur.

:::note
Avant le premier pipeline, vérifiez avec l'administrateur : le projet est sous l'un des `ALLOWED_NAMESPACES`, l'IP de sortie du runner est dans `ALLOWED_IPS`, et vous connaissez la valeur de `GITLAB_AUDIENCE` et l'URL du serveur.
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

La stack est `<slug du chemin du projet>-staging`, par exemple `group-app-staging` pour le projet `group/app`. Voir [Clé de stack et arborescence](../reference/stack-key-and-layout.md).

## Règles

| Règle | Pourquoi |
|---|---|
| Déclarez `environment:` dans chaque job qui appelle le serveur, y compris pour `/exec` et `/directories` | Sinon le jeton n'a pas de claim `environment` : `400` |
| Mettez dans `aud:` la valeur de `GITLAB_AUDIENCE` du serveur | Sinon `401` |
| Appelez le serveur tôt dans le job | Un jeton est refusé 10 minutes après son émission |
| Utilisez `curl --fail-with-body` | Le job échoue **et** affiche le message du serveur, par exemple les violations de la politique. `-f` le masque |
| Appelez `/directories` avant `/deploy` | Les sources de bind doivent déjà exister, sinon la politique les refuse |
| Lancez les jobs des `PROTECTED_ENVS` (par défaut `production`) sur une branche ou un tag protégé | Sinon `403`, sur tous les endpoints |

## Arrêt automatique

`auto_stop_days` (de 1 à 365) arrête la stack après N jours. Le serveur vérifie les échéances au démarrage puis toutes les 5 minutes. Un arrêt automatique supprime les conteneurs et le répertoire compose, conserve les données sous `WEBSITES_BASE` et conserve la propriété : le même projet peut redéployer.

Un déploiement sans `auto_stop_days` annule un arrêt automatique en attente : chaque déploiement le définit entièrement. `DELETE /stack` l'annule aussi.

## Lancer une commande

`POST /exec` lance une commande dans un conteneur de service en cours d'exécution, sans shell, avec un délai de 5 minutes :

```bash
curl --fail-with-body -sS -X POST \
  -H "Authorization: Bearer $DEPLOY_JWT" \
  -H "Content-Type: application/json" \
  -d '{"service":"api","command":["php","bin/console","cache:clear"]}' \
  "$DEPLOY_URL/exec"
```

La réponse est `{"stdout": "...", "stderr": "..."}`, avec `200` quand la commande sort avec 0 et `422` sinon.

## Bon à savoir

- Chaque nom d'environnement est une stack distincte. Un nom dynamique (review apps) crée une stack par nom.
- `/exec` et `DELETE /stack` ne fonctionnent que sur une stack déjà déployée par le même projet.
- Le journal d'audit enregistre les arguments de `/exec` tels quels : ne passez jamais de secret en argument de commande.
- Décodez les fichiers d'environnement contenant des secrets dans le job qui les envoie, plutôt que de les publier en artefacts.
- Un pipeline complet migré depuis SSH, avec jobs d'arrêt et plusieurs environnements : [examples/gitlab-ci.example.yml](https://github.com/loch-sh/deploy/blob/v1.0.0/examples/gitlab-ci.example.yml).

Ensuite : [écrivez un fichier compose conforme](./compose-file.md). Tous les endpoints : [Référence de l'API](../reference/api.md).
