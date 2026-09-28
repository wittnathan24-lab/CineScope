import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMovie } from "../hooks/useTmdb";
import { ApiError } from "../services/tmdb";
import { useCollection } from "../context/CollectionContext";
import { Empty, ErrorMessage, Loading, Poster } from "../components/UI";
function Rating({ id }: { id: number }) {
  const { state, dispatch } = useCollection();
  const [value, setValue] = useState(state.ratings[id] || 0);
  const [message, setMessage] = useState("");
  return (
    <form
      className="panel mt-8"
      onSubmit={(e) => {
        e.preventDefault();
        if (!value) return setMessage("Veuillez sélectionner une note.");
        dispatch({ type: "rating", id, value });
        setMessage("Votre note a été enregistrée.");
      }}
    >
      <h2 className="text-2xl">Ma note</h2>
      <fieldset className="my-4 flex gap-4">
        <legend className="sr-only">Choisissez de 1 à 5 étoiles</legend>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="cursor-pointer text-2xl text-amber-200">
            <input
              className="sr-only peer"
              type="radio"
              name="rating"
              value={n}
              checked={value === n}
              onChange={() => {
                setValue(n);
                setMessage("");
              }}
            />
            <span aria-hidden="true" className="peer-focus-visible:outline">
              {n <= value ? "★" : "☆"}
            </span>
            <span className="sr-only">{n} étoiles</span>
          </label>
        ))}
      </fieldset>
      <button className="btn">Enregistrer ma note</button>
      <p role="status" className="mt-3 text-sm text-amber-200">
        {message}
      </p>
    </form>
  );
}
export default function Detail() {
  const { id = "" } = useParams();
  const { data: film, loading, error, retry } = useMovie(id);
  const { state, dispatch } = useCollection();
  if (loading)
    return (
      <div className="page">
        <Loading text="Chargement du film..." />
      </div>
    );
  if (error instanceof ApiError && error.status === 404)
    return (
      <div className="page">
        <Empty
          title="Film introuvable"
          message="Le film demandé n'existe pas ou n'est plus disponible."
        />
      </div>
    );
  if (error || !film)
    return (
      <div className="page">
        <ErrorMessage title="Impossible de charger ce film." retry={retry} />
      </div>
    );
  const favorite = state.favorites.some((f) => f.id === film.id);
  const entry = state.library.find((e) => e.film.id === film.id);
  return (
    <div className="page">
      <Link className="text-sm text-amber-200" to="/movies">
        ← Retour aux films
      </Link>
      <article className="mt-8 grid gap-10 md:grid-cols-[280px_1fr]">
        <Poster
          path={film.poster}
          title={film.title}
          className="w-full max-w-sm rounded-xl aspect-[2/3] object-cover"
        />
        <div>
          <p className="eyebrow">Le film en détail</p>
          <h1>{film.title}</h1>
          <p className="my-5 text-stone-400">
            {film.releaseDate
              ? new Date(film.releaseDate).toLocaleDateString("fr-FR")
              : "Date inconnue"}{" "}
            · {film.runtime ? `${film.runtime} min` : "Durée inconnue"} ·{" "}
            <span className="text-amber-200">
              ★ {film.rating.toFixed(1)} / 10
            </span>{" "}
            ({film.voteCount.toLocaleString("fr-FR")} votes)
          </p>
          <div className="flex flex-wrap gap-2">
            {film.genres.map((g) => (
              <span
                className="rounded-full border border-white/20 px-3 py-1 text-xs"
                key={g}
              >
                {g}
              </span>
            ))}
          </div>
          <h2 className="mt-8 mb-3 text-xl">Synopsis</h2>
          <p className="max-w-3xl leading-8 text-stone-300">
            {film.overview || "Aucune description disponible."}
          </p>
          <p className="my-5 text-sm text-stone-400">
            Langue originale : {film.originalLanguage.toUpperCase()}
            <br />
            Pays de production : {film.countries.join(", ") || "Non renseigné"}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              className="btn"
              aria-pressed={favorite}
              onClick={() => dispatch({ type: "favorite", film })}
            >
              {favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            </button>
            <button
              className="btn-secondary"
              disabled={!!entry}
              onClick={() =>
                dispatch({ type: "library", film, status: "watchlist" })
              }
            >
              {entry ? "Dans ma bibliothèque" : "Ajouter à ma bibliothèque"}
            </button>
          </div>
          <Rating key={film.id} id={film.id} />
        </div>
      </article>
      <h2 className="mt-12 mb-5 text-3xl">Acteurs principaux</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
        {film.cast.map((a) => (
          <article key={a.id}>
            <Poster
              path={a.profilePath}
              title={a.name}
              className="aspect-[2/3] w-full rounded-lg object-cover"
            />
            <h3 className="mt-3 font-semibold">{a.name}</h3>
            <p className="text-xs text-stone-400">{a.character}</p>
          </article>
        ))}
      </div>
      {!film.cast.length && <p>Aucun acteur disponible pour ce film.</p>}
    </div>
  );
}

