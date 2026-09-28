import { useState } from "react";
import { useCollection } from "../context/CollectionContext";
import { Empty, FilmGrid } from "../components/UI";
import Library from "./Library";
export default function Collection({
  favorites = false,
}: {
  favorites?: boolean;
}) {
  const { state } = useCollection();
  const [filter, setFilter] = useState("");
  if (!favorites) return <Library />;
  const films = state.favorites.filter((f) =>
    f.title.toLocaleLowerCase().includes(filter.toLocaleLowerCase()),
  );
  return (
    <div className="page">
      <p className="eyebrow">Votre cinéma personnel</p>
      <h1>Mes favoris</h1>
      <div className="my-7">
        <label>
          <span className="sr-only">Filtrer mes films</span>
          <input
            className="field w-full"
            placeholder="Filtrer mes films par titre..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </label>
      </div>
      {state.favorites.length ? (
        <>
          <p className="mb-5 text-sm text-stone-400">
            {state.favorites.length} films dans vos favoris
          </p>
          <FilmGrid films={films} />
          {!films.length && <p>Aucun film trouvé. Modifiez le filtre.</p>}
        </>
      ) : (
        <Empty
          title="Vous n'avez encore aucun film favori."
          message="Ajoutez des films à vos favoris pour les retrouver ici."
        />
      )}
    </div>
  );
}
