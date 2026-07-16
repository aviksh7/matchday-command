import React, { lazy, Suspense } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PageLoadBoundary, PageLoadingState } from '../components/PageLoadBoundary';
import { loadPageModule } from '../logic/pageLoader';

const createControlledPromise = <Value,>() => {
  let resolvePromise!: (value: Value) => void;
  let rejectPromise!: (reason: unknown) => void;
  const promise = new Promise<Value>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  return { promise, resolve: resolvePromise, reject: rejectPromise };
};

describe('PageLoadBoundary', () => {
  it('shows an accessible loading state until the lazy page resolves', async () => {
    const controlled = createControlledPromise<{ default: React.FC }>();
    const LazyTestPage = lazy(() => loadPageModule(controlled.promise));

    render(
      <PageLoadBoundary>
        <Suspense fallback={<PageLoadingState />}>
          <LazyTestPage />
        </Suspense>
      </PageLoadBoundary>,
    );

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('Loading page…');

    await act(async () => {
      controlled.resolve({ default: () => <h2>Controlled lazy page</h2> });
    });

    expect(await screen.findByRole('heading', { name: 'Controlled lazy page' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows safe recovery UI for a tagged import failure and calls the reload action', async () => {
    const controlled = createControlledPromise<{ default: React.FC }>();
    const LazyTestPage = lazy(() => loadPageModule(controlled.promise));
    const reload = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <PageLoadBoundary onReload={reload}>
        <Suspense fallback={<PageLoadingState />}>
          <LazyTestPage />
        </Suspense>
      </PageLoadBoundary>,
    );

    await act(async () => {
      controlled.reject(new Error('https://assets.example/internal-page.js failed'));
    });

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Page unavailable');
    expect(alert).toHaveTextContent('This page could not be loaded. Reload the application to try again.');
    expect(alert).not.toHaveTextContent('assets.example');

    fireEvent.click(screen.getByRole('button', { name: 'Reload application' }));
    expect(reload).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });

  it('does not convert ordinary render failures into chunk-load copy', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const BrokenPage = () => {
      throw new Error('Ordinary render failure');
    };

    expect(() => render(
      <PageLoadBoundary>
        <BrokenPage />
      </PageLoadBoundary>,
    )).toThrow('Ordinary render failure');

    expect(screen.queryByText('Page unavailable')).not.toBeInTheDocument();
    consoleError.mockRestore();
  });
});
