import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMovies } from "../hooks/useTmdb";
import {
  Empty,
  ErrorMessage,
  FilmGrid,
  Loading,
  Pagination,
} from "../components/UI";
import hero from "../assets/hero.png";
export default function Catalogue({
  home = false,
  search = false,
}: {
  home?: boolean;
  search?: boolean;
}) {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const [draft, setDraft] = useState(query);
  const page = Math.min(
    500,
    Math.max(1, Math.floor(Number(params.get("page")) || 1)),
  );
  const category = ["popular", "top_rated", "now_playing"].includes(
    params.get("category") || "",
  )
    ? params.get("category")!
    : "popular";
  const { data, error, loading, retry } = useMovies(page, category, query);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState("default");
  const films = [...(data?.films || [])]
    .filter((f) => f.rating >= minRating)
    .sort((a, b) =>
      sort === "rating"
        ? b.rating - a.rating
        : sort === "year"
          ? b.year - a.year
          : 0,
    );
  const update = (key: string, value: string) =>
    setParams((p) => {
      p.set(key, value);
      if (key !== "page") p.delete("page");
      return p;
    });
  return (
    <div className="page">
      {home ? (
        <section className="relative mb-12 overflow-hidden rounded-2xl border border-white/10 bg-stone-900 px-7 py-16 md:px-14 md:py-24">
          <img
            src={hero}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#101718] via-[#101718]/70 to-transparent" />
          <div className="relative max-w-2xl">
            <p className="eyebrow">Votre prochaine séance commence ici</p>
            <h1 className="!text-5xl md:!text-7xl">
              Découvrez votre
              <br />
              <span className="text-amber-200">prochain film.</span>
            </h1>
            <p className="my-6 max-w-lg leading-7 text-stone-300">
              Explorez des films, trouvez vos favoris et construisez votre
              bibliothèque personnelle.
            </p>
            <Link className="btn inline-flex" to="/movies">
              Explorer les films →
            </Link>
          </div>
        </section>
      ) : (
        <>
          <p className="eyebrow">
            {search
              ? "Une envie de cinéma ?"
              : "Le cinéma sous tous ses angles"}
          </p>
          <h1>{search ? "Rechercher un film" : "Tous les films"}</h1>
        </>
      )}
      {search && (
        <form
          className="my-8"
          onSubmit={(e) => {
            e.preventDefault();
            update("q", draft.trim());
          }}
        >
          <label className="mb-2 block" htmlFor="search">
            Rechercher un film
          </label>
          <div className="flex flex-wrap gap-3">
            <input
              className="field min-w-0 flex-1"
              id="search"
              placeholder="Titre du film..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button className="btn">Rechercher</button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setDraft("");
                setParams({});
                setMinRating(0);
              }}
            >
              Réinitialiser la recherche
            </button>
          </div>
        </form>
      )}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">La sélection CineScope</p>
          <h2 className="text-3xl font-semibold">
            {query
              ? `Résultats pour « ${query} »`
              : home
                ? "Films populaires"
                : "À découvrir"}
          </h2>
        </div>
        {home ? (
          <Link className="text-sm text-amber-200" to="/movies">
            Tout le catalogue →
          </Link>
        ) : (
          <div className="flex flex-wrap gap-3">
            {!query && (
              <label className="text-xs text-stone-400">
                Collection
                <select
                  className="field mt-1"
                  value={category}
                  onChange={(e) => update("category", e.target.value)}
                >
                  <option value="popular">Populaires</option>
                  <option value="top_rated">Les mieux notés</option>
                  <option value="now_playing">Au cinéma</option>
                </select>
              </label>
            )}
            <label className="text-xs text-stone-400">
              Note minimale (page)
              <select
                className="field mt-1"
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
              >
                <option value="0">Toutes les notes</option>
                <option value="7">7 / 10 et plus</option>
                <option value="8">8 / 10 et plus</option>
              </select>
            </label>
            <label className="text-xs text-stone-400">
              Trier cette page
              <select
                className="field mt-1"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="default">Ordre du catalogue</option>
                <option value="rating">Note décroissante</option>
                <option value="year">Plus récents</option>
              </select>
            </label>
          </div>
        )}
      </div>
      {loading ? (
        <Loading text={query ? "Recherche en cours..." : undefined} />
      ) : error ? (
        <ErrorMessage retry={retry} />
      ) : films.length ? (
        <FilmGrid films={home ? films.slice(0, 6) : films} featured={home} />
      ) : (
        <Empty
          title={
            query ? "Aucun résultat pour cette recherche." : "Aucun film trouvé"
          }
          message={
            query
              ? "Essayez avec un autre titre."
              : "Essayez avec une autre note minimale."
          }
        />
      )}
      {!home && data && (
        <Pagination
          page={page}
          total={data.totalPages}
          change={(n) => update("page", String(n))}
        />
      )}
    </div>
  );
}
