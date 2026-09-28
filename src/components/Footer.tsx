export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 px-6 py-8 text-center text-xs leading-6 text-stone-500">
      <p className="text-sm text-stone-300">
        CineScope · Le cinéma, à votre façon.
      </p>
      <p>
        Données et images :{" "}
        <a
          className="underline"
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noreferrer"
        >
          TMDB
        </a>
        . This product uses the TMDB API but is not endorsed or certified by
        TMDB.
      </p>
      <p>
        Vos favoris, votre bibliothèque et votre profil sont enregistrés sur cet
        appareil.
      </p>
    </footer>
  );
}
