---
sidebar_position: 1
title: Sites web
description: Activez le module Hosting, puis créez, modifiez, redéployez et supprimez des sites PHP ou statiques servis par Traefik.
---

# Sites web

Le module Hosting permet à un admin de créer un site web sans écrire de fichier compose. Chaque site est un projet Docker Compose standard généré par le panel : il démarre avec `docker compose up -d` même si le panel est arrêté.

:::note
Réservé aux admins. Nécessite `HOSTING_ENABLED=true` et un Traefik en fonctionnement.
:::

## Activer le module

Ajoutez ces variables au `.env` de l'API, puis redémarrez l'API :

| Variable | Rôle | Défaut |
|---|---|---|
| `HOSTING_ENABLED` | Active le module | `false` |
| `HOSTING_TRAEFIK_NETWORK` | Réseau Docker externe partagé avec Traefik | obligatoire |
| `HOSTING_STACKS_DIRECTORY` | Emplacement des projets compose | `/data/compose` |
| `HOSTING_SITES_DIRECTORY` | Emplacement des fichiers des sites (en général le répertoire SFTP) | `/data/websites/hosted` |

Les deux répertoires doivent exister, être accessibles en écriture et montés **au même chemin** dans le conteneur de l'API (`-v /data/compose:/data/compose`). Sinon, l'API refuse de démarrer. Le réseau Traefik n'est pas vérifié au démarrage : s'il manque, les déploiements échouent.

Points d'entrée Traefik, résolveur de certificats et limites de ressources : voir la [référence de configuration](../reference/configuration.md).

## La liste des sites

**Hébergement → Sites** liste chaque site avec son **Modèle**, sa version de **PHP**, ses **Domaines** et son **Statut**.

| Statut | Sens |
|---|---|
| **En marche** | Tous les conteneurs tournent. Le compteur affiche `(en marche/total)` |
| **Partiellement en marche** | Certains conteneurs sont arrêtés |
| **Arrêtée** | Aucun conteneur ne tourne |
| **Non déployée** | Le site existe, pas ses conteneurs |

Un site peut aussi porter le badge **Dernière opération en échec** ou **Modifiée manuellement** (son fichier compose a été modifié à la main). Les actions de la ligne sont **Démarrer**, **Redémarrer**, **Arrêter**, **Redéployer** et **Détails**.

<Screenshot id="hosting-list" alt="La page Hébergement avec les sites, leur modèle, leur version de PHP, leurs domaines et leur statut" />

## Créer un site

1. Ouvrez **Hébergement → Sites** et cliquez sur **Nouvel hébergement**.
2. Suivez les étapes :

   | Étape | Ce que vous choisissez |
   |---|---|
   | **Type** | Le modèle (tableau ci-dessous) |
   | **Site** | **Nom**, **Répertoire du site** (nouveau, ou existant et partagé avec des utilisateurs SFTP), **Racine web**, **Domaines**, **HTTPS**, **Rediriger HTTP vers HTTPS** |
   | **PHP et ressources** | **Version de PHP**, limites de mémoire et de CPU, réglages `php.ini`, **Modules PHP** |
   | **Avancé** | Routage (Symfony, Laravel ou règles personnalisées), **Variables d'environnement**, directives `php.ini` et virtual host supplémentaires, **Réseaux** |
   | **Récapitulatif** | Vérifiez, puis **Créer l'hébergement** |

3. Suivez le déploiement dans l'onglet **Dernière opération** du site.

<Screenshot id="hosting-create-type" alt="La page Nouvel hébergement à l'étape Type avec les quatre modèles" />

```bash
loch hosting create blog --template php-nginx --php 8.4 --domain blog.example.com --https --redirect-https
```

Toutes les options : [guide CLI Hosting](/cli/guides/hosting/).

### Modèles

| Modèle | Libellé | Pour |
|---|---|---|
| `php-nginx` | **PHP + Nginx** | La plupart des applications PHP (WordPress, Laravel, Symfony) |
| `php-apache` | **PHP + Apache** | Les applications qui reposent sur `.htaccess` |
| `nginx` | **Statique (Nginx)** | Sites HTML, applications monopages |
| `apache` | **Statique (Apache)** | Fichiers statiques avec prise en charge de `.htaccess` |

Les modèles utilisent les images webdevops. Versions de PHP : 8.5, 8.4, 8.3, 8.2, 8.1, 8.0, 7.4 (chacune aussi en `-alpine`) et 5.6. **8.4** est présélectionnée. Une version dont le support de sécurité est terminé porte le badge **Obsolète**.

### Domaines et HTTPS

Traefik route les domaines vers le site. N'activez **HTTPS** qu'une fois le DNS de chaque domaine pointé vers le serveur : sinon le certificat ne peut pas être émis.

