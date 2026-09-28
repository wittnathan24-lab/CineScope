export type Film = {
  id: number;
  title: string;
  poster: string | null;
  year: number;
  rating: number;
};
export type FilmDetails = Film & {
  releaseDate: string;
  overview: string;
  genres: string[];
  runtime: number | null;
  voteCount: number;
  originalLanguage: string;
  countries: string[];
  cast: {
    id: number;
    name: string;
    character: string;
    profilePath: string | null;
  }[];
};
export type FilmPage = { films: Film[]; page: number; totalPages: number };
export type LibraryStatus = "watchlist" | "in-progress" | "watched";
export type Profile = {
  firstName: string;
  lastName: string;
  nickname: string;
  email: string;
  bio: string;
};
