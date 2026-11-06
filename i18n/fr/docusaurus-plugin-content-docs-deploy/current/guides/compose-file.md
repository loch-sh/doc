---
sidebar_position: 2
title: Écrire un fichier compose conforme
description: Écrire un docker-compose.yml qui respecte la politique de Loch Deploy - noms, bind mounts, fichiers d'environnement, réseaux et labels Traefik.
---

# Écrire un fichier compose conforme

Le serveur rend votre fichier compose avec `docker compose config`, puis le vérifie avec la politique de déploiement. Toute violation refuse le déploiement avec un `400` et la liste des violations (20 au plus). La stack en cours d'exécution n'est pas touchée.

Dans les exemples ci-dessous, la clé de stack est `group-app-staging` et `WEBSITES_BASE` vaut `/data/websites`.

## Exemple

```yaml
services:
  api:
    image: registry.example.com/group/app/api:1.4.2
    env_file: api.env
    volumes:
      # créé par POST /directories {"service":"api","name":"storage"}
      - /data/websites/group-app-staging/api/storage:/app/storage
      - cache:/app/var/cache
    networks: [default, web]
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.group-app-staging-api.rule=Host(`app-staging.example.com`)"
      - "traefik.http.routers.group-app-staging-api.entrypoints=websecure"
      - "traefik.http.routers.group-app-staging-api.tls=true"
      - "traefik.http.services.group-app-staging-api.loadbalancer.server.port=8080"

volumes:
  cache: {}

networks:
  web:
    external: true   # présent dans ALLOWED_EXTERNAL_NETWORKS
```

## Règles

| Sujet | À faire | Refusé |
|---|---|---|
| Images | `image:` depuis un registre | `build:` (`up` tourne avec `--no-build`) |
| Privilèges | Rien de particulier | `privileged`, `cap_add`, `devices`, `security_opt`, `sysctls`, `pid`/`ipc`/`uts`/`userns_mode`, `network_mode: host` |
| Bind mounts | Exactement `WEBSITES_BASE/<key>/<service>/<name>`, créé par `/directories` | `<key>` ou `<key>/<service>` seuls, chemins plus profonds, fichiers isolés, chemins relatifs comme `./data`, liens symboliques |
| Volumes nommés | Laissez compose les nommer, ou un `name:` commençant par `<key>_` | `external`, un driver autre que `local`, `driver_opts` |
| Réseaux | Réseaux propres, ou réseau externe présent dans `ALLOWED_EXTERNAL_NETWORKS` | Autres réseaux externes, un driver autre que `bridge` |
| `container_name` | Omettez-le, ou faites-le commencer par `<key>-` | Tout autre nom |
| Fichiers d'environnement, configs, secrets | Noms simples de fichiers envoyés avec le déploiement (`env_file: api.env`) | Autres chemins, `external` |
| Labels | Labels HTTP Traefik | `com.docker.compose.*`, `traefik.tcp.*`, `traefik.udp.*`, `priority` des routeurs |
| Règles Traefik | `Host()` explicite, éventuellement `&& PathPrefix()` | `PathPrefix()` seul, `HostRegexp()`, `\|\|` avec une règle sans hôte, `!`, un hôte de `FORBIDDEN_TRAEFIK_HOSTS` |
| Structure | Un seul fichier | `include`, `extends`, `label_file`, un `name:` de premier niveau différent de la clé |

Liste complète des règles : [Politique de déploiement](../reference/deployment-policy.md).

## Bind mounts

1. Créez chaque répertoire avec `/directories` avant le déploiement, avec l'uid/gid numérique sous lequel tourne l'image :

   ```json
   {"entries": [{"service": "api", "name": "storage", "user": "1000", "group": "1000", "mode": "0750"}]}
   ```

2. Montez le répertoire `<name>` entier : `/data/websites/group-app-staging/api/storage`.

`<service>` n'est qu'un segment de chemin : un autre service (un worker) peut monter `api/storage`. Livrez les fichiers isolés sous forme de `configs` plutôt que de les monter.

## Bon à savoir

- Préfixez les noms de routeurs et de services Traefik par la clé de stack : ces noms sont globaux dans Traefik et deux stacks entreraient en conflit.
- `ports:`, les limites de ressources, `user:` et la provenance des images ne sont pas restreints. Demandez à l'administrateur avant de publier un port.
- L'interpolation `${VAR}` lit l'environnement du serveur, pas celui du job. Mettez les valeurs dans les fichiers d'environnement envoyés.
- Les fichiers `.env` envoyés ne peuvent pas définir de variables `COMPOSE_*` ou `DOCKER_*`.
- Noms des fichiers d'environnement : un point initial facultatif, puis jusqu'à 128 lettres, chiffres, `.`, `_` ou `-`, en commençant par une lettre ou un chiffre. `docker-compose.yml` et `*.tmp` sont réservés.
