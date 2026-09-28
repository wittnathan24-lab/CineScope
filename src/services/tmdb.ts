import type { Film, FilmDetails, FilmPage } from "../types/movie";
type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
};
type Page = { results: Movie[]; page: number; total_pages: number };
export class ApiError extends Error {
  status: number;
  constructor(status: number) {
    super(
      status === 404
        ? "Film introuvable"
        : "Impossible de récupérer les données. Veuillez réessayer.",
    );
    this.status = status;
  }
}
async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const token = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
  if (!token)
    throw new Error(
      "Le catalogue est indisponible : configurez le jeton TMDB indiqué dans le README.",
    );
  const response = await fetch(`https://api.themoviedb.org/3${path}`, {
    signal,
    headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
  });
  if (!response.ok) throw new ApiError(response.status);
  return response.json() as Promise<T>;
}
const map = (m: Movie): Film => ({
  id: m.id,
  title: m.title,
  poster: m.poster_path,
  year: Number(m.release_date?.slice(0, 4)) || 0,
  rating: m.vote_average || 0,
});
export async function getMovies(
  page: number,
  category: string,
  query: string,
  signal?: AbortSignal,
): Promise<FilmPage> {
  const path = query
    ? `/search/movie?query=${encodeURIComponent(query)}&include_adult=false`
    : `/movie/${category}?region=FR`;
  const data = await request<Page>(
    `${path}&language=fr-FR&page=${page}`,
    signal,
  );
  return {
    films: data.results.map(map),
    page: data.page,
    totalPages: Math.max(1, Math.min(500, data.total_pages)),
  };
}
export async function getMovie(
  id: string,
  signal?: AbortSignal,
): Promise<FilmDetails> {
  if (!/^\d+$/.test(id)) throw new ApiError(404);
  const m = await request<
    Movie & {
      overview: string;
      genres: { name: string }[];
      runtime: number;
      vote_count: number;
      original_language: string;
      production_countries: { name: string }[];
      credits: {
        cast: {
          id: number;
          name: string;
          character: string;
          profile_path: string | null;
        }[];
      };
    }
  >(`/movie/${id}?language=fr-FR&append_to_response=credits`, signal);
  return {
    ...map(m),
    releaseDate: m.release_date,
    overview: m.overview,
    genres: m.genres.map((g) => g.name),
    runtime: m.runtime,
    voteCount: m.vote_count,
    originalLanguage: m.original_language,
    countries: m.production_countries.map((c) => c.name),
    cast: m.credits.cast
      .slice(0, 8)
      .map((a) => ({
        id: a.id,
        name: a.name,
        character: a.character,
        profilePath: a.profile_path,
      })),
  };
}
