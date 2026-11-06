---
sidebar_position: 3
title: Scopes des clés API
description: Toutes les permissions qu'une clé API peut porter, ce qu'elles autorisent et si elles demandent un profil admin.
---

# Scopes des clés API

Un scope limite ce qu'une clé API peut faire. L'interface les appelle **Permissions**. Les sessions de navigateur ont toujours toutes les permissions de leur utilisateur. Pour créer une clé, voir [Clés API](../user-guide/api-keys.md).

| Scope | Libellé dans l'interface | Autorise | Admin uniquement |
|---|---|---|---|
| `*` | **Toutes les permissions** | Tout ce que le profil de l'utilisateur permet. Ne peut pas être combiné avec d'autres scopes | Non |
| `containers:read` | **Lecture (lister, inspecter)** | Lister les conteneurs et lire leur détail (`GET /docker`, `GET /docker/{id}`) | Non |
| `containers:logs` | **Logs (télécharger, streaming)** | Télécharger les logs, les suivre en direct, lire un fichier dans un conteneur (`/logs/**`, WebSocket `logsStart`) | Non |
| `containers:actions` | **Actions (start, stop, restart, kill, delete)** | Actions sur les conteneurs et les stacks (`POST /docker/{id}/{action}`, `POST /stacks/{name}/{action}`) | Non |
| `containers:shell` | **Shell (terminal distant)** | Ouvrir un terminal dans un conteneur (WebSocket `attach`) | Non |
| `containers:stats` | **Stats (monitoring temps réel)** | CPU, RAM, réseau et PIDs en direct (WebSocket `statsStart`) | Non |
| `containers:proxy` | **Proxy (tunnel de ports)** | Ouvrir un tunnel de ports vers un conteneur (WebSocket `proxyOpen` / `streamOpen`) | Non |
| `containers:cp` | **Copie de fichiers (cp)** | Télécharger et envoyer des fichiers (`GET` / `PUT /docker/{id}/cp`) | Non |
| `cron` | **Tâches cron** | Toutes les routes des tâches planifiées (`/cron/**`) | Non |
| `sftp:read` | **SFTP (lecture)** | Lire les comptes et la configuration SFTP | Oui |
| `sftp:write` | **SFTP (création, modification, suppression)** | Modifier les comptes SFTP | Oui |
| `hosting:read` | **Hébergement (lecture)** | Lire les sites web | Oui |
| `hosting:write` | **Hébergement (création, modification, déploiement, suppression)** | Modifier et déployer les sites web | Oui |
| `services:read` | **Bases de données (lecture)** | Lire les services managés | Oui |
| `services:write` | **Bases de données (création, nouveau mot de passe, suppression)** | Modifier les services managés | Oui |
| `services:expose` | **Bases de données (publication d'un port)** | Publier et fermer le port d'une instance. Non inclus dans `services:write` | Oui |
| `networks:read` | **Réseaux privés (lecture)** | Lire les réseaux privés | Oui |
| `networks:write` | **Réseaux privés (création, rattachement, détachement, suppression)** | Modifier les réseaux privés, y compris les réseaux d'une instance de service | Oui |
| `functions:read` | — | Lire les fonctions et la configuration du module (`GET /functions/**`) | Oui |
| `functions:write` | — | Créer, redimensionner, démarrer, arrêter, redémarrer et supprimer des fonctions | Oui |
| `functions:deploy` | — | Code et déploiements, secrets, identifiants d'invocation, variables, handler, réseaux, accès à Internet et autorisation MCP d'une fonction | Oui |
| `functions:invoke` | — | Invoquer une fonction (`POST /functions/{name}/invoke`) et, avec `cron`, créer, modifier ou lancer une invocation planifiée. Implicite seulement avec `*` | Oui |
| `audit:read` | **Audit trail (lecture)** | Lire le journal d'audit (`GET /audit`) | Oui |

## Règles

- **Le profil d'abord** : une clé porte le profil de son utilisateur. Un scope réservé aux admins sur la clé d'un utilisateur ne donne rien.
- **Les permissions sur les conteneurs s'appliquent toujours** : un scope conteneur n'atteint que les conteneurs auxquels l'utilisateur a accès.
- **Sans scope** : votre propre profil et vos clés (`/users/me`, `/users/me/api-keys`), ainsi que les routes d'administration des utilisateurs et `/domains`, qui ne vérifient que le profil.
- **Pas d'escalade** : une clé ne peut créer des clés que dans ses propres scopes.
- **Fonctions (travail en cours)** : créer une fonction avec des variables, des réseaux, l'accès à Internet, SigV4 ou l'autorisation MCP, ou modifier ses variables, son handler ou son autorisation MCP, demande à la fois `functions:write` et `functions:deploy`.
- **Arrêts WebSocket** : `logsStop` et `statsStop` ne demandent aucun scope : ils arrêtent seulement un flux ouvert par la connexion.
- **Validation** : au moins un scope est requis, les scopes inconnus sont refusés. Les clés créées avant l'arrivée des scopes n'en ont aucun et gardent un accès complet.

## Dans l'interface

La liste **Permissions** du formulaire de création n'affiche que les scopes utiles :

| Scopes | Affichés quand |
|---|---|
| `sftp:*`, `hosting:*`, `services:*` | Vous êtes admin et le module est activé (`SFTP_ENABLED`, `HOSTING_ENABLED`, `SERVICES_ENABLED`) |
| `networks:*`, `audit:read` | Vous êtes admin |

Les scopes `functions:*` ne figurent pas encore dans le formulaire (« — » ci-dessus) : une clé avec **Toutes les permissions** les couvre, ou créez la clé via l'API (`POST /users/me/api-keys`).
