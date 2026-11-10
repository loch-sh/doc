---
sidebar_position: 3
title: Cache
description: Créez des instances Redis et Valkey dédiées, choisissez leur mémoire, leur politique d'éviction, leur persistance, les scripts Lua et les modules Redis.
---

# Cache

Le menu **Cache** propose **Redis** et **Valkey**, deux bases clé-valeur en mémoire utilisées pour le cache, les sessions, les files et les compteurs. Chaque instance tourne dans son propre conteneur, avec un utilisateur.

:::note
Réservé aux admins. Nécessite le [module services](./overview.md).
:::

## Créer une instance

1. Ouvrez **Cache → Redis** (ou **Valkey**), puis cliquez sur **Nouvelle instance**.
2. Choisissez la **Version**, puis les réglages dans **Taille et réglages** (tableau ci-dessous).
3. Choisissez les **Réseaux** et saisissez le **Nom** : lettres minuscules et chiffres, en commençant par une lettre, 24 caractères au plus. Il devient l'utilisateur, et le nom d'hôte est `svc-redis-<nom>` (ou `svc-valkey-<nom>`).
4. Cliquez sur **Créer**, puis copiez le mot de passe dans **Informations de connexion**.

<Screenshot id="services-create-redis" alt="La page de nouvelle instance Redis avec les cartes de version et de mémoire et le récapitulatif" />

```bash
loch services create cache --engine redis --version 8.4 --option memory=512 --option policy=allkeys-lru
```

## Réglages

| Réglage | Valeurs | Défaut | Modifiable |
|---|---|---|---|
| **Mémoire** | 128 Mo à 4 Go, ou **Personnalisé** jusqu'à 64 Go. Les données en ont la moitié | 256 Mo | Oui |
| **Quand la mémoire est pleine** | **Refuser les écritures**, ou retirer des clés (les moins récentes, les moins utilisées, les clés expirables) | **Refuser les écritures** | Oui |
| **Persistance** | **Journal (AOF)** : au plus une seconde perdue ; **Instantanés** : les écritures depuis le dernier peuvent être perdues ; **Aucune** : perdues à chaque redémarrage | **Journal (AOF)** | Non |
| **Scripts Lua** | **Autorisés** ou **Désactivés** (`EVAL` et fonctions) | **Autorisés** | Oui |
| **Modules Redis** | JSON, recherche, séries temporelles, filtres de Bloom (Redis 8 et suivants uniquement) | **Désactivés** | Oui |

Pour un cache pur, choisissez **Retirer les moins récentes**. Gardez **Refuser les écritures** quand les données ne doivent pas disparaître (sessions, files).

**Modifier** change les réglages modifiables : l'instance redémarre, les données sont conservées. Noms des options pour la CLI : [moteurs de services](../reference/services-engines.md#options-des-moteurs-dédiés).

## Informations de connexion

**Hôte** (`svc-redis-<nom>`, `svc-valkey-<nom>`), **Port** (6379), **Utilisateur**, **Mot de passe** et **URI de connexion**.

## Bon à savoir

- Les scripts Lua et les modules Redis élargissent la surface d'attaque : désactivez-les si aucune bibliothèque n'en a besoin.
- Mise à jour, redimensionnement, port publié et suppression : [services managés](./overview.md).
