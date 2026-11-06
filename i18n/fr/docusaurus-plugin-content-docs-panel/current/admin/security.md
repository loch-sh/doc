---
sidebar_position: 9
title: Sécurité
description: Ce qu'un admin de Loch Panel doit savoir sur les clés API, le contrôle d'origine, le conteneur de l'API protégé et l'exposition réseau.
---

# Sécurité

Les points qu'un admin doit maîtriser. L'API applique le reste d'elle-même.

## Exposition réseau

- **L'API pilote Docker.** Elle monte le socket Docker : qui contrôle l'API contrôle l'hôte. Ne la publiez qu'à travers un reverse proxy HTTPS.
- **HTTPS uniquement.** Les cookies de session sont `Secure`, `httpOnly` et signés avec `COOKIE_SECRET` (32 caractères minimum). Gardez ce secret hors de votre gestion de versions.
- **Proxys de confiance.** L'IP du client (limite de débit, audit trail) n'est lue dans `X-Forwarded-For` que si la requête vient de la boucle locale ou de `TRUSTED_PROXIES`. N'y listez que le sous-réseau du reverse proxy, jamais une plage Docker entière : n'importe quel conteneur pourrait alors usurper son IP.
- **Limite de débit** : 120 requêtes par minute et par IP, WebSocket compris.

## Contrôle d'origine (CSRF)

Le cookie de session est `SameSite=None` : l'API vérifie donc l'origine de chaque requête d'écriture (`POST`, `PUT`, `PATCH`, `DELETE`) :

- une requête de navigateur doit porter l'`Origin` de `FRONT_URL` (schéma, hôte et port), sinon elle reçoit `403 FORBIDDEN_ORIGIN` ;
- le WebSocket vérifie la même origine ;
- les requêtes sans en-têtes de navigateur (CLI, serveur MCP, scripts) ne sont pas concernées : elles utilisent des clés API, pas des cookies.

Si les écritures échouent avec `FORBIDDEN_ORIGIN`, `FRONT_URL` ne correspond pas à l'URL saisie par les utilisateurs dans leur navigateur.

## Clés API

Chaque utilisateur crée ses propres clés, pour la CLI `loch` et les scripts.

| Règle | Valeur |
|---|---|
| Format | `loch_` + 64 caractères hexadécimaux, envoyée dans `X-API-Key` |
| Affichage | Une seule fois, à la création ; seule son empreinte SHA-256 est stockée |
| Durée de vie | 1 à 365 jours |
| Par utilisateur | 20 clés au maximum |
| Profil | La clé a le profil de son utilisateur : la clé d'un utilisateur restreint n'atteint jamais les routes d'administration |
| Scopes | Une clé peut être limitée à certaines fonctions ; elle ne peut créer que des clés dans ses propres scopes |

- Supprimer un utilisateur révoque toutes ses clés.
- Les routes d'administration (utilisateurs, domaines, sites web, SFTP, services, réseaux, audit) exigent toujours le profil admin, quels que soient les scopes.
- Liste complète des scopes : [scopes des clés API](../reference/scopes.md).

## Le conteneur de l'API est protégé

Personne, admin compris, ne peut ouvrir un shell dans le conteneur de l'API, y copier ou en extraire des fichiers, suivre ses fichiers, ni le cibler avec une tâche planifiée `exec`. Ces opérations donneraient accès à l'audit trail. Les actions sur les stacks l'ignorent aussi.

## Les réseaux privés ne sont pas un bac à sable

Les [réseaux privés](./networks.md) séparent les sites et les instances de services du panel les uns des autres. Ce ne sont **pas** un contrôle d'accès face aux stacks de CI ou à quiconque a accès au socket Docker : n'importe quel conteneur peut rejoindre un réseau par son nom. Le panel affiche les conteneurs qu'il ne gère pas sur ses réseaux, pour que vous puissiez les déconnecter.

## Bon à savoir

- N'attribuez aux utilisateurs restreints que les conteneurs nécessaires : un shell dans un conteneur donne accès à tout ce que ce conteneur peut atteindre.
- Surveillez les entrées `access denied` dans l'[audit trail](./audit.md).
- Les services managés (ports publiés, TLS) ont leurs propres règles : voir [Services managés](./services.md).
- Pour signaler une vulnérabilité, contactez les mainteneurs en privé, pas dans un ticket public.
