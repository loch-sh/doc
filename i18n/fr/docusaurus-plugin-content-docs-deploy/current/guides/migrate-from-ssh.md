---
sidebar_position: 3
title: Migrer depuis un déploiement SSH
description: Passer des stacks déployées par SSH à Loch Deploy - importer la propriété, arrêter l'ancienne stack, déplacer les données vers l'arborescence service/name et redéployer.
---

# Migrer depuis un déploiement SSH

Les stacks lancées par un workflow SSH sont inconnues du serveur : `/exec` et `DELETE /stack` les refusent avec `403`, et leurs bind mounts ne suivent en général pas l'arborescence `<key>/<service>/<name>`, si bien que `/deploy` les refuse avec `409`. Suivez les étapes dans l'ordre. Les commandes sur l'hôte s'exécutent en root ; les chemins supposent les valeurs par défaut `/data/websites` et `/data/compose`.

:::note
`<key>` vaut `<CI_PROJECT_PATH_SLUG>-<slug de l'environnement>`, par exemple `group-app-staging`. Voir [Clé de stack et arborescence](../reference/stack-key-and-layout.md).
:::

## Partie 1 : le serveur (une fois)

1. [Installez le serveur](../install.md) et définissez `ALLOWED_NAMESPACES`, `ALLOWED_IPS`, `FORBIDDEN_TRAEFIK_HOSTS` et `ALLOWED_EXTERNAL_NETWORKS`. Laissez `:8443` fermé sur le pare-feu de l'hôte.

## Partie 2 : inventaire et propriété (une fois)

2. Listez les anciennes stacks et leurs noms de projet compose :

   ```bash
   docker ps -a --format '{{.Label "com.docker.compose.project"}}\t{{.Names}}\t{{.Status}}' | sort
   ```

   Le serveur trouve les conteneurs d'une stack par le label `com.docker.compose.project=<key>` ou par un nom commençant par `<key>-` ou `<key>_`. Notez toute stack lancée sous un autre nom de projet : vous l'arrêterez à la main à l'étape 6.

3. Listez les bind mounts de chaque stack. Toute source qui n'est pas exactement `/data/websites/<key>/<service>/<name>` correspond à des données à déplacer à l'étape 7 :

   ```bash
   for id in $(docker ps -aq --filter label=com.docker.compose.project=<key>); do
     docker inspect --format '{{.Name}}{{range .Mounts}}{{if eq .Type "bind"}} {{.Source}} -> {{.Destination}}{{end}}{{end}}' "$id"
   done
   ```

4. Importez la propriété de chaque stack, serveur arrêté. Écrivez `./data/legacy.json` (`./data` est le côté hôte de `DATA_DIR`) :

   ```json
   {
     "group-app-staging": {"project_id": "42", "project_path": "group/app", "environment": "staging"}
   }
   ```

   ```bash
   docker compose stop deploy-server
   docker run --rm -e DATA_DIR=/app/data -v "$PWD/data:/app/data" \
     ghcr.io/loch-sh/deploy:1.0 -import-registry /app/data/legacy.json
   docker compose start deploy-server
   ```

   Lancez ces commandes depuis le dossier du `docker-compose.yml` du serveur. L'import est tout ou rien. Code de sortie `0` en cas de succès, `1` en cas d'échec, `2` si les arguments sont invalides. Format : [Clé de stack et arborescence](../reference/stack-key-and-layout.md#registry-json).

5. Ouvrez `:8443` aux adresses des runners CI et définissez `DEPLOY_URL` dans les pipelines.

:::warning
Ne lancez jamais `-import-registry` pendant que le serveur tourne : il garde le registre en mémoire et écrase l'import à sa prochaine écriture.
:::

## Partie 3 : chaque stack (interruption de l'étape 6 à l'étape 9)

6. Adaptez le modèle compose et le pipeline ([règles compose](./compose-file.md), [pipeline](./gitlab-ci.md)) : sources de bind `<key>/<service>/<name>`, une entrée `/directories` par répertoire, `web` déclaré `external: true`, pas de `build:`. Désactivez les jobs SSH. Arrêtez ensuite l'ancienne stack avec le job d'arrêt du pipeline (`DELETE /stack`). Il supprime tous les conteneurs de la stack et efface `/data/compose/<key>/` : sauvegardez d'abord les anciens fichiers compose et d'environnement. Si `down` échoue sur l'ancien fichier compose, arrêtez la stack sur l'hôte (`docker compose -p <key> down --remove-orphans` depuis `/data/compose/<key>/`, puis `docker rm -f` de ce qui reste). Arrêtez à la main les stacks notées à l'étape 2 (`docker compose -p <name> down`). Vérifiez qu'il ne reste rien :

   ```bash
   docker ps -a --filter label=com.docker.compose.project=<key>
   docker ps -a --filter 'name=^/?<key>[-_]'
   ```

7. Déplacez les données vers l'arborescence `<service>/<name>` :

   ```bash
   cd /data/websites/<key>
   mkdir -p api
   mv jwt log storage api/     # anciennement <key>/jwt, <key>/log, <key>/storage
   ```

8. Remettez les niveaux intermédiaires en `root:root 0755`. Cherchez d'abord les liens symboliques : `chown` les suit.

   ```bash
   find /data/websites/<key> -maxdepth 2 -type l     # ne doit rien afficher
   chown root:root /data/websites /data/websites/<key> /data/websites/<key>/*/
   chmod 0755      /data/websites /data/websites/<key> /data/websites/<key>/*/
   ```

9. Déployez via le pipeline. `/directories` applique `mode`, `user` et `group` à chaque répertoire `<name>`, puis `/deploy` répond `204`. Un `409` signale qu'un ancien conteneur est encore là (retour à l'étape 6) ; un `400` liste les violations du modèle.

`DELETE /stack` libère la propriété : enchaînez les étapes 7 à 9 sans attendre, la clé reste libre jusqu'au prochain déploiement réussi.

## Vérification

```bash
for id in $(docker ps -aq --filter label=com.docker.compose.project=<key>); do
  docker inspect --format '{{.Name}}{{range .Mounts}}{{if eq .Type "bind"}} {{.Source}}{{end}}{{end}}' "$id"
done
stat -c '%U:%G %a %n' /data/websites/<key> /data/websites/<key>/*/
grep -A3 '"<key>"' ./data/registry.json
```

L'entrée d'audit du déploiement (`"msg":"audit"`, `"path":"/deploy"`) a le statut `204` et pas de `legacy_mounts`.

Procédure source : [Migration runbook](https://github.com/loch-sh/deploy/blob/v1.0.0/README.md#migration-runbook).
