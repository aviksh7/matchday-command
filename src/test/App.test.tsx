import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('Matchday Command Base Application', () => {
  it('renders Matchday Command title and tagline', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Matchday Command' })).toBeInTheDocument();
    expect(screen.getAllByText(/GenAI stadium operations/i)[0]).toBeInTheDocument();
  });
});
