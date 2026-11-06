---
sidebar_position: 3
title: Politique de déploiement
description: Liste complète des règles de la politique compose de Loch Deploy, étapes de validation d'un déploiement et contrôle préalable des conteneurs existants.
---

# Politique de déploiement

Chaque fichier compose envoyé à `POST /deploy` est vérifié sur le fichier brut, sur le `.env` envoyé et sur le modèle rendu par `docker compose config` (`compose/policy.go`). Toutes les violations sont renvoyées dans une seule réponse `400`, 20 au plus.

## Étapes d'un déploiement

0. **Contrôle de la requête.** Les champs du formulaire (`auto_stop_days`, noms des fichiers d'environnement) sont validés et la propriété de la stack est vérifiée : `400` ou `403`.
1. **Contrôle préalable.** Les conteneurs existants de la stack sont inspectés ; un bind mount hors de l'arborescence refuse le déploiement avec `409`. Rien n'est encore écrit.
2. **Staging.** Le fichier compose et les fichiers d'environnement sont écrits dans `COMPOSE_BASE/.staging-<key>-*`.
3. **Fichier brut.** `include`, ainsi que `extends` ou `label_file` dans un service, sont refusés.
4. **`.env`.** Les variables `COMPOSE_*` et `DOCKER_*` sont refusées.
5. **Rendu.** `docker compose -p <key> ... config --format json --no-env-resolution`. Un échec donne un `400`.
6. **Politique.** Le modèle rendu est vérifié avec les règles ci-dessous.
7. **Installation.** Les fichiers sont déplacés dans `COMPOSE_BASE/<key>/` ; les fichiers du déploiement précédent non renvoyés sont supprimés.
8. **Exécution.** `docker compose pull`, puis `up -d --remove-orphans --no-build`.
9. **Enregistrement.** La propriété est enregistrée, puis l'arrêt automatique est programmé ou annulé.

Déploiement, arrêt et arrêt automatique d'une stack sont sérialisés par un verrou.

## Règles

| Portée | Refusé |
|---|---|
| Premier niveau | `include` ; un `name:` différent de la clé de stack |
| Champs de service (toute valeur non vide) | `build`, `cap_add`, `cgroup`, `cgroup_parent`, `credential_spec`, `device_cgroup_rules`, `devices`, `extends`, `external_links`, `gpus`, `ipc`, `label_file`, `pid`, `privileged`, `provider`, `runtime`, `security_opt`, `sysctls`, `use_api_socket`, `userns_mode`, `uts` |
| Hooks de cycle de vie (`post_start`, `pre_stop`) | `privileged` |
| `network_mode` | Toute valeur autre que vide, `none`, `bridge`, `default` ou `service:<name>` |
| `volumes_from` | Entrées `container:<name>` |
| `container_name` | Un nom qui ne commence pas par `<key>-` |
| `deploy.resources.reservations.devices` | Toute valeur |
| Volumes de service | Types autres que `bind`, `volume`, `tmpfs`, `image`. Une source `bind` autre qu'exactement `WEBSITES_BASE/<key>/<service>/<name>` |
| `env_file` | Un chemin qui n'est pas un fichier envoyé avec le déploiement |
| Volumes de premier niveau | `external` ; un driver autre que `local` ; `driver_opts` ; un `name` qui ne commence pas par `<key>_` |
| Réseaux de premier niveau | Réseaux `external` absents de `ALLOWED_EXTERNAL_NETWORKS` ; pour les autres, un driver autre que `bridge`, `driver_opts`, un `name` qui ne commence pas par `<key>_` |
| Configs et secrets de premier niveau | `external` ; un `file` qui n'est pas envoyé avec le déploiement |
| Labels | `com.docker.compose.*` ; `traefik.tcp.*`, `traefik.udp.*` ; `traefik.http.routers.*.priority` |
| Règles des routeurs Traefik | Une règle non limitée à des noms `Host()` explicites (`PathPrefix()` seul, `HostRegexp()`, tout `!`) ; un `Host()` vide ; un hôte de `FORBIDDEN_TRAEFIK_HOSTS` ; des règles de plus de 4096 octets ou imbriquées sur plus de 32 niveaux |

Les clés des labels Traefik sont comparées sans tenir compte de la casse. ``Host(`a`) && PathPrefix(`/x`)`` est accepté ; ``Host(`a`) || PathPrefix(`/x`)`` ne l'est pas.

## Sources de bind

Une source de bind n'est acceptée que si :

- c'est un chemin absolu et propre (pas de `.`, `..`, `//` ni `/` final) ;
- c'est exactement `WEBSITES_BASE/<key>/<service>/<name>`, `<service>` et `<name>` suivant les [règles de `/directories`](./api.md#post-directories) ;
- `<key>`, `<key>/<service>` et `<key>/<service>/<name>` existent et sont tous de vrais répertoires, ni liens symboliques ni fichiers.

`<service>` n'a pas besoin d'être un service du fichier compose. Les niveaux au-dessus de `<key>` appartiennent à l'opérateur.

## Non restreint

`ports:`, les limites de ressources, la provenance des images, `user:` et l'interpolation `${VAR}` depuis l'environnement du serveur. Voir [Modèle de sécurité](../admin/security.md#residual-risks).

## Contrôle préalable

Des conteneurs lancés par un ancien workflow peuvent garder un bind en écriture sur `<key>/` ou `<key>/<service>/`, et remplacer une source de bind par un lien symbolique pendant le `pull` suivant. Chaque déploiement inspecte donc d'abord les conteneurs existants de la stack.

| Élément | Règle |
|---|---|
| Conteneurs inspectés | Tous les états. Label `com.docker.compose.project=<key>`, ou nom commençant par `<key>-` ou `<key>_`, sauf si le nom appartient à un autre projet compose qui lui est propre |
| Refusé | Un bind mount, en lecture seule ou non, qui ne respecte pas la règle des sources de bind (un composant disparu est toléré) : `<key>/`, `<key>/<service>/`, plus profond, hors de `WEBSITES_BASE/<key>/`, le socket Docker |
| Non concernés | Volumes nommés, `tmpfs`, montages d'image |
| Réponse | `409` listant chaque montage refusé (20 au plus) par conteneur et cible, sans chemin du serveur. Chemins complets dans le champ d'audit `legacy_mounts` |
| Échec de l'inspection | `500` (`503` ou `504` sur annulation ou délai dépassé) ; le déploiement ne continue jamais sans contrôle |

Pour sortir d'un `409` : `DELETE /stack`, déplacez les données vers `<service>/<name>`, redéployez ([migration](../guides/migrate-from-ssh.md)).
