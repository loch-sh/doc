---
sidebar_position: 1
sidebar_label: Vue d'ensemble
title: Services managés
description: Activez le module services, créez bases de données, caches, brokers et stockage objet pour vos sites, redimensionnez, mettez à jour et publiez-les.
---

# Services managés

Le module services fait tourner bases de données, caches, brokers de messages et stockage objet pour vos sites, chacun depuis son image Docker officielle. Vous recevez des identifiants ; le panel gère le moteur.

:::note
Réservé aux admins. Nécessite `SERVICES_ENABLED=true`.
:::

## Activer le module

Ajoutez les variables au `.env` de l'API, puis redémarrez l'API :

| Variable | Rôle | Défaut |
|---|---|---|
| `SERVICES_ENABLED` | Active le module | `false` |
| `SERVICES_DATA_DIRECTORY` | Données des instances, même chemin sur l'hôte et dans le conteneur de l'API | `/data/services` |
| `SERVICES_ENGINES` | Moteurs activés, séparés par des virgules (vide : tous) | tous |

Les fichiers compose vont dans `HOSTING_STACKS_DIRECTORY` : le module a besoin de ce répertoire même quand le module Hosting est désactivé. Autres variables (limites, publication, TLS, épinglage de versions) : [référence de configuration](../reference/configuration.md).

Chaque menu liste ses moteurs activés. Ce qui est propre à chaque moteur est sur sa page :

| Menu | Moteurs | Page |
|---|---|---|
| **Bases de données** | MySQL, MariaDB, PostgreSQL, MongoDB | [Bases de données](./databases.md) |
| **Cache** | Redis, Valkey | [Cache](./cache.md) |
| **Messagerie** | RabbitMQ, NATS | [Messagerie](./messaging.md) |
| **Files d'attente** | ElasticMQ, Eclipse Mosquitto | [Files d'attente](./queues.md) |
| **Stockage** | Loch S3 | [Stockage](./storage.md) |

## Instances partagées et dédiées

| Topologie | Moteurs | Une instance | Une ressource est |
|---|---|---|---|
| **Partagée** | PostgreSQL, MariaDB, MySQL, MongoDB, RabbitMQ | Par version du moteur (`svc-postgres-17`), utilisée par tous les sites | Une base (ou un hôte virtuel RabbitMQ) et son utilisateur |
| **Dédiée** | Redis, Valkey, NATS, ElasticMQ, Eclipse Mosquitto, Loch S3 | Par ressource (`svc-redis-cache`), nommée et dimensionnée à la création | L'instance elle-même |

- Une instance partagée démarre avec sa première ressource et est supprimée, **avec ses données**, à la suppression de sa dernière ressource.
- Une instance dédiée est supprimée avec ses données.

Moteurs, versions et options : [référence des moteurs de services](../reference/services-engines.md).

## La page d'un moteur

Ouvrez un moteur dans le menu. Tant qu'il n'a aucune ressource, une carte de présentation remplace le tableau. L'en-tête indique la date de la dernière vérification des versions, **Rechercher des mises à jour** et le bouton de création.

