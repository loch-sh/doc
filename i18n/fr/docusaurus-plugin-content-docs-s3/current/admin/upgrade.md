---
sidebar_position: 5
title: Passer à la 1.4.1
description: Mettre à jour un serveur Loch S3 en 1.4.1 et vérifier les changements de comportement qui peuvent toucher les clients et les buckets existants.
---

# Passer à la 1.4.1

La 1.4.1 est une version de sécurité. Certains correctifs changent le comportement du serveur : vérifiez-les avant la mise à jour.

## Mettre à jour

1. [Sauvegardez](./backup.md) le répertoire de données, le fichier des utilisateurs et la clé maître.
2. Vérifiez les changements ci-dessous.
3. Passez le tag de l'image à `ghcr.io/loch-sh/s3:1.4.1` et redémarrez :

   ```bash
   docker compose pull s3 && docker compose up -d s3
   ```

## Changements de comportement

| Changement | Effet | Que faire |
|---|---|---|
| Les politiques avec `Condition`, `NotAction`, `NotResource`, `NotPrincipal` ou une action invalide sont refusées | Une politique enregistrée par une version précédente avec ces champs ne s'applique plus : le bucket devient privé (root et propriétaire uniquement) | Avant la mise à jour, lisez chaque politique avec `get-bucket-policy` et réécrivez-la sans ces champs |
| Le `Deny` explicite l'emporte sur les ACL | Une ACL `public-read` n'ouvre plus les objets qu'une politique refuse | Rien, sauf si vous comptiez sur ce comportement |
| Les envois lents sont coupés | Un envoi sous 4096 octets/s sur 60 secondes échoue avec `RequestTimeout` | Pour les liaisons lentes, baissez `S3_MIN_UPLOAD_RATE` ou mettez-le à `0` |
| Le quota compte les fichiers de métadonnées et les ACL | L'utilisation affichée augmente légèrement | Vérifiez la marge sous `S3_MAX_STORAGE_BYTES` |
| Les clés non canoniques sont refusées | Les clés avec un segment `.`, `..` ou vide (`a//b`, `./x`) échouent en `400` | Les objets écrits auparavant sous ces clés restent accessibles par leur clé normalisée (`a/b`, `x`) |
| Signatures plus strictes | `host` et chaque en-tête `x-amz-*` doivent être signés ; le corps doit correspondre au hash signé | Les SDK standards s'y conforment. Vérifiez les clients faits maison |

Nouvelles variables : `S3_MIN_UPLOAD_RATE` et `S3_MAX_CONNECTIONS`. Voir [Référence de configuration](../reference/configuration.md).

## Bon à savoir

- Mise à jour depuis la 1.2 ou antérieure : un crash pouvait laisser des fichiers `{name}.{uuid}.tmp` à côté des objets. Ils apparaissent désormais comme des objets ordinaires : supprimez-les comme n'importe quel objet.
