import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('Matchday Command Base Application', () => {
  it('renders Matchday Command title and tagline', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Matchday Command' })).toBeInTheDocument();
    expect(screen.getAllByText(/GenAI stadium operations/i)[0]).toBeInTheDocument();
  });

  it('renders the Fan Assistant page when navigation tab is clicked', () => {
    render(<App />);
    const fanAssistantTab = screen.getByRole('button', { name: 'Fan Assistant' });
    expect(fanAssistantTab).toBeInTheDocument();
    
    // Click the button using fireEvent
    fireEvent.click(fanAssistantTab);
    
    // Confirm the Fan Assistant heading renders
    expect(screen.getByRole('heading', { level: 3, name: 'Fan Operations Assistant' })).toBeInTheDocument();
  });
});
