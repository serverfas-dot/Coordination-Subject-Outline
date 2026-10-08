import { Component, StrictMode, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

type ErrorBoundaryState = { hasError: boolean };

class AppErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application failed to render', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="app-error-page">
          <section className="app-error-card">
            <p className="eyebrow">Coordination workspace</p>
            <h1>We couldn’t open the workspace.</h1>
            <p>Refresh this page to try again. Your saved submissions will not be removed.</p>
            <button className="primary-button" onClick={() => window.location.reload()}>Refresh page</button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>
);
