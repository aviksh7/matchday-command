import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProjectDetails from '../pages/ProjectDetails';

describe('Project Details product explanation', () => {
  it('explains the product modes, Floodlit concept, evidence, and prototype boundary', () => {
    render(<ProjectDetails />);

    expect(screen.getByRole('heading', { level: 2, name: /One simulated venue snapshot/i })).toBeInTheDocument();
    expect(screen.getByText('Fan Mode')).toBeInTheDocument();
    expect(screen.getByText('Operations Mode')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Operate on Night. Read on Paper.' })).toBeInTheDocument();
    expect(screen.getByText('Node 22')).toBeInTheDocument();
    expect(screen.getByText('Strict TypeScript')).toBeInTheDocument();
    expect(screen.getByText('105 frontend / 19 backend / 124 total')).toBeInTheDocument();
    expect(screen.getByText(/locally derived service-queue pressure/i)).toBeInTheDocument();
    expect(screen.getByText(/no dispatch, publication, or operational authority/i)).toBeInTheDocument();
    expect(screen.getByText(/not affiliated with FIFA or venue operators/i)).toBeInTheDocument();
  });

  it('shows the deployed architecture, two Vertex AI roles, and deterministic fallback source labels', () => {
    render(<ProjectDetails />);

    expect(screen.getByText('Firebase Hosting')).toBeInTheDocument();
    expect(screen.getByText('Same-origin /api/**')).toBeInTheDocument();
    expect(screen.getByText('Cloud Run')).toBeInTheDocument();
    expect(screen.getByText('Vertex AI')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Fan Assistant' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Incident Support' })).toBeInTheDocument();
    expect(screen.getByText('Deterministic local fallback')).toBeInTheDocument();
    expect(screen.getByText(/Vertex AI via Cloud Run/)).toBeInTheDocument();
    expect(screen.getByText(/Local deterministic fallback/)).toBeInTheDocument();
  });

  it('uses descriptive external project links without evaluator score language', () => {
    render(<ProjectDetails />);

    const liveLink = screen.getByRole('link', { name: /Open the live Matchday Command application \(opens in a new tab\)/i });
    const repositoryLink = screen.getByRole('link', { name: /View the public Matchday Command repository \(opens in a new tab\)/i });

    expect(liveLink).toHaveAttribute('href', 'https://matchday-command-2026.web.app');
    expect(repositoryLink).toHaveAttribute('href', 'https://github.com/aviksh7/matchday-command');
    expect(liveLink).toHaveAttribute('target', '_blank');
    expect(repositoryLink).toHaveAttribute('target', '_blank');
    expect(liveLink).toHaveAttribute('rel', 'noreferrer');
    expect(repositoryLink).toHaveAttribute('rel', 'noreferrer');
    expect(document.body).not.toHaveTextContent(/impact level|very high impact|planned implementation/i);
  });
});