| Topologie | Une ligne par | Colonnes |
|---|---|---|
| Partagée | Version | **Version**, **État**, nombre de bases (ou d'hôtes virtuels), **Adresse interne**, **Réseaux**, **Port publié**, **Actions** |
| Dédiée | Instance | **Nom**, **Version**, **Taille**, **État**, **Adresse interne**, **Réseaux**, **Port publié**, **Actions** |

- Une ligne partagée se déplie sur ses ressources, avec **Nouveau mot de passe** et **Supprimer**. Une ressource créée hors du panel porte le badge **Non gérée** : elle ne peut pas être supprimée ici et maintient l'instance.
- Une ligne dédiée a **Mettre à jour**, **Modifier**, **Nouveau mot de passe** et **Supprimer**.
- La colonne **Version** affiche les dates de support et les badges **Mise à jour disponible** et **Modifiée à la main**.

<Screenshot id="databases-postgres" alt="La page PostgreSQL avec une instance partagée par version, ses bases, son adresse, ses réseaux et son port publié" />

## Créer une ressource

1. Ouvrez le moteur dans le menu (par exemple **Bases de données → PostgreSQL**) et cliquez sur **Nouvelle base** (**Nouvelle instance** pour un moteur dédié).
2. Choisissez la **Version**. Elle ne pourra plus être modifiée.
3. Pour un moteur dédié, remplissez **Taille et réglages**. **Personnalisé** accepte n'importe quelle taille dans une plage.
4. Dans **Accès réseau**, choisissez les réseaux (par défaut : `services`), puis saisissez le **Nom**.
5. Cliquez sur **Créer**.

<Screenshot id="services-create-redis" alt="La page de nouvelle instance Redis avec les cartes de version et de mémoire et le récapitulatif" />

```bash
loch services create shop --engine postgres --version 17
```

Toutes les options : [guide CLI services](/cli/guides/services/).

## Identifiants

Après la création, **Informations de connexion** affiche l'hôte, le port, l'utilisateur, le mot de passe et l'URI de connexion.

:::warning
Le mot de passe n'est affiché **qu'une fois**. Copiez-le avant de cliquer sur **J'ai copié le mot de passe**. En cas de perte, générez-en un nouveau.
:::

**Nouveau mot de passe** en génère un autre. L'ancien cesse de fonctionner immédiatement et les connexions ouvertes sont fermées ; une instance dédiée redémarre.

```bash
loch services reset-password postgres-17 shop
```

Le serveur MCP ne renvoie jamais de mot de passe : lancez `loch services reset-password` dans un terminal.

<Screenshot id="services-credentials" alt="La fenêtre Informations de connexion avec l'avertissement sur le mot de passe affiché une seule fois" />

## Redimensionner une instance dédiée

Cliquez sur **Modifier** sur l'instance, changez sa taille ou ses réglages, puis confirmez. Le conteneur est recréé : les clients sont déconnectés quelques secondes, les données sont conservées. S'il ne démarre pas, les réglages précédents sont restaurés. Les réglages marqués **Défini à la création** ne changent jamais.

```bash
loch services update redis-cache --option memory=1024
```

## Mettre à jour une instance dédiée

Le panel découvre les versions publiées toutes les 12 heures (ou cliquez sur **Rechercher des mises à jour**). Quand une instance affiche **Mise à jour disponible**, cliquez sur **Mettre à jour** et choisissez :

- la dernière image de sa version (même format de données), ou
- l'une des 3 versions plus récentes au plus.

L'image est téléchargée, puis l'instance est recréée. Si elle ne démarre pas, la version précédente est restaurée. Il n'y a jamais de retour à une version antérieure.

```bash
loch services upgrade redis-cache
```

:::warning
Aucune sauvegarde n'est faite avant un changement de version, et il n'y a pas de retour arrière. Sauvegardez d'abord les données.
:::

Les instances partagées ne sont pas mises à jour : créez les ressources sur une instance de la nouvelle version et déplacez les données.

## Publier un port

Par défaut, une instance est **Interne uniquement** : seuls les sites sur ses réseaux l'atteignent. Pour que des clients hors de Docker s'y connectent, cliquez sur **Configurer le port publié**, saisissez une adresse et un port, puis **Publier**. L'instance redémarre.

```bash
loch services expose postgres-17 127.0.0.1:5417
```

L'environnement du serveur fixe les adresses autorisées (`SERVICES_EXPOSE_ALLOWED_CIDRS`, par défaut `127.0.0.1`). Sur une adresse publique, TLS devient obligatoire pour tous les clients, sites compris. La publication exige le scope `services:expose` pour les clés d'API et n'est pas disponible via le serveur MCP.

## Supprimer

| Quoi | Comment |
|---|---|
| Une base ou un hôte virtuel | **Supprimer**, saisissez le nom. La dernière supprime aussi l'instance partagée et ses données |
| Une instance dédiée | **Supprimer**, saisissez le nom. Données supprimées |
| Une instance partagée vide | **Supprimer l'instance** |

```bash
loch services delete postgres-17 shop
```

La suppression est définitive.

## Bon à savoir

- Les mots de passe sont aléatoires (environ 190 bits), générés par le panel, jamais choisis par les utilisateurs et jamais stockés en clair (sauf le secret Loch S3, nécessaire à SigV4).
- ElasticMQ n'a **aucune authentification** : il est refusé sur le réseau partagé `services`. Placez-le sur un réseau privé partagé uniquement avec les sites autorisés.
- Une instance dont les fichiers ont été modifiés à la main est marquée **Modifiée à la main** et n'est jamais lancée par le panel. Restaurez les fichiers, ou supprimez-la avec ses données.
- Un réseau n'est pas une barrière contre quiconque peut utiliser le socket Docker ou déployer des stacks CI.
- Plus de détails : [Sécurité](../admin/security.md).
