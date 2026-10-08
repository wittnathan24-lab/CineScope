# CineScope — le guide du projet

CineScope est mon projet de découverte de films. Je l’ai pensé comme un petit carnet de cinéma : on parcourt le catalogue TMDB, on garde les films qui nous tentent, puis on suit son avancée dans une bibliothèque personnelle.

J’ai voulu garder une application simple à lancer et à comprendre. Elle n’a pas de compte utilisateur ni de serveur à administrer : les données personnelles restent dans le navigateur qui les a créées.

## Ce qu’il faut pour commencer

- Node.js 22.12 ou une version LTS plus récente ;
- npm ;
- un jeton « API Read Access Token » TMDB pour charger le catalogue ;
- un navigateur récent.

Le jeton est utilisé depuis le navigateur par l’application. Il ne faut donc y mettre qu’un jeton de lecture TMDB, jamais un mot de passe ou un autre secret.

## Installer et lancer CineScope

Depuis un terminal ouvert dans le dossier du projet :

```sh
npm ci
```

Copier `.env.example` vers `.env.local`, puis renseigner la valeur du jeton :

```env
VITE_TMDB_ACCESS_TOKEN=votre_jeton_de_lecture_tmdb
```

Sous PowerShell, on peut créer le fichier avec `Copy-Item .env.example .env.local`. Si `.env.local` existe déjà, le conserver et le modifier sans l’écraser. Ensuite :

```sh
npm run dev
```

Vite affiche l’adresse locale à ouvrir dans le navigateur. Pour préparer la version de production, utiliser `npm run build`, puis `npm run preview` pour la consulter localement.

## Ce que l’application sait faire

- parcourir et rechercher des films, puis consulter leur fiche ;
- ajouter des favoris et ranger les films dans « À regarder », « En cours » ou « Vu » ;
- attribuer une note personnelle de une à cinq étoiles ;
- compléter un profil local, consulter ses statistiques et exporter ses données en JSON.

Les routes et les principaux fichiers sont repérés ci-dessous. Le parcours des données venant de TMDB est expliqué dans [la documentation technique](technique/flux-tmdb.md).

| Emplacement | À quoi il sert |
| --- | --- |
| `src/App.tsx` | Routes, navigation générale et chargement des pages |
| `src/pages/` | Catalogue, recherche, fiches, bibliothèque et profil |
| `src/components/` | Cartes, navigation, pied de page et éléments d’interface |
| `src/services/tmdb.ts` | Appels à TMDB et adaptation des réponses |
| `src/hooks/useTmdb.ts` | Chargement, erreurs, annulation et nouvelle tentative |
| `src/context/store.ts` | État, actions et validation des données locales |
| `src/context/CollectionContext.tsx` | Partage de l’état et sauvegarde dans le navigateur |
| `src/types/movie.ts` | Types partagés des films et du profil |
| `src/test/` | Tests de l’application |
| `.env.example` | Nom de la variable nécessaire, sans jeton personnel |

## Limites à connaître

Les favoris, la bibliothèque, les notes et le profil sont enregistrés dans le stockage local du navigateur. Ils ne suivent pas la personne sur un autre appareil et peuvent disparaître si les données du navigateur sont effacées. L’export JSON permet d’en garder une copie, mais l’import automatique n’existe pas encore.

Le catalogue et les affiches dépendent de TMDB, d’une connexion Internet et d’un jeton valide. Si TMDB ne répond pas, les pages personnelles restent accessibles, mais le catalogue ne peut pas se mettre à jour. Les informations et affiches restent la propriété de leurs ayants droit. CineScope utilise l’API TMDB sans être approuvé ni certifié par TMDB.

## Décision et règles de contribution

La décision d’enregistrer les collections dans le navigateur est expliquée dans [ADR-001](adr/ADR-001-donnees-locales.md).

Pour proposer une évolution :

1. Décrire le besoin ou le bug dans une issue GitHub ; pour une petite correction, écrire clairement le problème dans la PR peut suffire.
2. Créer une branche dédiée depuis la branche principale, par exemple `feat/recherche-par-genre` ou `fix/affiche-manquante`.
3. Faire une modification ciblée, puis ouvrir une PR vers la branche principale. La PR décrit le besoin, le changement, les vérifications effectuées et, pour une modification visible, ajoute une capture d’écran.
4. Demander une relecture à un autre membre de l’équipe ou au référent du projet. L’auteur de la PR ne la fusionne pas seul.
5. Vérifier au minimum `npm run lint`, `npm test` et `npm run build`, ainsi que le parcours touché dans le navigateur. Ne jamais ajouter `.env.local` ni un jeton à la PR.
6. La personne qui relit fusionne quand la PR est compréhensible, que les vérifications passent et que les remarques sont résolues.
7. Mettre à jour ce guide ou la documentation technique si la façon d’installer, d’utiliser ou de comprendre le code a changé.

## Documents du dossier

- [ADR-001 — Garder les données personnelles dans le navigateur](docs/adr/ADR-001-donnees-locales.md)
- [Documentation technique — Parcours d’une requête TMDB](docs/technique/flux-tmdb.md)
