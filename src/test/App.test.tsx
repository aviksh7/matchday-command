import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('Matchday Command Base Application', () => {
  it('renders Matchday Command title and tagline', () => {
    render(<App />);
    expect(screen.getByText('Matchday Command')).toBeInTheDocument();
    expect(screen.getByText(/GenAI stadium operations/i)).toBeInTheDocument();
  });
});
