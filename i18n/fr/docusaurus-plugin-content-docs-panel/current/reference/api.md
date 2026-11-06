---
sidebar_position: 2
title: Référence de l'API
description: Authentification, format des erreurs, toutes les routes REST avec leur scope et les événements WebSocket de l'API Loch Panel.
---

# Référence de l'API

L'API écoute sur le port `2538` et répond en JSON.

## Authentification

| Client | Comment | Permissions |
|---|---|---|
| Navigateur | Session après la connexion OIDC : cookie signé `authorization` (un en-tête `Authorization: Bearer <token>` est aussi accepté) | Toutes les permissions de l'utilisateur |
| CLI, scripts, MCP | Clé API dans l'en-tête `X-API-Key` | Le profil de l'utilisateur, limité par les scopes de la clé |

- **Profil** : un utilisateur est admin ou restreint. Une clé porte le profil de son utilisateur : un scope admin sur la clé d'un utilisateur restreint ne donne rien. Les utilisateurs restreints ne voient que les conteneurs qui leur sont attribués.
- **Scopes** : une clé sans scope (ancienne clé) a un accès complet. `*` donne tous les droits et ne se combine avec aucun autre scope. Une clé ne peut créer que des clés dans ses propres scopes. Liste complète : [scopes des clés API](./scopes.md).
- **Jetons** : `loch_` suivi de 64 caractères hexadécimaux, affiché une seule fois, valable 365 jours au plus, 20 clés au plus par utilisateur.
- **CSRF** : les requêtes d'écriture venant d'un navigateur doivent porter l'`Origin` de `FRONT_URL`, sinon `403 FORBIDDEN_ORIGIN`. Les clients sans navigateur ne sont pas concernés.
- **Limitation de débit** : 120 requêtes par minute et par IP. L'IP n'est lue dans `X-Forwarded-For` que derrière un proxy listé dans `TRUSTED_PROXIES`.

## Erreurs

Les erreurs ont la forme :

```json
{"code": "INSUFFICIENT_SCOPE", "error": "Insufficient API key scope"}
```

`code` est stable et traduit par l'interface ; `error` est un texte lisible de secours.

| Statut | Code | Signification |
|---|---|---|
| 400 | `INVALID_REQUEST_BODY` | Corps mal formé ; les corps stricts refusent aussi les champs inconnus |
| 401 | `UNAUTHORIZED` | Pas de session, ou clé API inconnue |
| 401 | `API_KEY_EXPIRED` | La clé API a expiré |
| 403 | `FORBIDDEN` | Session invalide, ou action non autorisée (pas admin, conteneur non attribué) |
| 403 | `INSUFFICIENT_SCOPE` | Il manque le scope à la clé API |
| 403 | `FORBIDDEN_ORIGIN` | Écriture d'un navigateur depuis une autre origine |
| 429 | — | Limitation de débit, réponse en texte brut |
| 500 | `INTERNAL_ERROR` | Erreur du serveur |

## Routes

Dans les tableaux, **Scope** est le scope de clé API vérifié par la route ; « — » signifie que seul le profil est vérifié. **Admin** signifie que la route est réservée aux admins.

