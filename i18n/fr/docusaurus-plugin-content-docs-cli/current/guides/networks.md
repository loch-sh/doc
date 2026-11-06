---
sidebar_position: 8
title: Réseaux privés
description: Créer des réseaux privés et choisir quels sites hébergés joignent quelles instances de services.
---

# Réseaux privés

`loch networks` (alias `loch net`) gère les réseaux Docker internes, sans accès à Internet, qui relient les sites hébergés et les instances de services. Un site ne joint que les instances de ses réseaux. Réservé aux admins. Côté panel : [Réseaux](/panel/admin/networks/).

`services` est le réseau partagé du module services. Il ne peut pas être supprimé. Un réseau privé isole un groupe, par exemple un site et sa file d'attente.

## Commandes

| Commande | Rôle |
|---|---|
| `loch networks ls` | Liste les réseaux (`--all` : aussi les autres réseaux Docker). |
| `loch networks show <nom>` | Affiche un réseau et ses membres. |
| `loch networks config` | Affiche les règles de création : limites, tailles de sous-réseau, plages réservées. |
| `loch networks docker [nom]` | Affiche les réseaux Docker que le panel n'a pas créés (lecture seule). |
| `loch networks create <nom>` | Crée un réseau privé (`--subnet`, `--description`). |
| `loch networks update <nom> --description <texte>` | Modifie la description. Le sous-réseau ne peut pas changer. |
| `loch networks delete <nom>` | Supprime un réseau sans membre. |
| `loch networks attach <réseau> --site <s>\|--instance <i>` | Connecte un site ou une instance. |
| `loch networks detach <réseau> --site <s>\|--instance <i>` | Déconnecte un site ou une instance. |
| `loch networks disconnect <réseau> <id-conteneur>` | Retire un conteneur que le panel ne gère pas. |

```bash
loch networks create shop --description "Boutique et sa file d'attente"
loch networks attach shop --site shop
loch networks attach shop --instance elasticmq-jobs
loch networks show shop
```

## Droits

| Commande | Scope | Admin |
|---|---|---|
| `ls`, `show`, `config`, `docker` | `networks:read` | Oui |
| `create`, `update`, `delete`, `attach`, `detach`, `disconnect` | `networks:write` | Oui |

## Bon à savoir

- Connecter ou déconnecter recrée le conteneur du membre : quelques secondes d'interruption pour lui seul. Un site est redéployé (`--no-wait` pour ne pas attendre).
- Une instance garde au moins un réseau.
- Noms : lettres minuscules, chiffres et tirets, commençant par une lettre, 24 caractères au plus.
- Le sous-réseau est facultatif. Il doit être une plage IPv4 privée de /16 à /28, hors des plages réservées affichées par `loch networks config`.
- Vous pouvez aussi choisir les réseaux à la création : `loch hosting create --network`, `loch services create --network` et `loch functions create --network`. Les réseaux d'une fonction se modifient avec `loch functions networks` : voir [Fonctions](./functions.md).
