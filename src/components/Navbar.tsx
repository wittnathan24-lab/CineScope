import { NavLink } from "react-router-dom";
export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#101718]/95 backdrop-blur-xl">
      <nav
        aria-label="Navigation principale"
        className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-5 lg:px-8"
      >
        <NavLink to="/" className="text-2xl font-semibold tracking-tight">
          ◈ Cine<span className="text-amber-200">Scope</span>
        </NavLink>
        <div className="order-3 flex w-full flex-wrap justify-center gap-5 text-sm text-stone-400 md:order-none md:w-auto">
          {[
            ["/", "Accueil"],
            ["/movies", "Films"],
            ["/favorites", "Favoris"],
            ["/library", "Bibliothèque"],
            ["/profile", "Profil"],
          ].map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                isActive ? "text-amber-200" : "hover:text-white"
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
        <NavLink to="/search" className="btn-secondary">
          ⌕ Rechercher
        </NavLink>
      </nav>
    </header>
  );
}
