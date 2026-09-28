import { Component, type ReactNode } from "react";
export default class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="page">
        <h1>Une erreur est survenue</h1>
        <p>CineScope a rencontré un problème inattendu.</p>
        <a className="btn inline-flex mt-5" href="/">
          Retour à l'accueil
        </a>
      </main>
    ) : (
      this.props.children
    );
  }
}
