# ADR-001 — Garder les données personnelles dans le navigateur

- **Statut :** accepté
- **Date :** 8 octobre 2026
- **Contexte :** projet étudiant CineScope

## Contexte

CineScope permet d’enregistrer des favoris, une bibliothèque de films, des notes et quelques informations de profil. Le projet est une application front-end React : il n’a pas de serveur applicatif ni de système de connexion. Je voulais que ces fonctions marchent dès le premier lancement sans devoir mettre en place une infrastructure supplémentaire.

Il fallait aussi éviter de confondre les données personnelles de l’utilisateur avec le catalogue TMDB, qui est chargé à la demande et peut être indisponible.

## Options envisagées

### Option A — Sauvegarder dans le navigateur

Enregistrer l’état dans `localStorage`, sur l’origine du site, et valider les données au chargement.

### Option B — Ajouter un serveur et une base de données

Créer une API avec comptes, authentification et stockage distant pour rattacher les données à une personne.

## Décision

Je retiens l’option A. Le reducer de `src/context/store.ts` décrit les changements d’état ; `src/context/CollectionContext.tsx` partage cet état dans l’application et l’écrit sous la clé `cinescope-v1`. Au démarrage, `loadState` vérifie sa forme et revient à l’état initial si la sauvegarde est absente ou invalide.

## Pourquoi ce choix

Pour le périmètre actuel, les collections sont personnelles et n’ont pas besoin d’être partagées entre appareils. `localStorage` permet de rendre les favoris et la bibliothèque utilisables sans compte, sans serveur et sans déploiement supplémentaire. Cela garde le projet plus facile à installer et à expliquer.

## Avantages

- mise en place courte, adaptée à un projet front-end ;
- données disponibles hors ligne après leur enregistrement ;
- aucune inscription demandée ;
- comportement de la sauvegarde concentré dans le contexte et le reducer.

## Limites

- les données restent sur le navigateur et l’origine d’origine ;
- aucun partage ou synchronisation entre appareils ;
- vider les données du navigateur peut supprimer la sauvegarde ;
- le profil est stocké localement sans compte ; il ne faut pas y mettre d’information sensible ;
- l’export JSON existe, mais l’import automatique n’est pas implémenté.

## Conséquences

Les pages personnelles doivent rester utilisables même si TMDB est indisponible. Toute évolution du format stocké doit rester compatible ou prévoir une migration depuis `cinescope-v1`. La documentation doit expliquer la portée locale de la sauvegarde et ses limites.

## Condition de réexamen

Je réexaminerai cette décision si CineScope doit proposer une connexion, synchroniser les données entre appareils, partager des collections ou restaurer les données depuis un autre navigateur. Dans ce cas, il faudra comparer les options de serveur, d’authentification et de protection des données avant d’implémenter la synchronisation.