### Publiques

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/_health` | Contrôle de santé, inclut l'état de Docker |
| GET | `/openid-connect/login` | Démarrer une connexion OIDC |
| GET | `/openid-connect/redirect` | Retour OIDC |
| GET | `/openid-connect/logout` | Déconnexion |

### Conteneurs et stacks

| Méthode | Chemin | Scope | Admin | Description |
|---|---|---|---|---|
| GET | `/docker` | `containers:read` | | Conteneurs, filtrés selon les permissions |
| GET | `/docker/{id}` | `containers:read` | | Détails d'un conteneur |
| POST | `/docker/{id}/{action}` | `containers:actions` | | `start`, `stop`, `kill`, `restart`, `delete` |
| POST | `/stacks/{name}/{action}` | `containers:actions` | | `start`, `stop`, `restart` tous les conteneurs accessibles d'une stack compose, dans l'ordre `depends_on` |
| GET | `/logs/{id}` | `containers:logs` | | Logs (texte) |
| GET | `/logs/{id}/json` | `containers:logs` | | Logs (JSON) |
| GET | `/logs/{id}/file?path=&tail=` | `containers:logs` | | Dernières lignes d'un fichier du conteneur |
| GET | `/docker/{id}/cp?path=` | `containers:cp` | | Télécharger un fichier ou un dossier (flux tar) |
| PUT | `/docker/{id}/cp?path=` | `containers:cp` | | Envoyer un fichier ou un dossier (flux tar) |
| GET | `/ws` | selon l'événement | | WebSocket, voir [plus bas](#websocket) |

### Domaines

| Méthode | Chemin | Scope | Admin | Description |
|---|---|---|---|---|
| GET | `/domains` | — | Oui | Domaines routés par Traefik |

### Tâches planifiées

| Méthode | Chemin | Scope | Admin | Description |
|---|---|---|---|---|
| GET | `/cron` | `cron` | | Tâches |
| POST | `/cron` | `cron` | | Créer |
| GET | `/cron/{id}` | `cron` | | Détails |
| PUT / PATCH | `/cron/{id}` | `cron` | | Modifier / modifier en partie |
| DELETE | `/cron/{id}` | `cron` | | Supprimer |
| POST | `/cron/{id}/run` | `cron` | | Lancer maintenant (202) |

Les admins voient toutes les tâches. Les utilisateurs restreints voient, modifient et suppriment toutes les tâches HTTP et les tâches Docker de leurs conteneurs ; ils ne peuvent créer que des tâches Docker sur ces conteneurs.

Types de tâches : `docker_action`, `docker_exec`, `http` et `function_invoke`. Une tâche `function_invoke` (`functionInvoke: {function, event}`, événement de 64 Kio au plus, `{}` par défaut) est réservée aux admins ; la créer, la modifier ou la lancer demande aussi `functions:invoke`. 5 tâches au plus par fonction. Chaque tâche porte `lastSkipped` (une exécution sautée parce que la précédente tournait encore) et `disabledReason` (`FUNCTION_DELETED` quand le panel l'a désactivée).

### Utilisateurs et clés API

| Méthode | Chemin | Scope | Admin | Description |
|---|---|---|---|---|
| GET | `/users/me` | — | | Utilisateur courant |
| GET | `/users/me/api-keys` | — | | Ses propres clés, jamais le jeton |
| POST | `/users/me/api-keys` | — | | Créer une clé ; le jeton est renvoyé une seule fois |
| DELETE | `/users/me/api-keys/{id}` | — | | Révoquer une clé |
| GET | `/users` | — | Oui | Utilisateurs |
| PATCH | `/users/{email}/switch` | — | Oui | Basculer admin / restreint |
| PATCH | `/users/{email}/restrict` | — | Oui | Rendre restreint |
| PATCH | `/users/{email}` | — | Oui | Modifier les permissions sur les conteneurs |
| DELETE | `/users/{email}` | — | Oui | Supprimer, et révoquer les clés de l'utilisateur |

### Utilisateurs SFTP

Disponible quand `SFTP_ENABLED` est activé (`/sftp/config` répond toujours).

| Méthode | Chemin | Scope | Admin | Description |
|---|---|---|---|---|
| GET | `/sftp/config` | — | Oui | État du plugin et informations de connexion |
| GET | `/sftp/sites` | `sftp:read` | Oui | Sites |
| GET | `/sftp/users` | `sftp:read` | Oui | Utilisateurs |
| POST | `/sftp/users` | `sftp:write` | Oui | Créer |
| PUT | `/sftp/users/{username}` | `sftp:write` | Oui | Modifier |
| DELETE | `/sftp/users/{username}` | `sftp:write` | Oui | Supprimer |
| POST | `/sftp/users/{username}/password` | `sftp:write` | Oui | Nouveau mot de passe |
| POST | `/sftp/users/{username}/status` | `sftp:write` | Oui | Activer / désactiver |

### Hébergement web

Disponible quand `HOSTING_ENABLED` est activé (`/hosting/config` répond toujours).

| Méthode | Chemin | Scope | Admin | Description |
|---|---|---|---|---|
| GET | `/hosting/config` | — | Oui | État du plugin, modèles, versions PHP, valeurs par défaut, limites, `defaultNetworks` |
| GET | `/hosting/sites` | `hosting:read` | Oui | Répertoires de sites et l'hébergement qui utilise chacun |
| GET | `/hosting/php-modules?template=&version=` | `hosting:read` | Oui | Modules PHP d'une image |
| GET | `/hosting/routing-template` | `hosting:read` | Oui | Modèle de routage |
| GET | `/hosting/stacks` | `hosting:read` | Oui | Sites avec leur état |
| GET | `/hosting/stacks/check-name?name=` | `hosting:read` | Oui | Disponibilité d'un nom |
| POST | `/hosting/stacks` | `hosting:write` | Oui | Créer et déployer (202, asynchrone) |
| GET | `/hosting/stacks/{name}` | `hosting:read` | Oui | Paramètres, conteneurs, dernière opération. Sans `hosting:write`, les valeurs d'environnement et les snippets sont masqués |
| PUT | `/hosting/stacks/{name}[?force=true]` | `hosting:write` | Oui | Modifier et redéployer, annulé en cas d'échec (202) |
| POST | `/hosting/stacks/{name}/deploy[?pull=true][&force=true]` | `hosting:write` | Oui | Redéployer (202) ; `force` écrase les modifications faites hors du panel |
| DELETE | `/hosting/stacks/{name}[?purgeData=true]` | `hosting:write` | Oui | Supprimer ; les données du site sont gardées sauf avec `purgeData` (202) |

### Services managés

Disponible quand `SERVICES_ENABLED` est activé (`/services/config` répond toujours).

| Méthode | Chemin | Scope | Admin | Description |
|---|---|---|---|---|
| GET | `/services/config` | `services:read` | Oui | État du module, moteurs, versions, options, politique d'exposition, état de la découverte des versions |
| GET | `/services/instances` | `services:read` | Oui | Instances avec état, réseaux, exposition, fin de support, mises à jour disponibles |
| GET | `/services/instances/{instance}/resources` | `services:read` | Oui | Ressources d'une instance |
| POST | `/services/resources` | `services:write` | Oui | Créer `{engine, version, name, options, legacyAuth, networks?}` ; renvoie les identifiants une seule fois |
| POST | `/services/instances/{instance}/resources/{name}/password` | `services:write` | Oui | Nouveau mot de passe, renvoyé une seule fois |
| DELETE | `/services/instances/{instance}/resources/{name}` | `services:write` | Oui | Supprimer une ressource (une instance dédiée est supprimée avec elle) |
| PATCH | `/services/instances/{instance}` | `services:write` | Oui | Modifier les options modifiables d'une instance dédiée `{options}` |
| POST | `/services/instances/{instance}/update` | `services:write` | Oui | Mettre à jour une instance dédiée `{version?}` ; renvoie `{updated, version, image}` |
| POST | `/services/updates/check` | `services:write` | Oui | Découvrir les versions et mises à jour maintenant, au plus une fois toutes les 30 secondes |
| PUT | `/services/instances/{instance}/networks` | `networks:write` | Oui | Remplacer les réseaux `{networks}` ; le conteneur est recréé |
| PUT | `/services/instances/{instance}/exposure` | `services:expose` | Oui | Publier `{address, port, tlsOptional?}` |
| DELETE | `/services/instances/{instance}/exposure` | `services:expose` | Oui | Fermer le port |
| DELETE | `/services/instances/{instance}[?purge=true]` | `services:write` | Oui | Retirer une instance partagée vide ; `purge` supprime une instance modifiée à la main, avec ses données |

`services:expose` n'est pas inclus dans `services:write`.

### Réseaux privés

Les corps sont stricts : les champs inconnus sont refusés (`INVALID_REQUEST_BODY`).

| Méthode | Chemin | Scope | Admin | Description |
|---|---|---|---|---|
| GET | `/networks` | `networks:read` | Oui | Réseaux privés, le réseau système `services` en premier |
| GET | `/networks/config` | `networks:read` | Oui | Règles de création |
| GET | `/networks/docker` | `networks:read` | Oui | Réseaux Docker que le panel n'a pas créés (lecture seule) |
| GET | `/networks/docker/{id}` | `networks:read` | Oui | L'un d'eux, avec ses membres |
| GET | `/networks/{name}` | `networks:read` | Oui | Un réseau privé avec ses membres |
| POST | `/networks` | `networks:write` | Oui | Créer `{name, description?, subnet?}` (201) |
| PATCH | `/networks/{name}` | `networks:write` | Oui | Modifier `{description}` |
| DELETE | `/networks/{name}` | `networks:write` | Oui | Supprimer (204) |
| POST | `/networks/{name}/members` | `networks:write` | Oui | Rattacher `{kind: "site" \| "instance" \| "function", name}` ; une fonction demande aussi `functions:deploy` |
| DELETE | `/networks/{name}/members/{kind}/{member}` | `networks:write` | Oui | Détacher ; une fonction demande aussi `functions:deploy` |
| POST | `/networks/{name}/disconnect` | `networks:write` | Oui | Déconnecter un conteneur que le panel ne gère pas `{containerId}` (204) |

### Fonctions (travail en cours)

Disponible quand `FUNCTIONS_ENABLED` est activé (`/functions/config` répond toujours). Les corps sont stricts. Créer avec `env`, `networks`, `egress`, `sigv4` ou `mcpInvocable`, ou modifier `env`, `handler` ou `mcpInvocable`, demande `functions:deploy` en plus de `functions:write`.

| Méthode | Chemin | Scope | Admin | Description |
|---|---|---|---|---|
| GET | `/functions/config` | `functions:read` | Oui | État du module, runtimes et versions, état du binaire du runtime (`runtime`, `runtimeReady`), limites, budget utilisé, valeurs par défaut |
| GET | `/functions` | `functions:read` | Oui | Fonctions et leur état |
| POST | `/functions` | `functions:write` | Oui | Créer `{name, runtime, runtimeVersion, handler, memoryMB?, cpus?, timeoutSeconds?, tmpSizeMB?, env?, networks?, egress?, sigv4?, mcpInvocable?}` (201) ; renvoie une seule fois les identifiants d'invocation |
| GET | `/functions/{name}` | `functions:read` | Oui | Détails : image, variables, noms des secrets, déploiements, endpoint ; le conteneur est vérifié |
| PATCH | `/functions/{name}` | `functions:write` | Oui | Modifier `{memoryMB?, cpus?, timeoutSeconds?, tmpSizeMB?, handler?, env?, mcpInvocable?}` ; une fonction en marche est recréée |
| DELETE | `/functions/{name}[?purge=true]` | `functions:write` | Oui | Supprimer ; `purge` supprime une fonction modifiée hors du panel sans exécuter ses fichiers |
| POST | `/functions/{name}/code` | `functions:deploy` | Oui | Déployer un zip (corps `application/zip` ou partie `code` d'un `multipart/form-data`), activé aussitôt (201) |
| GET | `/functions/{name}/deployments` | `functions:read` | Oui | Déploiements conservés, du plus récent au plus ancien |
| POST | `/functions/{name}/deployments/{id}/activate` | `functions:deploy` | Oui | Activer un déploiement conservé (204) |
| PUT | `/functions/{name}/secrets/{key}` | `functions:deploy` | Oui | Définir un secret `{value}` (204) ; jamais renvoyé |
| DELETE | `/functions/{name}/secrets/{key}` | `functions:deploy` | Oui | Supprimer un secret (204) |
| POST | `/functions/{name}/credentials/rotate` | `functions:deploy` | Oui | Nouveaux identifiants d'invocation, renvoyés une seule fois ; `{sigv4}` facultatif |
| POST | `/functions/{name}/invoke` | `functions:invoke` | Oui | Invoquer avec le corps comme événement (une valeur JSON, 6 Mio au plus) ; toujours 200 avec `{statusCode, functionError?, requestId?, durationMs, payload? \| payloadBase64?, logTail}` |
| POST | `/functions/{name}/{action}` | `functions:write` | Oui | `start`, `stop`, `restart` (204) |
| PUT | `/functions/{name}/networks` | `functions:deploy` | Oui | Remplacer les réseaux `{networks}` (jamais `services`) ; le conteneur est recréé |
| PUT | `/functions/{name}/egress` | `functions:deploy` | Oui | Accès à Internet `{enabled}` |

Ce que renvoie une fonction n'est pas fiable : affichez-le comme texte. Les conteneurs des fonctions sont protégés dans les routes des conteneurs : leur environnement est masqué, et shell, copie de fichiers, lecture de fichiers, tunnel de port, actions sur les conteneurs et les stacks et tâches cron Docker répondent `403 FUNCTION_CONTAINER_PROTECTED`. Leur sortie standard reste lisible par les admins.

### Journal d'audit

| Méthode | Chemin | Scope | Admin | Description |
|---|---|---|---|---|
| GET | `/audit?from=&to=&user=&event=&exclude=&level=&q=&before=&limit=` | `audit:read` | Oui | Entrées, les plus récentes d'abord ; `limit` jusqu'à 500 |

Une requête lit au plus 64 Mo du journal : une page peut donc être plus courte que `limit`, voire vide. Continuez tant que la réponse contient un curseur `next`, à passer dans `before`.

## WebSocket

Connectez-vous à `/ws` avec le cookie de session ou l'en-tête `X-API-Key`. Les messages sont en JSON `{"event": ..., "data": ...}`. Le scope est vérifié sur les événements qui ouvrent une session ; un scope manquant renvoie l'événement d'erreur correspondant (`error`, `logsError`, `statsError`, `proxyError`, `streamError`).

| Événement client | Scope | Données |
|---|---|---|
| `attach` | `containers:shell` | `{"id": "container-id"}` |
| `streamInput` | — (après `attach`) | `"command"` |
| `resize` | — (après `attach`) | `{"cols": 120, "rows": 40}` |
| `logsStart` | `containers:logs` | `{"id": "container-id", "tail": 100, "file": "/optional/path"}` |
| `logsStop` | — | — |
| `statsStart` | `containers:stats` | `{"ids": ["container-id-1", "container-id-2"]}` |
| `statsStop` | — | — |
| `proxyOpen` | `containers:proxy` | `{"id": "container-id", "mappings": [{"remote": 5432, "local": 15432}]}` |
| `streamOpen` | `containers:proxy` | `{"streamID": 1, "remotePort": 5432}` |
| `streamClose` | — | `{"streamID": 1}` |

Événements serveur : `attach`, `stdout`, `stderr`, `end`, `logsData`, `logsEnd`, `logsError`, `statsData`, `statsError`, `proxyReady`, `streamOpened`, `streamClose`, `streamError`, `proxyError`, `error`.

| Limite | Valeur |
|---|---|
| Données du proxy de ports | Messages binaires `[streamID: uint32 big endian][payload]` |
| Proxy de ports | 10 correspondances au plus par session et 256 flux simultanés |
| Statistiques | Collectées toutes les 2 secondes, 20 conteneurs au plus par abonnement, un `statsStart` toutes les 3 secondes au plus |
