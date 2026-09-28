import { useEffect, useState } from "react";
import { getMovie, getMovies } from "../services/tmdb";
function useRequest<T>(
  key: string,
  loader: (signal: AbortSignal) => Promise<T>,
) {
  const [result, setResult] = useState<{
    key: string;
    data?: T;
    error?: Error;
  }>({ key: "" });
  const [attempt, setAttempt] = useState(0);
  const requestKey = `${key}:${attempt}`;
  useEffect(() => {
    const controller = new AbortController();
    loader(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key: requestKey, data });
      })
      .catch((error: Error) => {
        if (!controller.signal.aborted) setResult({ key: requestKey, error });
      });
    return () => controller.abort();
    // The serialized key represents every loader input; inline loader identity must not trigger fetching.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);
  return {
    data: result.key === requestKey ? result.data : undefined,
    error: result.key === requestKey ? result.error : undefined,
    loading: result.key !== requestKey,
    retry: () => setAttempt((n) => n + 1),
  };
}
export const useMovies = (page = 1, category = "popular", query = "") =>
  useRequest(JSON.stringify([page, category, query]), (signal) =>
    getMovies(page, category, query, signal),
  );
export const useMovie = (id: string) =>
  useRequest(id, (signal) => getMovie(id, signal));
