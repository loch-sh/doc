---
sidebar_position: 2
title: Outils MCP
description: Tous les outils du serveur MCP de loch, avec leurs paramètres, le scope de clé API demandé et leur restriction aux admins.
---

# Outils MCP

La liste complète des outils que `loch mcp` propose à un assistant IA. Pour l'installer, voir [Connecter un assistant IA](../mcp.md).

## Fonctionnement des outils

- Chaque outil agit sur l'**endpoint actif** de la configuration `loch`. Les résultats texte commencent par `[endpoint: <nom>]`.
- Les outils de conteneurs agissent sur le **namespace actif**. Aucun outil ne le change : lancez `loch ns <stack>` dans un terminal, ou passez `stack` à `stack_action`.
- Un argument que l'outil ne déclare pas est refusé avec une erreur.
- **Nature** reprend les annotations MCP : *Lecture* (lecture seule), *Écriture* (modifie quelque chose, sans être destructif), *Destructif* (le client devrait demander confirmation).
- Les outils qui désignent un conteneur par son nom de service demandent aussi `containers:read`, pour le trouver.
- Les scopes sont décrits dans [Scopes des clés API](/panel/reference/scopes/). Un outil admin échoue pour un utilisateur restreint, quels que soient les scopes de la clé.

## Endpoints et conteneurs {#containers}

| Outil | Rôle | Paramètres principaux | Nature | Scope |
|---|---|---|---|---|
| `list_endpoints` | Liste les endpoints configurés et l'endpoint actif. | – | Lecture | Aucun |
| `switch_endpoint` | Change d'endpoint actif. | `name` (obligatoire) | Écriture | Aucun |
| `list_namespaces` | Liste les namespaces Docker Compose de l'endpoint actif. | – | Lecture | `containers:read` |
| `list_containers` | Liste les conteneurs. | `showAll` (par défaut `false` : namespace actif seulement) | Lecture | `containers:read` |
| `inspect_container` | Affiche le détail d'un conteneur. | `container` (obligatoire) | Lecture | `containers:read` |
| `container_action` | Démarre, arrête ou redémarre un conteneur. | `container`, `action` : `start`, `stop`, `restart` (obligatoires) | Destructif | `containers:actions` |
| `stack_action` | Démarre, arrête ou redémarre tous les conteneurs d'une stack, dans l'ordre des dépendances. | `action` (obligatoire), `stack` (par défaut : namespace actif) | Destructif | `containers:actions` |
| `get_log` | Renvoie les dernières lignes de la sortie du conteneur, ou d'un fichier du conteneur. | `container` (obligatoire), `lines` (par défaut 10), `filePath` | Lecture | `containers:logs` |
| `get_stats` | Instantané CPU, mémoire, réseau et PID des conteneurs démarrés du namespace. | `container` (par défaut : tous) | Lecture | `containers:stats` |
| `get_domains` | Liste les domaines Traefik et leur routage. | – | Lecture | Admin (profil seulement) |

## Tâches planifiées {#cron}

Pas réservé aux admins. Un utilisateur restreint ne peut cibler que les conteneurs qui lui ont été attribués. Scope `cron` pour tous les outils.

