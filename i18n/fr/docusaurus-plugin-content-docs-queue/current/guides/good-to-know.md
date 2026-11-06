---
sidebar_position: 5
title: Limites et dépannage
description: Ce qu'il faut savoir avant la production (état en mémoire, places abandonnées, rechargements) et comment résoudre les problèmes courants.
---

# Limites et dépannage

## Limites

- **État en mémoire.** La file est gardée en mémoire par chaque instance du middleware. Plusieurs réplicas de Traefik ne la partagent pas, et un redémarrage la vide. Un changement de la configuration dynamique peut aussi recréer le middleware avec une file vide : modifiez la configuration hors des pics de trafic.
- **Places abandonnées.** Un visiteur qui ferme la page d'attente garde sa place dans la file. À son tour, la place reste réservée jusqu'à la fin de `inactivityTimeoutSeconds`. La file avance plus lentement que sa taille ne le laisse penser quand beaucoup de visiteurs abandonnent.
- **Temps d'attente approximatif.** L'attente affichée est calculée d'après la position, pas mesurée sur les départs réels.
- **Cookie sans `Secure` derrière un proxy TLS.** Le cookie reçoit l'attribut `Secure` seulement quand la connexion TLS se termine sur Traefik.
- **URL de rechargement.** La page par défaut se recharge avec `<meta http-equiv="refresh" content="…;url=./">` et un script qui recharge le chemin courant sans sa chaîne de requête. Sur un chemin profond comme `/shop/item`, le meta refresh mène à `/shop/`. Modifiez le modèle si les visiteurs doivent revenir sur l'URL exacte.

## Dépannage

| Symptôme | Cause | Solution |
|---|---|---|
| Traefik refuse le middleware : `invalid QueueManager configuration` | Une valeur échoue aux [vérifications](../reference/configuration.md) | Corrigez la valeur indiquée dans le message |
| La page intégrée en anglais s'affiche au lieu de la vôtre | Modèle introuvable ou invalide | Vérifiez `queuePageFile` et le volume ; le journal indique `Could not load queue page template` |
| Textes vides sur la page d'attente | Langue absente du fichier de traductions, ou fichier introuvable | Ajoutez la langue, vérifiez `queueTranslationsFile` |
| Les modifications du modèle ou des traductions n'apparaissent pas | Les fichiers sont lus au démarrage | Redémarrez Traefik |
| JSON `{"error":"capacity overload"}` sans `detail` | [Limite de débit](./rate-limit.md) sur les requêtes sans cookie | Gardez les cookies, ou augmentez `rateLimitTimes` |
| Des visiteurs retournent dans la file en naviguant | `inactivityTimeoutSeconds` trop court, ou cookie expiré | Augmentez `inactivityTimeoutSeconds` ou `cookieMaxAgeSeconds` |

## Journaux

Le plugin écrit sur la sortie d'erreur standard de Traefik, ou dans `logFile`, avec le préfixe `[Loch-Queue]`. Passez `debug=true` pour voir chaque décision (client, position, entrées) pendant un dépannage, puis désactivez-le : il est très bavard.
