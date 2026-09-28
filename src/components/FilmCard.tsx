import { Link } from "react-router-dom";
import { useCollection } from "../context/CollectionContext";
import type { Film } from "../types/movie";
import { Poster } from "./UI";
export default function FilmCard({ film }: { film: Film }) {
  const { state, dispatch } = useCollection();
  const favorite = state.favorites.some((f) => f.id === film.id);
  const entry = state.library.find((e) => e.film.id === film.id);
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#182021] transition hover:-translate-y-1 hover:border-amber-200/40">
      <Link to={`/movies/${film.id}`} tabIndex={-1} aria-hidden="true">
        <Poster
          path={film.poster}
          title={film.title}
          className="aspect-[2/3] w-full object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex justify-between text-xs text-stone-400">
          <span>{film.year || "Date inconnue"}</span>
          <span className="text-amber-200">
            ★ {film.rating.toFixed(1)} / 10
          </span>
        </div>
        <h3 className="mb-4 text-lg font-semibold">{film.title}</h3>
        <div className="mt-auto grid gap-2">
          <Link className="btn" to={`/movies/${film.id}`}>
            Voir le film
          </Link>
          <button
            className="btn-secondary"
            aria-pressed={favorite}
            onClick={() => dispatch({ type: "favorite", film })}
          >
            {favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          </button>
          <button
            className="text-xs text-stone-400 hover:text-amber-200 disabled:text-emerald-300"
            disabled={!!entry}
            onClick={() =>
              dispatch({ type: "library", film, status: "watchlist" })
            }
          >
            {entry ? "✓ Dans ma bibliothèque" : "+ Ajouter à ma bibliothèque"}
          </button>
        </div>
      </div>
    </article>
  );
}
