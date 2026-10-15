import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean };
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): State { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <main className="error-state">
      <h1>La traversée s’est interrompue.</h1>
      <p>Rechargez la page pour reprendre le paysage.</p>
      <button className="solid-button" onClick={() => window.location.reload()}>Recharger la page</button>
    </main>;
    return this.props.children;
  }
}
