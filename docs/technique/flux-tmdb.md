# Documentation technique — Du catalogue à l’écran

## Rôle et périmètre

Cette page suit un exemple de chargement du catalogue : comment CineScope demande une liste de films à TMDB et la transforme en données affichées par la page Catalogue. Elle couvre les listes et la recherche, pas la sauvegarde des favoris ou les détails complets d’un film.

## Avant de lire ou d’utiliser ce parcours

Il faut connaître les bases de TypeScript/React, disposer de Node.js et npm, et configurer `VITE_TMDB_ACCESS_TOKEN` dans `.env.local` pour que la vraie API réponde. Le jeton de lecture est intégré au code client par Vite : il est visible par les personnes qui utilisent l’application. Il ne doit jamais être un secret ni être commité.

Démarrage :

```sh
npm ci
# Créer .env.local depuis .env.example et y renseigner le jeton
npm run dev
```

## Le trajet d’une requête

1. `src/pages/Catalogue.tsx` choisit la page, la catégorie ou le texte recherché et appelle `useMovies`.
2. `src/hooks/useTmdb.ts` construit une clé à partir de ces paramètres. Son effet lance la requête avec un `AbortController` ; si les paramètres changent ou si la page est quittée, la requête précédente est annulée. La fonction `retry` permet un nouvel essai.
3. `src/services/tmdb.ts` lit `VITE_TMDB_ACCESS_TOKEN` et envoie une requête à `https://api.themoviedb.org/3`. Elle demande les données en français (`language=fr-FR`) et utilise la région française pour les catégories. Le jeton part dans l’en-tête `Authorization`.
4. Le service convertit les résultats TMDB vers le type commun `Film` (`id`, `title`, `poster`, `year`, `rating`) et borne le nombre de pages à 500.
5. `Catalogue` affiche les films avec `src/components/FilmCard.tsx`. Cette carte peut aussi déclencher l’ajout ou le retrait d’un favori via le contexte de collection.

Les fiches détaillées suivent le même service (`getMovie`), mais chargent la fiche et les crédits. La recherche utilise `/search/movie`; une liste utilise `/movie/{category}`.

## Exemple concret : chercher « Interstellar »

Dans l’application, ouvrir la recherche, saisir `Interstellar`, puis lancer la recherche. La page passe le texte au hook, qui appelle `getMovies` avec les valeurs courantes. Le service encode le texte pour l’URL et demande une réponse française. La réponse TMDB est ramenée à une liste de `Film`, puis rendue sous forme de cartes. La sélection d’une page suivante relance le même parcours avec `page=2`.

Exemple indicatif d’URL côté TMDB :

```text
https://api.themoviedb.org/3/search/movie?query=Interstellar&include_adult=false&language=fr-FR&page=1
```

Le jeton n’apparaît pas dans l’URL : il est envoyé dans l’en-tête de la requête.

## Paramètres et fichiers utiles

| Élément | Où le modifier | Effet |
| --- | --- | --- |
| Jeton TMDB | `.env.local`, variable `VITE_TMDB_ACCESS_TOKEN` | Autorise les appels au catalogue |
| Catégorie, recherche et page | `src/pages/Catalogue.tsx` | Choisit les paramètres envoyés au hook |
| URL, langue et région | `src/services/tmdb.ts` | Règle les appels API et la conversion des réponses |
| Chargement et nouvelle tentative | `src/hooks/useTmdb.ts` | Gère états, annulation et reprise |
| Carte affichée | `src/components/FilmCard.tsx` | Présente un film et ses actions |
| Forme des données | `src/types/movie.ts` | Définit `Film` et les autres types partagés |

Pour un comportement général d’affichage, modifier le composant ou la page concernée. Pour un nouveau champ renvoyé par TMDB, mettre à jour à la fois le type, le mapping du service et son affichage.

## Vérifier le résultat

Avec un jeton valide et une connexion Internet, le catalogue doit afficher des cartes. Une recherche sans correspondance doit afficher l’état vide ; une erreur doit permettre de réessayer. Les tests automatisés simulent TMDB et ne nécessitent pas de vrai jeton :

```sh
npm test
npm run lint
npm run build
```

## Problèmes courants

- **Message demandant de configurer le jeton :** vérifier le nom exact `VITE_TMDB_ACCESS_TOKEN`, la valeur dans `.env.local`, puis redémarrer Vite après une modification.
- **Erreur réseau ou données absentes :** vérifier la connexion, le jeton et l’état du service TMDB ; réessayer depuis l’interface.
- **Affiche manquante :** TMDB peut ne pas fournir de chemin d’image. Le composant d’affiche prévoit un remplacement.
- **Une ancienne recherche semble encore active :** la page peut afficher l’état de chargement pendant que la nouvelle requête part. Les requêtes obsolètes sont annulées.
- **Le catalogue ne charge pas mais les favoris s’ouvrent :** les favoris sont sauvegardés localement, tandis que le catalogue dépend de l’API.

## Limites et cas particuliers

Le navigateur doit accéder à Internet pour obtenir ou actualiser les films. La disponibilité, les contenus et les limites de requêtes dépendent de TMDB. Les routes de recherche et de détail s’appuient sur des identifiants numériques ; un identifiant mal formé est traité comme un film introuvable. Le service borne la pagination à 500 pages, selon la limite retenue par l’application.

Le jeton `VITE_*` n’est pas secret une fois l’application distribuée dans un navigateur. Pour un produit public ou un jeton qui doit rester confidentiel, il faudra faire transiter les appels par un serveur.

## Code et références

- Code : [`src/pages/Catalogue.tsx`](../../src/pages/Catalogue.tsx), [`src/hooks/useTmdb.ts`](../../src/hooks/useTmdb.ts), [`src/services/tmdb.ts`](../../src/services/tmdb.ts), [`src/components/FilmCard.tsx`](../../src/components/FilmCard.tsx), [`src/types/movie.ts`](../../src/types/movie.ts).
- Décision sur les données personnelles : [ADR-001](../adr/ADR-001-donnees-locales.md).
- Documentation officielle : [TMDB — Movie Popular](https://developer.themoviedb.org/reference/movie-popular-list) et [TMDB — Search Movie](https://developer.themoviedb.org/reference/search-movie).
