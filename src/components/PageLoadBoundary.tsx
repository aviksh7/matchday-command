import React, { Component, type ReactNode } from 'react';
import { PageLoadError } from '../logic/pageLoader';

export const PageLoadingState: React.FC = () => (
  <div className="page-load-state" role="status" aria-live="polite">
    <div className="page-load-state__content">
      <span className="page-load-state__marker" aria-hidden="true" />
      <p>Loading page…</p>
    </div>
  </div>
);

interface PageLoadBoundaryProps {
  children: ReactNode;
  onReload?: () => void;
}

interface PageLoadBoundaryState {
  error: PageLoadError | null;
}

const reloadApplication = () => {
  window.location.reload();
};

export class PageLoadBoundary extends Component<PageLoadBoundaryProps, PageLoadBoundaryState> {
  state: PageLoadBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): PageLoadBoundaryState {
    if (error instanceof PageLoadError) {
      return { error };
    }

    throw error;
  }

  render() {
    if (this.state.error) {
      const { onReload = reloadApplication } = this.props;

      return (
        <section className="page-load-state page-load-state--error" role="alert">
          <div className="page-load-state__content">
            <span className="page-load-state__marker" aria-hidden="true" />
            <h2>Page unavailable</h2>
            <p>This page could not be loaded. Reload the application to try again.</p>
            <button className="page-load-state__action" type="button" onClick={onReload}>
              Reload application
            </button>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
