import { lazy, Suspense, useEffect } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import { CollectionProvider } from "./context/CollectionContext";
import { Loading } from "./components/UI";
import Catalogue from "./pages/Catalogue";
const Detail = lazy(() => import("./pages/Detail"));
const Collection = lazy(() => import("./pages/Collection"));
const Profile = lazy(() => import("./pages/Profile"));
function RouteEffects() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${pathname === "/" ? "Découvrez votre prochain film" : pathname.startsWith("/profile") ? "Mon profil" : pathname.startsWith("/library") ? "Ma bibliothèque" : pathname.startsWith("/favorites") ? "Mes favoris" : "Films"} · CineScope`;
  }, [pathname]);
  return null;
}
export default function App() {
  return (
    <ErrorBoundary>
      <CollectionProvider>
        <div className="flex min-h-screen flex-col">
          <a href="#main" className="sr-only focus:not-sr-only focus:p-4">
            Aller au contenu
          </a>
          <Navbar />
          <RouteEffects />
          <main id="main" className="flex-1">
            <Suspense
              fallback={
                <div className="page">
                  <Loading />
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Catalogue key="home" home />} />
                <Route path="/movies" element={<Catalogue key="movies" />} />
                <Route
                  path="/search"
                  element={<Catalogue key="search" search />}
                />
                <Route path="/movies/:id" element={<Detail />} />
                <Route
                  path="/favorites"
                  element={<Collection key="favorites" favorites />}
                />
                <Route path="/library" element={<Collection key="library" />} />
                <Route path="/profile" element={<Profile />} />
                <Route
                  path="*"
                  element={
                    <div className="page">
                      <p className="eyebrow">Erreur 404</p>
                      <h1>Page introuvable</h1>
                      <p className="my-6">
                        La page que vous recherchez n'existe pas ou n'est plus
                        disponible.
                      </p>
                      <Link className="btn inline-flex" to="/">
                        Retour à l'accueil
                      </Link>
                    </div>
                  }
                />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </CollectionProvider>
    </ErrorBoundary>
  );
}
