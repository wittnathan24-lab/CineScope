import type { Film, LibraryStatus, Profile } from "../types/movie";
export type State = {
  favorites: Film[];
  library: { film: Film; status: LibraryStatus }[];
  ratings: Record<number, number>;
  profile: Profile;
};
export const initialState: State = {
  favorites: [],
  library: [],
  ratings: {},
  profile: { firstName: "", lastName: "", nickname: "", email: "", bio: "" },
};
export type Action =
  | { type: "favorite"; film: Film }
  | { type: "library"; film: Film; status: LibraryStatus }
  | { type: "remove"; id: number }
  | { type: "rating"; id: number; value: number }
  | { type: "profile"; value: Profile };
export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "favorite":
      return {
        ...state,
        favorites: state.favorites.some((f) => f.id === action.film.id)
          ? state.favorites.filter((f) => f.id !== action.film.id)
          : [...state.favorites, action.film],
      };
    case "library":
      return {
        ...state,
        library: [
          ...state.library.filter((e) => e.film.id !== action.film.id),
          { film: action.film, status: action.status },
        ],
      };
    case "remove":
      return {
        ...state,
        library: state.library.filter((e) => e.film.id !== action.id),
      };
    case "rating":
      return action.value >= 1 && action.value <= 5
        ? { ...state, ratings: { ...state.ratings, [action.id]: action.value } }
        : state;
    case "profile":
      return { ...state, profile: action.value };
  }
}
export function loadState(): State {
  try {
    const s = JSON.parse(
      localStorage.getItem("cinescope-v1") || "null",
    ) as State | null;
    const film = (f: Film) =>
      f &&
      Number.isInteger(f.id) &&
      typeof f.title === "string" &&
      typeof f.rating === "number" &&
      typeof f.year === "number" &&
      (f.poster === null || typeof f.poster === "string");
    if (
      s &&
      Array.isArray(s.favorites) &&
      s.favorites.every(film) &&
      Array.isArray(s.library) &&
      s.library.every(
        (e) =>
          film(e.film) &&
          ["watchlist", "in-progress", "watched"].includes(e.status),
      ) &&
      s.ratings &&
      Object.values(s.ratings).every(
        (n) => Number.isInteger(n) && n >= 1 && n <= 5,
      ) &&
      s.profile &&
      Object.keys(initialState.profile).every(
        (k) => typeof s.profile[k as keyof Profile] === "string",
      )
    )
      return s;
  } catch {
    /* A damaged or unavailable storage must not prevent startup. */
  }
  return initialState;
}