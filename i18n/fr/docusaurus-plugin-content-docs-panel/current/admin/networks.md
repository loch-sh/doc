---
sidebar_position: 7
title: Réseaux privés
description: Décidez quels sites atteignent quelles instances de services grâce à des réseaux Docker privés, attachez et détachez des membres.
---

# Réseaux privés

Un réseau privé décide quels sites atteignent quelles instances de services. Un site ne voit que les instances des réseaux qu'il rejoint.

:::note
Réservé aux admins, toujours disponible depuis **Réseau → Réseaux privés**. Le réseau partagé `services` existe quand le module services est activé.
:::

## Ce qu'est un réseau

- Un réseau Docker `bridge` standard, créé **interne** : pas d'accès Internet par ce réseau.
- Son nom Docker est `loch-net-<nom>`.
- Les membres se joignent par nom de conteneur (`svc-postgres-17`, `hosted-shop-web-1`).
- Les réseaux ne se routent pas entre eux. Un site sur deux réseaux parle aux deux, rien de plus.

Le fichier compose de chaque membre déclare ses réseaux, avec la commande `docker network create` dans son en-tête : une stack démarre même sans le panel.

## Le réseau `services`

Le réseau partagé du module services, listé en premier avec le badge **Partagé**.

- Les nouveaux sites le rejoignent par défaut, tout comme les instances créées sans réseau.
- Il ne peut pas être supprimé.
- ElasticMQ (sans authentification) y est refusé.

## Créer un réseau

1. Cliquez sur **Nouveau réseau**.
2. Remplissez :

   | Champ | Règle |
   |---|---|
   | **Nom** | 1 à 24 lettres minuscules, chiffres ou tirets, en commençant par une lettre. Non modifiable |
   | **Description** | Facultative, 200 caractères au plus, modifiable ensuite |
   | **Adressage** | **Automatique** (Docker choisit une plage libre) ou **Sous-réseau manuel** : une plage IPv4 privée (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `100.64.0.0/10`), de `/16` à `/28` |
   | **Membres** | Facultatif : sites et instances à attacher tout de suite |

3. Cliquez sur **Créer le réseau**.

<Screenshot id="networks-create" alt="La page Nouveau réseau privé avec le nom, l'adressage, les membres et le récapitulatif" />

```bash
loch networks create backend --subnet 10.20.0.0/24 --description "Shop"
```

Toutes les commandes : [guide CLI réseaux](/cli/guides/networks/).

### Règles de création

- Les noms `services`, `pub`, `default`, `host`, `none`, `bridge`, `traefik`, `config` et `docker` sont réservés.
- Au plus `NETWORKS_MAX` réseaux privés (50 par défaut ; `services` ne compte pas).
- Un sous-réseau qui chevauche un autre réseau Docker, ou une plage listée dans `NETWORKS_RESERVED_RANGES` (votre LAN, un VPN), est refusé.
- Le sous-réseau ne peut plus être modifié : créez un nouveau réseau et déplacez les membres.

Les pools d'adresses par défaut de Docker contiennent environ 31 réseaux pour tout l'hôte. Étendez `default-address-pools` dans `/etc/docker/daemon.json` avant de créer beaucoup de réseaux.

## Attacher et détacher des membres

Sur la page du réseau, cliquez sur **Attacher une ressource** et choisissez un site ou une instance de service. Pour en retirer un, cliquez sur **Détacher** sur sa ligne.

<Screenshot id="networks-detail" alt="La page d'un réseau privé avec un site et une instance, leur IPv4 et le bouton Attacher une ressource" />

```bash
loch networks attach backend --site shop
loch networks detach backend --instance postgres-17
```

Le **conteneur du membre est recréé** : quelques secondes d'interruption pour ce conteneur seulement.

| Membre | Comportement |
|---|---|
| Site | Redéployé comme lors d'une modification de ses réglages. Un site peut n'avoir aucun réseau |
| Instance | Redémarrée (jusqu'à quelques minutes). Une instance garde au moins un réseau |

Vous pouvez aussi changer les réseaux depuis les réglages du site (**Réseaux**) ou depuis la liste des instances (**Modifier les réseaux**).

## Supprimer un réseau

Cliquez sur **Supprimer**. Le réseau ne doit plus avoir de membre : détachez-les d'abord.

```bash
loch networks delete backend
```

## Bon à savoir

- Un réseau n'est **pas** une barrière contre la CI ou quiconque utilise le socket Docker : n'importe quel conteneur peut rejoindre un réseau par son nom. Ces conteneurs apparaissent comme **Non géré** ; cliquez sur **Déconnecter** pour les retirer.
- **Autres réseaux Docker** (onglet de la liste) affiche tous les autres réseaux de l'hôte, en lecture seule.
- Un réseau manquant est recréé au démarrage de l'API. Un réseau remplacé hors du panel est signalé et ses membres ne sont plus considérés comme fiables.
- Les sites sur un réseau du panel perdent `NET_RAW`.
- IPv4 uniquement. Le trafic circule en clair sauf si le moteur utilise TLS.
