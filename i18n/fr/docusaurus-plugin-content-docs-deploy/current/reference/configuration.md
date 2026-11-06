---
sidebar_position: 1
title: Référence de configuration
description: Toutes les variables d'environnement de Loch Deploy avec leur valeur par défaut et leur validation, les options de ligne de commande et les limites HTTP et docker fixes.
---

# Référence de configuration

Tous les réglages sont lus dans les variables d'environnement au démarrage (`config/config.go`). Une valeur invalide journalise `invalid configuration` et arrête le serveur avec le code `1`. Au démarrage, le serveur lance aussi la découverte OIDC sur `GITLAB_ISSUER` et s'arrête si elle échoue.

## Variables d'environnement

| Variable | Défaut | Validation et comportement |
|---|---|---|
| `LISTEN_ADDR` | `:8080` | Adresse d'écoute HTTP, en clair. Le healthcheck de l'image en déduit son port ; écoutez sur toutes les interfaces ou sur la boucle locale |
| `COMPOSE_BASE` | `/data/compose` | Racine des répertoires compose, un par stack. Même chemin sur l'hôte et dans le conteneur |
| `WEBSITES_BASE` | `/data/websites` | Racine des données des bind mounts. Même chemin sur l'hôte et dans le conteneur |
| `DATA_DIR` | `./data` | État du serveur (`registry.json`, `autostop.json`), créé en mode `0700`. L'image et le déploiement de référence utilisent `/app/data` |
| `MAX_UPLOAD_MB` | `10` | Taille maximale du corps de `POST /deploy`, en Mo. Entier de `1` à `1024` |
| `GITLAB_ISSUER` | obligatoire | Émetteur OIDC GitLab. URL `https://` absolue avec un hôte |
| `GITLAB_AUDIENCE` | obligatoire | Claim `aud` exigé. Doit être égal à `aud` dans les `id_tokens` des jobs |
| `PROTECTED_ENVS` | `production` | Noms d'environnements séparés par des virgules qui exigent `ref_protected`. Transformés en slug comme le claim du jeton (`Production` = `production`) ; un nom au slug vide est refusé |
| `ALLOWED_NAMESPACES` | vide : tous les projets | Chemins de namespaces GitLab séparés par des virgules. Un jeton passe quand `namespace_path` est égal à l'un d'eux ou en est un sous-chemin (`apps/x` autorise `apps/x/api`, pas `apps/x-evil`). Mis en minuscules, barres obliques extérieures retirées, segments `.` et `..` refusés. Vide journalise un avertissement |
| `FORBIDDEN_TRAEFIK_HOSTS` | vide | Hôtes séparés par des virgules qu'aucune règle Traefik `Host()` ne peut nommer. Port et point final retirés, mis en minuscules, dédoublonnés ; chacun doit être un nom DNS ou une IP |
| `ALLOWED_EXTERNAL_NETWORKS` | vide : aucun | Réseaux Docker séparés par des virgules que les stacks peuvent rejoindre avec `external: true`. Sensible à la casse, doit respecter `^[a-zA-Z0-9][a-zA-Z0-9_.-]*$` |
| `ALLOWED_IPS` | vide : désactivé | IP ou CIDR séparés par des virgules. Les autres clients reçoivent `403` ; `/health` est exempté. Vide journalise un avertissement |
| `TRUSTED_PROXIES` | vide | IP ou CIDR séparés par des virgules des proxys autorisés à définir `X-Forwarded-For`. Nécessaire pour `ALLOWED_IPS` derrière un proxy. Limitez-le à l'adresse exacte du proxy |

Les IP seules dans `ALLOWED_IPS` et `TRUSTED_PROXIES` valent `/32` (IPv4) ou `/128` (IPv6).

### IP du client derrière un proxy

- Depuis un pair hors de `TRUSTED_PROXIES`, l'IP du socket est utilisée et `X-Forwarded-For` est ignoré.
- Depuis un proxy de confiance, l'adresse la plus à droite de `X-Forwarded-For` qui n'est pas elle-même un proxy de confiance est utilisée. Une entrée illisible fait refuser la requête.
- Un en-tête absent, ou qui ne liste que des proxys, revient à l'IP du socket.

## Options

| Option | Effet |
|---|---|
| `-version` | Affiche `deploy-server <version>` et s'arrête |
| `-import-registry <file>` | Fusionne `<file>` (format `registry.json`) dans `DATA_DIR/registry.json`, puis s'arrête. Ne lit que `DATA_DIR`. Tout ou rien. Code `0` en cas de succès, `1` en cas d'échec, `2` si les arguments sont invalides. À lancer serveur arrêté |

Format du fichier : [Clé de stack et arborescence](./stack-key-and-layout.md#registry-json).

## Limites HTTP

Fixées dans le code :

| Limite | Valeur |
|---|---|
| Lecture des en-têtes (`ReadHeaderTimeout`) | 10 s |
| Lecture de la requête entière, corps compris (`ReadTimeout`) | 5 min |
| Traitement complet de la requête (`WriteTimeout`) | 16 min |
| Keep-alive inactif (`IdleTimeout`) | 60 s |
| Taille des en-têtes | 64 Kio |
| Corps JSON (`/exec`, `/directories`) | 1 Mio |
| Corps multipart (`/deploy`) | `MAX_UPLOAD_MB` |
| Arrêt propre sur `SIGINT` / `SIGTERM` | 30 s |

## Limites docker

| Opération | Délai |
|---|---|
| Inspection des conteneurs existants de la stack | 30 s au total |
| `docker compose config` | 1 min |
| `docker compose pull` | 7 min |
| `docker compose up` | 7 min |
| `docker compose down` | 10 min |
| Suppression des conteneurs restants | 2 min |
| `docker compose exec` (`/exec`) | 5 min |
| Chaque arrêt automatique | 10 min |

Une commande qui dépasse son délai est interrompue, puis tuée après 10 s. Au plus 4 processus docker tournent en même temps sur le serveur ; l'attente d'un créneau n'est pas comptée dans les délais. La sortie est plafonnée à 1 Mio par flux. Au plus 2 arrêts automatiques tournent en même temps.

## Vérification des jetons

| Vérification | Valeur |
|---|---|
| Signature, `iss`, `aud`, `exp` | Avec le JWKS de GitLab |
| Âge maximal du jeton (`iat`) | 10 min |
| `iat` dans le futur | 30 s au plus |
| Décalage d'horloge | 30 s |
| Délai des requêtes vers GitLab | 10 s |
