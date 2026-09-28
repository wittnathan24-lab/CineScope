import { useState } from "react";
import { Link } from "react-router-dom";
import type { Film } from "../types/movie";
import FilmCard from "./FilmCard";
export function Poster({
  path,
  title,
  className = "",
}: {
  path: string | null;
  title: string;
  className?: string;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  return path && failed !== path ? (
    <img
      loading="lazy"
      className={className}
      src={`https://image.tmdb.org/t/p/w500${path}`}
      alt={`Affiche de ${title}`}
      onError={() => setFailed(path)}
    />
  ) : (
    <div
      className={`${className} grid place-items-center bg-stone-800 p-5 text-center text-sm text-stone-400`}
    >
      Affiche indisponible
    </div>
  );
}
export function FilmGrid({
  films,
  featured = false,
}: {
  films: Film[];
  featured?: boolean;
}) {
  return (
    <div
      className={
        featured
          ? "grid grid-cols-1 gap-5 min-[440px]:grid-cols-2 md:grid-cols-3"
          : "grid grid-cols-1 gap-5 min-[440px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      }
    >
      {films.map((f) => (
        <FilmCard key={f.id} film={f} />
      ))}
    </div>
  );
}
export function Empty({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/20 p-10 text-center">
      <h2 className="mb-3 text-2xl">{title}</h2>
      <p className="mb-6 text-stone-400">{message}</p>
      <Link className="btn inline-flex" to="/movies">
        Découvrir les films
      </Link>
    </div>
  );
}
export function Loading({
  text = "Chargement des films...",
}: {
  text?: string;
}) {
  return (
    <p role="status" className="notice animate-pulse">
      {text}
    </p>
  );
}
export function ErrorMessage({
  title = "Impossible de charger les films.",
  retry,
}: {
  title?: string;
  retry: () => void;
}) {
  return (
    <div role="alert" className="notice">
      <h2 className="text-xl">{title}</h2>
      <p className="my-3">
        Une erreur est survenue lors de la récupération des données. Veuillez
        réessayer.
      </p>
      <button className="btn" onClick={retry}>
        Réessayer
      </button>
    </div>
  );
}
export function Pagination({
  page,
  total,
  change,
}: {
  page: number;
  total: number;
  change: (page: number) => void;
}) {
  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-4"
      aria-label="Pagination"
    >
      <button
        className="btn-secondary"
        disabled={page <= 1}
        onClick={() => change(page - 1)}
      >
        Page précédente
      </button>
      <span className="text-sm text-stone-400">
        Page {page} sur {total}
      </span>
      <button
        className="btn-secondary"
        disabled={page >= total}
        onClick={() => change(page + 1)}
      >
        Page suivante
      </button>
    </nav>
  );
}
