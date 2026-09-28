import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import FilmCard from "../components/FilmCard";
import { Poster } from "../components/UI";
import { CollectionProvider } from "../context/CollectionContext";
import { initialState, reducer, loadState } from "../context/store";
import Profile from "../pages/Profile";
const film = {
  id: 1,
  title: "Interstellar",
  year: 2014,
  rating: 8.7,
  poster: null,
};
const movie = {
  id: 1,
  title: "Interstellar",
  release_date: "2014-11-05",
  vote_average: 8.7,
  poster_path: null,
};
function mount(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}
function mockApi() {
  vi.stubEnv("VITE_TMDB_ACCESS_TOKEN", "test");
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
    const u = String(url);
    return new Response(
      JSON.stringify({
        page: 1,
        total_pages: 2,
        results: u.includes("query=absent") ? [] : [movie],
      }),
      { status: 200 },
    );
  });
}
describe("Collection", () => {
  it("ajoute, conserve plusieurs favoris et retire un favori", () => {
    let s = reducer(initialState, { type: "favorite", film });
    s = reducer(s, { type: "favorite", film: { ...film, id: 2 } });
    expect(s.favorites).toHaveLength(2);
    s = reducer(s, { type: "favorite", film });
    expect(s.favorites.map((f) => f.id)).toEqual([2]);
  });
  it("ajoute sans doublon, change les statuts dans les deux sens et retire", () => {
    let s = initialState;
    for (const status of [
      "watchlist",
      "in-progress",
      "watched",
      "watchlist",
    ] as const) {
      s = reducer(s, { type: "library", film, status });
      expect(s.library).toHaveLength(1);
      expect(s.library[0].status).toBe(status);
    }
    expect(reducer(s, { type: "remove", id: 1 }).library).toEqual([]);
  });
  it("tolère les sauvegardes endommagées", () => {
    localStorage.setItem("cinescope-v1", '{"favorites":[null]}');
    expect(loadState()).toEqual(initialState);
  });
  it("affiche la carte et sauvegarde son favori", async () => {
    render(
      <MemoryRouter>
        <CollectionProvider>
          <FilmCard film={film} />
        </CollectionProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText("Interstellar")).toBeInTheDocument();
    expect(screen.getByText("2014")).toBeInTheDocument();
    expect(screen.getByText(/8.7/)).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Ajouter aux favoris" }),
    );
    expect(
      screen.getByRole("button", { name: "Retirer des favoris" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(loadState().favorites).toHaveLength(1);
    await userEvent.click(
      screen.getByRole("button", { name: "Retirer des favoris" }),
    );
    expect(loadState().favorites).toHaveLength(0);
  });
  it("reste accessible quand le catalogue est indisponible", async () => {
    const fetch = mockApi().mockRejectedValue(new Error("offline"));
    mount("/favorites");
    expect(
      await screen.findByText("Vous n'avez encore aucun film favori."),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });
  it("déplace et retire un film depuis la bibliothèque", async () => {
    localStorage.setItem(
      "cinescope-v1",
      JSON.stringify({
        ...initialState,
        library: [{ film, status: "watchlist" }],
      }),
    );
    mount("/library");
    const select = await screen.findByLabelText("Statut du film");
    await userEvent.selectOptions(select, "watched");
    expect(loadState().library[0].status).toBe("watched");
    await userEvent.click(
      screen.getByRole("button", { name: "Retirer de la bibliothèque" }),
    );
    expect(loadState().library).toHaveLength(0);
  });
});
describe("Profil", () => {
  it("valide les champs et enregistre un profil", async () => {
    render(
      <CollectionProvider>
        <Profile />
      </CollectionProvider>,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Enregistrer mon profil" }),
    );
    expect(screen.getAllByText("Ce champ est obligatoire.")).toHaveLength(4);
    await userEvent.type(screen.getByLabelText(/Prénom/), "Alice");
    await userEvent.type(screen.getByLabelText(/^Nom/), "Martin");
    await userEvent.type(screen.getByLabelText(/Pseudonyme/), "CineAlice");
    await userEvent.type(screen.getByLabelText(/Adresse e-mail/), "invalide");
    expect(screen.getByText(/adresse e-mail valide/)).toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText(/Adresse e-mail/));
    await userEvent.type(
      screen.getByLabelText(/Adresse e-mail/),
      "alice@example.com",
    );
    expect(screen.queryByText(/adresse e-mail valide/)).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Enregistrer mon profil" }),
    );
    expect(
      screen.getByText("Profil enregistré avec succès."),
    ).toBeInTheDocument();
    expect(loadState().profile.nickname).toBe("CineAlice");
  });
});
describe("TMDB et navigation", () => {
  it("recherche, affiche les résultats vides et réinitialise", async () => {
    mockApi();
    mount("/search");
    expect(await screen.findByText("Interstellar")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Rechercher un film"), "absent");
    await userEvent.click(screen.getByRole("button", { name: "Rechercher" }));
    expect(
      await screen.findByText("Aucun résultat pour cette recherche."),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Réinitialiser la recherche" }),
    );
    expect(await screen.findByText("Interstellar")).toBeInTheDocument();
    expect(screen.getByLabelText("Rechercher un film")).toHaveValue("");
  });
  it("récupère la page suivante", async () => {
    const fetch = mockApi();
    mount("/movies");
    await screen.findByText("Interstellar");
    expect(
      screen.getByRole("button", { name: "Page précédente" }),
    ).toBeDisabled();
    await userEvent.click(
      screen.getByRole("button", { name: "Page suivante" }),
    );
    await waitFor(() =>
      expect(fetch).toHaveBeenLastCalledWith(
        expect.stringContaining("page=2"),
        expect.anything(),
      ),
    );
  });
  it("affiche une erreur puis permet de réessayer", async () => {
    const fetch = mockApi().mockRejectedValueOnce(new Error("offline"));
    mount("/movies");
    expect(
      await screen.findByText("Impossible de charger les films."),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(await screen.findByText("Interstellar")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it("distingue un film inexistant", async () => {
    mockApi().mockResolvedValue(new Response("{}", { status: 404 }));
    mount("/movies/999");
    expect(await screen.findByText("Film introuvable")).toBeInTheDocument();
  });
  it("gère une affiche cassée", () => {
    render(<Poster path="/bad.jpg" title="Test" />);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByText("Affiche indisponible")).toBeInTheDocument();
  });
  it("propose un retour sur une route inconnue", async () => {
    mount("/inconnue");
    expect(await screen.findByText("Page introuvable")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Retour à l'accueil" }),
    ).toHaveAttribute("href", "/");
  });
});

describe("Notes et erreurs de détail", () => {
  it("valide, enregistre et restaure une note personnelle", async () => {
    mockApi().mockImplementation(
      async () =>
        new Response(
          JSON.stringify({
            ...movie,
            overview: "Une exploration spatiale.",
            genres: [{ name: "Science-fiction" }],
            runtime: 169,
            vote_count: 100,
            original_language: "en",
            production_countries: [{ name: "États-Unis" }],
            credits: { cast: [] },
          }),
          { status: 200 },
        ),
    );
    const view = mount("/movies/1");
    await screen.findByText("Ma note");
    await userEvent.click(
      screen.getByRole("button", { name: "Enregistrer ma note" }),
    );
    expect(
      screen.getByText("Veuillez sélectionner une note."),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("radio", { name: "4 étoiles" }));
    await userEvent.click(
      screen.getByRole("button", { name: "Enregistrer ma note" }),
    );
    expect(
      screen.getByText("Votre note a été enregistrée."),
    ).toBeInTheDocument();
    expect(loadState().ratings[1]).toBe(4);
    view.unmount();
    mount("/movies/1");
    expect(
      await screen.findByRole("radio", { name: "4 étoiles" }),
    ).toBeChecked();
  });
  it("ne confond pas une erreur réseau et un film absent", async () => {
    mockApi().mockRejectedValue(new Error("network"));
    mount("/movies/1");
    expect(
      await screen.findByText("Impossible de charger ce film."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Film introuvable")).not.toBeInTheDocument();
  });
});
