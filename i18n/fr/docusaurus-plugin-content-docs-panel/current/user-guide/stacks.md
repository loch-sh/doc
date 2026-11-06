---
sidebar_position: 3
title: Actions sur une stack
description: Démarrez, arrêtez ou relancez tous les conteneurs d'une stack compose en un clic.
---

# Actions sur une stack

Une stack est un groupe de conteneurs lancés par le même projet compose. Vous pouvez la démarrer, l'arrêter ou la relancer depuis sa ligne sur la page **Conteneurs**.

<Screenshot id="stack-actions" alt="Une ligne de stack avec les boutons Arrêter, Démarrer et Redémarrer la stack" />

## Agir sur une stack

1. Ouvrez **Conteneurs** et trouvez la ligne de la stack.
2. Dans la colonne **Actions**, cliquez sur un bouton :

| Bouton | Affiché quand | Confirmation |
|---|---|---|
| **Démarrer la stack** | Au moins un conteneur ne tourne pas | Non |
| **Arrêter la stack** | Au moins un conteneur tourne | Oui |
| **Relancer la stack** | Au moins un conteneur tourne | Oui : ses services sont brièvement indisponibles |

Un message confirme le résultat. Si des conteneurs échouent, il indique combien : par exemple **2 conteneur(s) sur 5 n'ont pas pu être traités**.

## Fonctionnement

- Les conteneurs démarrent dans l'ordre des dépendances (`depends_on`) et s'arrêtent dans l'ordre inverse. Les conteneurs d'un même niveau sont traités en parallèle.
- **Démarrer** ignore les conteneurs déjà démarrés ; **Arrêter** ignore ceux déjà arrêtés.
- Un échec n'arrête pas le traitement des autres conteneurs.
- Avec un profil utilisateur, seuls les conteneurs qui vous sont attribués sont traités.

## Bon à savoir

- Les conteneurs sous **Sans stack** n'ont pas de projet compose : agissez sur eux un par un.
- Les conteneurs système et le conteneur de l'API du panel ne sont jamais traités.
- Dans la CLI : `loch stack start`, `loch stack stop` ou `loch stack restart`, avec le nom de la stack ou le namespace actif. Voir la [CLI `loch`](/cli/).
