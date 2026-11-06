---
sidebar_position: 1
title: Configuration et durcissement
description: Définir les variables essentielles de Loch Deploy et vérifier les onze hypothèses de déploiement dont dépend le modèle de sécurité.
---

# Configuration et durcissement

Tous les réglages sont des variables d'environnement. Il n'y a pas de fichier de configuration. Une valeur invalide arrête le serveur au démarrage avec le code `1`.

## Variables essentielles

| Variable | Exemple | Pourquoi |
|---|---|---|
| `GITLAB_ISSUER` | `https://gitlab.example.com` | Obligatoire. Le serveur y récupère les clés des jetons, en HTTPS uniquement |
| `GITLAB_AUDIENCE` | `https://deploy.example.com` | Obligatoire. Doit être égale à `aud` dans les `id_tokens` des jobs |
| `ALLOWED_NAMESPACES` | `apps/atmosphere,infra` | Seuls ces groupes et leurs sous-groupes peuvent déployer. Vide = tous les projets de l'instance |
| `ALLOWED_IPS` | IP de sortie des runners CI | Les autres clients reçoivent `403`. Vide = désactivé |
| `TRUSTED_PROXIES` | `172.31.250.2` | IP exacte de Traefik, pour lire l'IP du client dans `X-Forwarded-For` |
| `FORBIDDEN_TRAEFIK_HOSTS` | `deploy.example.com,gitlab.example.com` | Hôtes qu'aucune stack ne peut router |
| `ALLOWED_EXTERNAL_NETWORKS` | `web` | Seul réseau externe que les stacks peuvent rejoindre |
| `PROTECTED_ENVS` | `production` (défaut) | Ces environnements exigent une branche ou un tag protégé |

Toutes les variables, valeurs par défaut et validations : [Référence de configuration](../reference/configuration.md).

## Liste de contrôle de durcissement {#hardening-checklist}

Ce sont des conditions préalables du modèle de sécurité, pas des recommandations.

1. **GitLab privé.** Quiconque peut lancer un pipeline sous un namespace autorisé peut déployer des conteneurs sur l'hôte. Avec l'inscription ouverte, chaque utilisateur possède un namespace.
2. **`ALLOWED_NAMESPACES` est défini.** Vide, il accepte tous les projets de l'instance (un avertissement est journalisé au démarrage).
3. **Les anciennes stacks sont importées** avec `-import-registry` avant que les pipelines puissent appeler le serveur. Sinon le premier déploiement qui atteint une clé libre en prend le contrôle. Voir [Migrer depuis un déploiement SSH](../guides/migrate-from-ssh.md).
4. **Les anciens conteneurs sont visibles ou supprimés.** Le serveur ne trouve que les conteneurs labellisés `com.docker.compose.project=<key>` ou nommés `<key>-…` / `<key>_…`. Arrêtez les autres à la main avant le premier déploiement de la stack.
5. **Seul le reverse proxy atteint le serveur.** `:8080` n'est jamais publié, et deploy-server n'est sur aucun réseau que les stacks peuvent rejoindre.
6. **Traefik est isolé des stacks.** Les stacks ne l'atteignent que par `ALLOWED_EXTERNAL_NETWORKS`. La route du serveur est dans le file provider, sur `:8443`, vers une IP fixe ; Traefik passe par un proxy de socket, `exposedByDefault=false`, sans dashboard ni API. Filtrez `:8443` sur les runners CI.
7. **`TRUSTED_PROXIES` est exact.** Uniquement l'adresse du proxy, jamais un pool Docker comme `172.16.0.0/12` : tout pair de cette plage peut falsifier l'IP du client.
8. **`ALLOWED_IPS` est défini** avec les adresses de sortie des runners CI. Il limite qui peut rejouer un jeton divulgué.
9. **L'environnement du serveur est minimal.** Seulement les variables de la référence de configuration, plus `PATH`. Aucun secret : l'interpolation compose peut en copier n'importe lequel dans un conteneur.
10. **Les chemins de l'hôte et du conteneur sont identiques** pour `COMPOSE_BASE` et `WEBSITES_BASE`.
11. **Les niveaux intermédiaires de `WEBSITES_BASE` appartiennent à root.** `WEBSITES_BASE`, `<key>/` et `<key>/<service>/` sont en `root:root 0755`, modifiables par aucun autre utilisateur, et pas sur un système de fichiers partagé ou réseau.

:::warning
- Ne mettez jamais `deploy-internal` ou `socket-proxy` dans `ALLOWED_EXTERNAL_NETWORKS` : une stack pourrait alors atteindre directement le serveur, ou l'API Docker.
- N'élargissez jamais `TRUSTED_PROXIES` à une plage réseau.
- Ne mettez jamais de secret dans l'environnement du serveur.
:::

## Registres privés

Montez un `config.json` docker en lecture seule sur `/root/.docker/config.json`. Compose transmet ces identifiants au démon : toutes les stacks peuvent alors tirer ce à quoi ils donnent accès.

Ensuite : [Modèle de sécurité](./security.md).
