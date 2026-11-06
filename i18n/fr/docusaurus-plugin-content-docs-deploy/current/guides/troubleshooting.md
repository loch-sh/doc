---
sidebar_position: 4
title: Dépannage
description: Corriger les erreurs Loch Deploy courantes dans les jobs GitLab CI - 400, 401, 403, 409, 5xx et échecs silencieux.
---

# Dépannage

Les réponses d'erreur sont en texte brut. Utilisez `curl --fail-with-body` pour que le job les affiche. L'administrateur trouve la raison précise de chaque refus dans le journal d'audit (`auth_error`, `authz_error`, `error`).

| Symptôme | Cause | Correction |
|---|---|---|
| Le job échoue sans message | `curl -f` masque le corps de la réponse | Utilisez `curl --fail-with-body` |
| `400` « token is missing the environment claim » | Le job n'a pas d'`environment:` | Ajoutez `environment:` à chaque job qui appelle le serveur |
| `400` avec une liste de violations | Le fichier compose ne respecte pas la politique | Corrigez chaque point : [règles compose](./compose-file.md) |
| `400` sur un bind mount « does not exist » ou qui n'est pas un répertoire | Le répertoire n'a pas été créé par `/directories` avant `/deploy` | Appelez `/directories` d'abord, puis montez exactement `<key>/<service>/<name>` |
| `401` | Jeton absent, expiré, vieux de plus de 10 minutes, ou mauvais `aud` | Vérifiez `id_tokens.aud` = `GITLAB_AUDIENCE` ; appelez le serveur tôt dans le job |
| `403` sur tous les appels | IP du runner absente de `ALLOWED_IPS`, ou projet hors de `ALLOWED_NAMESPACES` | Demandez à l'administrateur de l'ajouter |
| `403` sur `production` | Environnement de `PROTECTED_ENVS` depuis une branche non protégée, ou environnement explicitement non protégé dans GitLab | Lancez le job sur une branche ou un tag protégé |
| `403` sur `/exec` ou `DELETE /stack` | La stack n'a jamais été déployée par ce projet (ancienne stack non importée, déjà arrêtée) | Déployez d'abord, ou demandez à l'administrateur de [l'importer](./migrate-from-ssh.md) |
| `403` sur `/deploy`, clé détenue par un autre projet | Un autre projet possède la même clé de stack (les slugs perdent de l'information : `acme/shop-api` et `acme-shop/api` donnent la même clé) | Renommez l'environnement, ou demandez à l'administrateur de corriger le registre |
| `409` sur `/deploy` | Des conteneurs d'un ancien déploiement ont des bind mounts hors de l'arborescence | Lancez `DELETE /stack`, déplacez les données vers `<service>/<name>`, redéployez : [migration](./migrate-from-ssh.md) |
| `409` sur `/directories` | Un lien symbolique ou un fichier occupe la place d'un répertoire | Demandez à l'administrateur de le supprimer sur l'hôte |
| `422` sur `/exec` | La commande est sortie avec un code non nul | Lisez `stdout` et `stderr` dans la réponse |
| `500` sur `/deploy` | `pull` ou `up` a échoué, ou Docker n'a pas pu être inspecté | Lisez l'extrait dans le message ; relancer est sans risque |
| `503` | Le job a été annulé, ou attendait une autre opération sur la même stack | Relancez |
| `504` | Une étape docker a dépassé son délai (`pull` 7 min, `up` 7 min, `/exec` 5 min) | Vérifiez le registre et la taille de l'image ; relancez |

## Bon à savoir

- Un premier déploiement qui échoue pendant `up` laisse des conteneurs sans propriétaire : `DELETE /stack` est refusé tant qu'un déploiement de la stack n'a pas réussi.
- Déploiement, arrêt et arrêt automatique d'une même stack s'exécutent un par un ; une deuxième requête attend.
- Codes de statut par endpoint : [Référence de l'API](../reference/api.md).
