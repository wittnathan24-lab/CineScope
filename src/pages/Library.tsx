import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCollection } from "../context/CollectionContext";
import { Poster } from "../components/UI";
import type { LibraryStatus } from "../types/movie";

const labels: Record<LibraryStatus, string> = {
  watchlist: "À regarder",
  "in-progress": "En cours",
  watched: "Vu",
};
const badgeStyles: Record<LibraryStatus, string> = {
  watchlist: "bg-sky-400 text-slate-950",
  "in-progress": "bg-amber-300 text-slate-950",
  watched: "bg-emerald-400 text-slate-950",
};

export default function Library() {
  const { state, dispatch } = useCollection();
  const navigate = useNavigate();
  const [status, setStatus] = useState<LibraryStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("added");
  const waiting = state.library.filter((entry) => entry.status === "watchlist");
  const entries = state.library
    .filter(
      (entry) =>
        (status === "all" || entry.status === status) &&
        entry.film.title
          .toLocaleLowerCase()
          .includes(query.trim().toLocaleLowerCase()),
    )
    .sort((a, b) =>
      sort === "title"
        ? a.film.title.localeCompare(b.film.title, "fr")
        : sort === "rating"
          ? b.film.rating - a.film.rating
          : 0,
    );

  return (
    <div className="page">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-slate-700/60 pb-7">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[.2em] text-sky-400">
            Votre collection
          </p>
          <h1 className="!text-3xl md:!text-4xl">
            Ma bibliothèque<span className="text-sky-400">.</span>
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Tous vos films, une seule collection. Reprenez là où vous en étiez.
          </p>
        </div>
        <button
          className="rounded-md border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-semibold text-sky-300 transition hover:bg-sky-400/20"
          disabled={!waiting.length}
          onClick={() =>
            navigate(
              `/movies/${waiting[Math.floor(Math.random() * waiting.length)].film.id}`,
            )
          }
        >
          ✧ Choisir mon film du soir
        </button>
      </div>
      <section
        aria-label="Filtres de la bibliothèque"
        className="mb-7 rounded-lg border border-slate-700/60 bg-[#151d29] p-4 md:p-5"
      >
        <div
          className="mb-5 flex flex-wrap gap-2"
          role="group"
          aria-label="Filtrer par statut"
        >
          {(["all", "watchlist", "in-progress", "watched"] as const).map(
            (key) => (
              <button
                key={key}
                aria-pressed={status === key}
                onClick={() => setStatus(key)}
                className={`flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition ${status === key ? "bg-sky-400 text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
              >
                {key === "all" ? "Tous les films" : labels[key]}
                <span
                  className={`rounded px-1.5 py-0.5 text-xs ${status === key ? "bg-slate-950/15" : "bg-slate-950/50 text-slate-400"}`}
                >
                  {key === "all"
                    ? state.library.length
                    : state.library.filter((entry) => entry.status === key)
                        .length}
                </span>
              </button>
            ),
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex-1">
            <span className="sr-only">Filtrer mes films</span>
            <input
              className="w-full rounded-md border border-slate-700 bg-[#0e1520] px-4 py-3 text-sm placeholder:text-slate-500 focus:border-sky-400 focus:outline-sky-400"
              placeholder="Rechercher dans ma bibliothèque..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label className="flex items-center gap-3 text-xs text-slate-400">
            Trier par
            <select
              className="min-w-40 rounded-md border border-slate-700 bg-[#0e1520] px-3 py-3 text-sm text-slate-200"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="added">Ordre de la liste</option>
              <option value="title">Titre A → Z</option>
              <option value="rating">Meilleure note</option>
            </select>
          </label>
        </div>
      </section>
      <div className="mb-5 flex items-center gap-3">
        <span className="h-5 w-1 rounded-full bg-sky-400" />
        <h2 className="text-lg font-bold">
          {status === "all" ? "Tous mes films" : labels[status]}
        </h2>
        <span className="text-xs text-slate-400" role="status">
          {entries.length} résultat{entries.length > 1 ? "s" : ""}
        </span>
      </div>
      {entries.length ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {entries.map(({ film, status: filmStatus }) => {
            const favorite = state.favorites.some(
              (item) => item.id === film.id,
            );
            return (
              <article key={film.id} className="group min-w-0">
                <div className="relative overflow-hidden rounded-lg border border-slate-700/50 bg-[#151d29] transition group-hover:border-sky-400/60">
                  <Link
                    to={`/movies/${film.id}`}
                    aria-label={`Voir le film ${film.title}`}
                    className="block"
                  >
                    <Poster
                      path={film.poster}
                      title={film.title}
                      className="aspect-[2/3] w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/20"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100"
                    >
                      <span className="grid size-11 place-items-center rounded-full border border-white/50 bg-slate-950/70 text-lg text-white">
                        ▶
                      </span>
                    </span>
                    <span
                      className={`absolute bottom-2 left-2 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${badgeStyles[filmStatus]}`}
                    >
                      {labels[filmStatus]}
                    </span>
                  </Link>
                  <button
                    className={`absolute right-2 top-2 grid size-8 place-items-center rounded-md bg-slate-950/85 text-lg transition hover:bg-slate-800 ${favorite ? "text-amber-300" : "text-white"}`}
                    aria-label={
                      favorite ? "Retirer des favoris" : "Ajouter aux favoris"
                    }
                    aria-pressed={favorite}
                    onClick={() => dispatch({ type: "favorite", film })}
                  >
                    {favorite ? "★" : "☆"}
                  </button>
                </div>
                <h3 className="mt-3 truncate text-sm font-bold text-slate-100">
                  <Link
                    to={`/movies/${film.id}`}
                    className="hover:text-sky-300"
                    title={film.title}
                  >
                    {film.title}
                  </Link>
                </h3>
                <p className="mt-1 flex justify-between text-xs text-slate-400">
                  <span>{film.year || "Date inconnue"} · Film</span>
                  <span className="text-amber-300">
                    ★ {film.rating.toFixed(1)}
                  </span>
                </p>
                <label htmlFor={`status-${film.id}`} className="sr-only">
                  Statut du film
                </label>
                <select
                  id={`status-${film.id}`}
                  value={filmStatus}
                  className="mt-3 w-full rounded border border-slate-700 bg-[#151d29] px-2 py-2 text-xs text-slate-300 focus:outline-sky-400"
                  onChange={(event) =>
                    dispatch({
                      type: "library",
                      film,
                      status: event.target.value as LibraryStatus,
                    })
                  }
                >
                  {Object.entries(labels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <button
                  className="mt-2 text-left text-[11px] text-slate-400 transition hover:text-red-300"
                  onClick={() => dispatch({ type: "remove", id: film.id })}
                >
                  Retirer de la bibliothèque
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-700 bg-[#151d29]/60 px-5 py-16 text-center">
          <p className="mb-4 text-4xl text-sky-400" aria-hidden="true">
            ▤
          </p>
          <h3 className="text-xl font-semibold">
            {query ? "Aucun film trouvé" : "Aucun film dans cette liste."}
          </h3>
          <p className="mt-3 mb-6 text-sm text-slate-400">
            {query
              ? "Essayez un autre titre ou modifiez vos filtres."
              : "Votre prochaine séance vous attend. Ajoutez des films depuis le catalogue."}
          </p>
          {query || status !== "all" ? (
            <button
              className="rounded-md bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950"
              onClick={() => {
                setQuery("");
                setStatus("all");
              }}
            >
              Réinitialiser les filtres
            </button>
          ) : (
            <Link
              className="inline-flex rounded-md bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950"
              to="/movies"
            >
              Découvrir les films →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
