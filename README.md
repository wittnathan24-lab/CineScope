# CineScope

Application de découverte et de suivi de films, réalisée avec React, TypeScript, Vite et Tailwind CSS. Les informations et affiches proviennent de TMDB, en français.

## Démarrage

Prérequis : Node.js 22.12+ (ou une version LTS plus récente) et npm.

```sh
npm ci
cp .env.example .env.local
# Renseigner VITE_TMDB_ACCESS_TOKEN dans .env.local
npm run dev
```

Sous PowerShell, remplacer `cp` par `Copy-Item` si nécessaire. Un fichier `.env.local` existant doit être conservé : ne pas l'écraser.

Le jeton « API Read Access Token » est disponible dans les paramètres API de votre compte TMDB : https://www.themoviedb.org/settings/api. Il est envoyé à TMDB dans l'en-tête Authorization. Une variable VITE_* est intégrée au code du navigateur : utiliser uniquement un jeton de lecture TMDB, jamais un secret de compte. Ne pas versionner `.env.local`.

## Fonctionnalités

- Accueil, catalogue, détails, recherche, favoris, bibliothèque, profil et page 404.
- Catalogue TMDB : populaires, mieux notés et films au cinéma ; pagination jusqu'à la limite de 500 pages de l'API.
- Recherche avec URL partageable, pagination et réinitialisation vers les films populaires.
- Filtre par note minimale et tri par note ou année sur la page de résultats chargée.
- Fiche complète : synopsis, date, durée, genres, votes, langue, pays, distribution.
- Favoris indépendants de la page du catalogue, ajout et retrait depuis toute carte ou fiche.
- Bibliothèque : À regarder, En cours, Vu ; déplacement dans les deux sens et retrait.
- Choix aléatoire du film du soir parmi les films À regarder.
- Notes personnelles de 1 à 5 étoiles, enregistrées par film.
- Profil contrôlé, validation champ par champ, statistiques personnelles et export JSON.
- Persistance locale du profil, des favoris, de la bibliothèque et des notes.
- Images de remplacement, requêtes annulées à la navigation, erreurs avec nouvelle tentative et Error Boundary.
- Interface responsive, navigation clavier, focus visibles et respect de la réduction des animations.

Les données sont propres au navigateur et à l'origine du site. Il n'y a pas d'authentification ni de synchronisation entre appareils. L'export constitue une copie lisible ; l'import automatique n'est pas implémenté. En cas d'indisponibilité de TMDB, les pages personnelles restent utilisables.

## Architecture

| Dossier          | Responsabilité                                                     |
| ---------------- | ------------------------------------------------------------------ |
| `src/components` | Navigation, cartes, images, messages, pagination et Error Boundary |
| `src/pages`      | Catalogue/recherche, fiche, collections, profil                    |
| `src/hooks`      | Chargement asynchrone, annulation, états et nouvelle tentative     |
| `src/context`    | Context, reducer typé, validation et persistance des données       |
| `src/services`   | Communication et adaptation des réponses TMDB                      |
| `src/types`      | Modèles partagés                                                   |
| `src/test`       | Tests de comportement avec Vitest et Testing Library               |

Le reducer conserve le film complet avec chaque favori : contrairement à une liste d'identifiants filtrée sur la page courante, un favori provenant d'une recherche reste affichable après navigation ou rechargement.

Les fiches, les collections et le profil sont chargés à la demande avec `React.lazy`. Cela évite de charger leurs formulaires et interfaces sur l'accueil. Aucun mémo artificiel n'est ajouté ; un audit au React Profiler reste à effectuer pour documenter des rendus inutiles avant une optimisation supplémentaire.

## Vérifications

```sh
npm test
npm run lint
npm run build
npm run preview
npm run format
```

Les tests utilisent des réponses TMDB simulées ; aucun jeton réel n'est nécessaire. Ils couvrent les cartes, favoris multiples, bibliothèque et statuts, persistance, profil, recherche/réinitialisation, pagination, nouvelle tentative, 404 et images cassées. Le catalogue réel a également été ouvert dans la version de production locale.

Sur cet environnement Windows, le bac à sable peut empêcher Vite de lancer ses processus (`spawn EPERM`). Exécuter les mêmes commandes dans un terminal local autorisé résout cette restriction de l'environnement.

## Production et déploiement

`npm run build` produit le dossier `dist`. `npm run preview` sert cette version localement (par défaut port 4173). Le déploiement doit construire avec `npm ci && npm run build`, publier `dist` et définir `VITE_TMDB_ACCESS_TOKEN` avant la compilation.

Le fichier `public/_redirects` prévoit le repli des routes vers `index.html` pour les hébergeurs compatibles. Sur un autre hébergement, configurer la même réécriture pour `/movies/:id`, `/profile`, etc., sans rediriger les fichiers statiques existants.

**Application non déployée.** Le dépôt GitHub contient les sources ; pour utiliser l’application, suivre les instructions de démarrage ci-dessus.

## Références

- API : https://developer.themoviedb.org/reference/movie-popular-list
- Installation Tailwind/Vite : https://tailwindcss.com/docs/installation/using-vite

This product uses the TMDB API but is not endorsed or certified by TMDB. Les affiches et données restent la propriété de leurs ayants droit.