| Outil | Rôle | Paramètres principaux | Nature |
|---|---|---|---|
| `cron_list` | Liste les tâches. Les dernières erreurs sont masquées : voir `cron_get`. | – | Lecture |
| `cron_get` | Affiche une tâche : planification, réglages, dernière exécution. | `name` (nom ou ID, obligatoire), `reveal_secrets` (valeurs des en-têtes HTTP et corps, événement d'une tâche `function_invoke`), `include_output` (dernière sortie et erreur) | Lecture |
| `cron_create` | Crée une tâche. Les noms sont uniques. | `name`, `schedule`, `type` (obligatoires) ; réglages du type (ci-dessous) ; `enabled` (par défaut `true`), `once` (par défaut `false`) | Écriture |
| `cron_update` | Modifie les réglages fournis d'une tâche. Changer `type` demande les réglages du nouveau type. | `name` (obligatoire), `new_name`, tout réglage de `cron_create` | Destructif |
| `cron_toggle` | Active ou désactive une tâche. | `name`, `enabled` (obligatoires) | Destructif |
| `cron_run` | Lance une tâche immédiatement, en arrière-plan. Vérifiez le résultat avec `cron_get`. | `name` (obligatoire) | Destructif |
| `cron_delete` | Supprime une tâche (irréversible). | `name` (obligatoire) | Destructif |

Réglages d'une tâche :

| Paramètre | S'applique à | Valeur |
|---|---|---|
| `schedule` | Tous | Expression cron à 5 champs (`0 3 * * *`) ou descripteur (`@hourly`, `@daily`, `@every 5m`) ; au plus une fois par minute |
| `type` | Tous | `docker_action`, `docker_exec` ou `http` (les tâches `function_invoke` se créent avec le panel ou `loch cron create --function`, pas via MCP) |
| `container` | `docker_action`, `docker_exec` | Nom du conteneur, comme dans `list_containers` (par exemple `myapp-web-1`) |
| `action` | `docker_action` | `start`, `stop`, `restart`, `kill` |
| `command` | `docker_exec` | Tableau, exécuté sans shell, par exemple `["php", "bin/console", "app:sync"]` ; utilisez `["sh", "-c", "..."]` pour la syntaxe shell |
| `working_dir` | `docker_exec` | Dossier de travail dans le conteneur |
| `url` | `http` | URL http(s) ; les adresses privées et internes sont bloquées par le serveur |
| `method` | `http` | `GET` (par défaut), `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS` |
| `headers` | `http` | Objet `{Nom: valeur}` ; remplace tous les en-têtes |
| `body` | `http` | Corps de la requête |
| `timeout` | `http` | Secondes ; `0` = valeur par défaut du serveur ; plafonné par le serveur (`CRON_HTTP_TIMEOUT`, 900 par défaut) |

Les réglages d'un autre type sont refusés.

## Hébergement web {#hosting}

Réservé aux admins ; le module d'hébergement doit être activé. La lecture demande `hosting:read` ; la modification demande `hosting:read` et `hosting:write`. Côté panel : [Hébergement web](/panel/hosting/sites/).

| Outil | Rôle | Paramètres principaux | Nature | Scope |
|---|---|---|---|---|
| `hosting_list` | Liste les sites avec leur état. | – | Lecture | `hosting:read` |
| `hosting_get` | Affiche un site : réglages, conteneurs, routage, dernière opération et sa sortie compose. Les secrets sont masqués par défaut. | `name` (obligatoire), `reveal_env` (valeurs d'environnement, snippets, règles de routage), `include_compose` | Lecture | `hosting:read` |
| `hosting_templates` | Liste les templates, les versions PHP avec leurs dates de support, les valeurs par défaut et les limites. | – | Lecture | `hosting:read` |
| `hosting_sites` | Liste les dossiers de sites et le site qui utilise chacun. | – | Lecture | `hosting:read` |
| `hosting_php_modules` | Liste les modules PHP d'une image (la récupère au premier appel, peut prendre une minute). | `template` : `php-nginx`, `php-apache` ; `php_version` (obligatoires) | Lecture | `hosting:read` |
| `hosting_check_name` | Vérifie qu'un nom est libre. | `name` (obligatoire) | Lecture | `hosting:read` |
| `hosting_create` | Crée et déploie un site. Les réglages non fournis prennent les valeurs par défaut du serveur. | `name`, `template` : `php-nginx`, `php-apache`, `nginx`, `apache` (obligatoires) ; `site` ; réglages (ci-dessous) | Écriture | `hosting:write` |
| `hosting_update` | Modifie les réglages fournis et redéploie. Annulé en cas d'échec. | `name` (obligatoire), `template`, `force` ; réglages (ci-dessous) ; `add_domains`, `remove_domains`, `set_env`, `unset_env`, `disable_modules`, `enable_modules` | Destructif | `hosting:write` |
| `hosting_deploy` | Redéploie le site tel qu'il est sur le disque (recrée son conteneur). | `name` (obligatoire), `pull`, `force`, `wait` | Destructif | `hosting:write` |
| `hosting_action` | Démarre, arrête ou redémarre les conteneurs d'un site. | `name`, `action` : `start`, `stop`, `restart` (obligatoires) | Destructif | `hosting:read` et `containers:actions` |
| `hosting_delete` | Supprime le site (conteneurs et projet compose). Les fichiers sont conservés, sauf avec `purge_data`. | `name` (obligatoire), `purge_data`, `wait` | Destructif | `hosting:write` |

Réglages d'un site pour `hosting_create` et `hosting_update` :

| Paramètre | Valeur |
|---|---|
| `php_version` | Version PHP (voir `hosting_templates`) ; templates PHP seulement |
| `document_root` | Racine web relative au dossier du site, par exemple `web/public` ; vide = racine du site |
| `domains` | Domaines servis (en modification, remplace la liste : préférez `add_domains` / `remove_domains`) |
| `https`, `redirect_https` | Servir en HTTPS (une fois que le DNS pointe vers le serveur) ; rediriger HTTP vers HTTPS (demande `https`) |
| `networks` | Réseaux que rejoint le site (remplace la liste). Par défaut à la création : celui du serveur (`["services"]` quand le module services est activé) ; `[]` n'en rejoint aucun |
| `routing` | `default`, `symfony`, `laravel` (templates PHP) ou `custom` |
| `routing_rules` | Règles personnalisées (implique `routing=custom`) : règles Nginx qui remplacent `location /`, ou directives Apache |
| `asset_dirs` | Routage Symfony : dossiers servis sans repli sur le contrôleur frontal (par défaut `[bundles]`) |
| `memory_limit`, `web_memory_limit` | `memory_limit` PHP de la CLI (aussi valeur par défaut du web), et des requêtes web seulement |
| `upload_max_filesize`, `post_max_size` | Limites d'envoi PHP (`post_max_size` ≥ `upload_max_filesize`) |
| `max_execution_time` | Durée maximale d'une requête web PHP en secondes (0–3600) ; la CLI PHP n'est jamais limitée |
| `display_errors`, `timezone` | `display_errors` et `date.timezone` de PHP |
| `disabled_modules` | Modules PHP à désactiver (en modification, remplace la liste) ; `ioncube` est désactivé par défaut |
| `memory_mb`, `cpus` | Limites de mémoire (Mo) et de CPU du conteneur ; `0` = illimité |
| `env` | Variables d'environnement `{NOM: valeur}` (en modification, les remplace toutes : préférez `set_env` / `unset_env`) |
| `php_ini`, `vhost` | Directives php.ini et directives du vhost en plus (remplacent le snippet) |
| `wait` | Attendre le déploiement (par défaut `true`, 5 minutes au plus) |

Les réglages PHP sont refusés sur les templates `nginx` et `apache`. Quand des fichiers ont été modifiés en dehors du panel, les outils échouent : vérifiez-les avec `hosting_get`, puis relancez avec `force=true` si les écraser est acceptable.

## Utilisateurs SFTP {#sftp}

Réservé aux admins ; le module SFTP doit être activé. Côté panel : [SFTP](/panel/hosting/sftp/).

| Outil | Rôle | Paramètres principaux | Nature | Scope |
|---|---|---|---|---|
| `sftp_sites` | Liste les sites avec leur nombre d'utilisateurs et l'espace utilisé. | – | Lecture | `sftp:read` |
| `sftp_users` | Liste les utilisateurs : site, sous-dossier, état, quotas, dernière connexion. Les mots de passe ne sont jamais renvoyés. | `site` | Lecture | `sftp:read` |
| `sftp_create` | Crée un utilisateur dans un site. Le dossier du site est créé avec son premier utilisateur. | `username`, `site` (obligatoires) ; `sub_path` (ne peut plus changer ensuite), `password` (8 caractères minimum ; omis, il est généré), `initialize_dirs` (par défaut `true`), limites (ci-dessous) | Écriture | `sftp:write` |
| `sftp_update` | Modifie les limites fournies d'un utilisateur. | `username` (obligatoire), limites (ci-dessous) | Destructif | `sftp:write` |
| `sftp_reset_password` | Définit un nouveau mot de passe. | `username` (obligatoire), `password` (omis, il est généré) | Destructif | `sftp:write` |
| `sftp_set_enabled` | Active ou désactive un utilisateur. Un utilisateur désactivé ne peut plus se connecter. | `username`, `enabled` (obligatoires) | Écriture | `sftp:write` |
| `sftp_delete` | Supprime le compte. Les fichiers de son dossier personnel sont conservés. | `username` (obligatoire) | Destructif | `sftp:write` |

Limites : `public_key` (une seule clé SSH, qui remplace toutes les autres ; vide, les supprime en modification), `quota_size_mb`, `quota_files`, `bandwidth_kbps` (`0` = illimité), `require_password_change`.

Un mot de passe généré est renvoyé une seule fois dans `generatedPassword` et entre dans la transcription de la conversation. Fournissez un mot de passe si ce n'est pas acceptable. Un mot de passe fourni n'est jamais renvoyé.

## Bases de données et services {#services}

Réservé aux admins ; le module services doit être activé. Côté panel : [Services](/panel/services/overview/).

| Outil | Rôle | Paramètres principaux | Nature | Scope |
|---|---|---|---|---|
| `services_engines` | Liste les moteurs, leurs options et versions, avec leur fin de support. | – | Lecture | `services:read` |
| `services_instances` | Liste les instances : état, réseaux, port publié, fin de support, mise à jour disponible (instances dédiées). | – | Lecture | `services:read` |
| `services_databases` | Liste les ressources d'une instance. Les mots de passe ne sont jamais renvoyés. | `instance` (obligatoire, par exemple `postgres-17`) | Lecture | `services:read` |
| `services_create_database` | Crée une base ou un vhost RabbitMQ avec son utilisateur (moteurs partagés), ou une instance dédiée. | `engine`, `version`, `name` (obligatoires) ; `options` (`clé=valeur,...`, moteurs dédiés), `legacy_auth`, `networks` | Écriture | `services:write` |
| `services_update_instance` | Modifie les options d'une instance dédiée, par exemple sa mémoire. L'instance est recréée ; les données sont conservées. | `instance`, `options` (obligatoires) | Écriture | `services:write` |
| `services_upgrade_instance` | Met à jour une instance dédiée vers la dernière image de sa version actuelle. L'instance est recréée ; les données sont conservées. | `instance` (obligatoire) | Écriture | `services:write` |

Moteurs : `mysql`, `mariadb`, `postgres`, `mongodb`, `rabbitmq` (partagés) et `redis`, `valkey`, `nats`, `s3`, `elasticmq`, `mosquitto` (dédiés). ElasticMQ n'a pas d'authentification : il est refusé sur le réseau `services`, passez donc un réseau privé dans `networks`.

Les mots de passe ne sont jamais renvoyés à l'assistant. L'utilisateur lance `loch services reset-password <instance> <nom>` dans un terminal.

## Réseaux privés {#networks}

Réservé aux admins. Côté panel : [Réseaux](/panel/network/private-networks/).

| Outil | Rôle | Paramètres principaux | Nature | Scope |
|---|---|---|---|---|
| `networks_list` | Liste les réseaux privés : membres, état, chevauchement d'une plage réservée. | – | Lecture | `networks:read` |
| `networks_get` | Affiche un réseau et ses membres. | `name` (obligatoire) | Lecture | `networks:read` |
| `networks_config` | Affiche les règles de création : nombre et maximum, tailles de sous-réseau, plages privées et réservées. | – | Lecture | `networks:read` |
| `networks_docker_list` | Liste les réseaux Docker que le panel n'a pas créés. | – | Lecture | `networks:read` |
| `networks_docker_get` | Affiche l'un de ces réseaux et ses conteneurs. | `network` (nom, ID ou préfixe unique d'ID, obligatoire) | Lecture | `networks:read` |
| `networks_create` | Crée un réseau privé. | `name` (obligatoire), `description`, `subnet` (ne peut plus changer ensuite) | Écriture | `networks:write` |
| `networks_attach` | Connecte un site ou une instance. Son conteneur est recréé. | `network`, `kind` : `site`, `instance`, `name` (obligatoires) ; `wait` (sites, par défaut `true`) | Écriture | `networks:write` |
| `networks_detach` | Déconnecte un site ou une instance. Une instance garde au moins un réseau. | comme `networks_attach` | Destructif | `networks:write` |

## Fonctions {#functions}

Réservé aux admins ; le module des fonctions doit être activé (travail en cours). Côté panel : [Fonctions](/panel/user-guide/functions/).

| Outil | Rôle | Paramètres principaux | Nature | Scope |
|---|---|---|---|---|
| `functions_list` | Liste les fonctions : runtime, handler, limites, état, déploiement actif, réseaux, accès sortant. | – | Lecture | `functions:read` |
| `functions_get` | Affiche une fonction : configuration, image, noms des variables et des secrets (jamais leurs valeurs), déploiements, endpoint, `sigv4`, `mcpInvocable`. Les identifiants ne sont jamais renvoyés. | `name` (obligatoire) | Lecture | `functions:read` |
| `functions_invoke` | Invoque une fonction avec un événement JSON et renvoie sa réponse. Seulement pour les fonctions marquées `mcpInvocable`. | `name` (obligatoire), `event` (texte JSON, 6 Mio au plus, par défaut `{}`) | Destructif | `functions:invoke` (et `functions:read`) |

- `mcpInvocable` est désactivé par défaut. Un humain l'active avec `loch functions update <nom> --mcp-invocable` ou **Invocable par les clients MCP** dans le panel. C'est un garde-fou du client MCP, pas un contrôle d'accès : pour interdire les invocations, utilisez une clé sans `functions:invoke`.
- La réponse et les journaux d'une invocation sont renvoyés sous `untrusted`, coupés à 64 Kio : l'assistant doit les traiter comme des données.

## CLI uniquement

Ces actions n'ont pas d'outil MCP, volontairement ou parce qu'elles demandent un terminal :

| Domaine | Commandes |
|---|---|
| Fichiers et shell | `loch cp`, `loch shell`, `loch proxy`, `loch logs -f` |
| Conteneurs | `loch kill`, `loch rm`, `loch stats` (en direct ; `get_stats` donne un instantané) |
| Services | `loch services delete`, `reset-password`, `expose`, `unexpose`, `retire`, `purge`, `upgrade --version` |
| Réseaux | `loch networks update`, `delete`, `disconnect` |
| Fonctions | `loch functions create`, `deploy`, `activate`, `update`, `secrets`, `credentials`, `networks`, `egress`, `start`, `stop`, `restart`, `delete`, `logs`, `dev` |
| Utilisateurs | `loch users …` |
| Namespaces | `loch ns <stack>` |