### Limites

| Réglage | Règle |
|---|---|
| Nom | Lettres minuscules, chiffres, tirets, 32 caractères au plus. Non modifiable ensuite |
| Domaines | 20 au plus |
| Variables d'environnement | 100 au plus. Les variables gérées par le panel (`PHP_*`, `WEB_DOCUMENT_ROOT`, `APPLICATION_*`, `CONTAINER_*`, `LD_*`) sont refusées |
| Limite de mémoire | Désactivée (illimitée), ou de 64 Mo à `HOSTING_MAX_MEMORY_MB` |
| Limite de CPU | Désactivée (illimitée), ou de 0,1 à `HOSTING_MAX_CPUS` |
| Réseaux | 16 au plus |

Quand le conteneur atteint sa limite de mémoire, Docker le tue : laissez la limite désactivée sauf besoin réel de plafonner.

### Réseaux privés

Un site atteint les services managés par les réseaux qu'il rejoint (par exemple `svc-postgres-17`). Quand le module services est activé, le réseau partagé `services` est présélectionné. Voir [Réseaux privés](../network/private-networks.md).

## La page d'un site

Cliquez sur **Détails** sur un site. La page a cinq onglets :

| Onglet | Contenu |
|---|---|
| **Vue d'ensemble** | Les réglages (modèle, image, PHP, routage, répertoire, domaines, HTTPS, réseaux, ressources) ; **Consommation** : CPU, mémoire, réseau et processus en direct, par conteneur ; **Conteneurs** : actions, et **Détail conteneur** avec les logs en temps réel, le téléchargement du fichier de logs et un terminal Docker interactif |
| **Paramètres** | Le formulaire de création, avec **Enregistrer et redéployer** |
| **Réseaux** | **Réseaux du panel** : **Connecter un réseau** ou en déconnecter un (le site redémarre) ; **Autres réseaux Docker**, en lecture seule |
| **Compose** | Le `compose.yaml` généré, en lecture seule, et les **Règles de routage** utilisées par le serveur web |
| **Dernière opération** | Type, état, durée et sortie Docker Compose du dernier déploiement |

## Modifier un site

1. Ouvrez le site, onglet **Paramètres**.
2. Modifiez les réglages, puis cliquez sur **Enregistrer et redéployer**.

Le répertoire du site et le nom ne peuvent pas être modifiés. Changer les réseaux redéploie le site (quelques secondes d'interruption).

```bash
loch hosting update blog --domain www.blog.example.com
```

## Redéployer, démarrer, arrêter

| Action | Effet |
|---|---|
| **Redéployer** | Recrée le conteneur à partir des réglages actuels. Cochez **Télécharger la dernière image** pour obtenir les correctifs PHP et serveur web |
| **Démarrer** / **Arrêter** / **Redémarrer** | Agit sur les conteneurs, sans modifier les fichiers |

```bash
loch hosting deploy blog --pull
```

## Supprimer un site

1. Cliquez sur **Supprimer** sur le site.
2. Cochez **Supprimer aussi les fichiers du site** uniquement si vous voulez aussi effacer les fichiers.
3. Saisissez le nom du site pour confirmer.

Les fichiers sont conservés par défaut. Leur suppression est refusée tant qu'un autre site utilise le même répertoire.

```bash
loch hosting delete blog --purge-data
```

:::warning
La suppression des fichiers du site est irréversible. Les utilisateurs SFTP de ce site perdent tous leurs fichiers.
:::

## En cas d'échec du déploiement

- **Modification** : les fichiers précédents sont restaurés et redéployés. L'onglet **Dernière opération** affiche **La configuration précédente a été restaurée.** et la sortie de Docker Compose.
- **Création** ou **Redéploiement** : rien à restaurer. Lisez la sortie dans **Dernière opération**, corrigez les réglages, puis enregistrez de nouveau.

<Screenshot id="hosting-last-operation-failed" alt="L'onglet Dernière opération d'une mise à jour échouée, avec le message de restauration et la sortie Docker Compose" />

## Bon à savoir

- Un fichier compose modifié à la main est marqué **Modifiée manuellement**. Enregistrer les réglages l'écrase alors (**Écraser les modifications manuelles**) ; un redéploiement ne l'exécute tel quel qu'après votre confirmation.
- Les conteneurs tournent sans port publié et avec `no-new-privileges`.
- Le module PHP ionCube est désactivé par défaut : il exécute du PHP chiffré et sert souvent aux logiciels malveillants.
- PHP en ligne de commande (crons) n'est jamais limité en temps ; `max_execution_time` ne s'applique qu'aux requêtes web.
- Le panel ne touche qu'aux répertoires `hosted-*` qu'il a générés : les stacks CI du même répertoire ne sont jamais modifiées.
