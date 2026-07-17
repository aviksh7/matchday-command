import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('Matchday Command Base Application', () => {
  it('renders Matchday Command title and tagline', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Matchday Command' })).toBeInTheDocument();
    expect(screen.getAllByText(/GenAI stadium operations/i)[0]).toBeInTheDocument();
  });

  it('renders the Fan Assistant page when navigation tab is clicked', async () => {
    render(<App />);
    const fanAssistantTab = screen.getByRole('button', { name: 'Fan Assistant' });
    expect(fanAssistantTab).toBeInTheDocument();
    
    // Click the button using fireEvent
    fireEvent.click(fanAssistantTab);
    
    // Confirm the Fan Assistant heading renders
    expect(await screen.findByRole('heading', { level: 2, name: 'Fan Operations Assistant' })).toBeInTheDocument();
  });

  it('renders the persistent simulation strip', () => {
    render(<App />);
    expect(screen.getByText(/SIMULATED PROTOTYPE — venue, crowd, transit and incident data are simulated/i)).toBeInTheDocument();
    expect(screen.getByText(/No external operational systems are connected/i)).toBeInTheDocument();
  });

  it('exposes mobile navigation state and returns to Home through the brand control', async () => {
    render(<App />);

    const menuButton = screen.getByRole('button', { name: 'Menu' });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Fan Assistant' }));
    expect(await screen.findByRole('heading', { level: 2, name: 'Fan Operations Assistant' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Matchday Command home' }));
    expect(await screen.findByRole('heading', { level: 2, name: /See the whole matchday/i })).toBeInTheDocument();
  });

  it('navigates from the homepage CTAs to Crowd Map and Fan Assistant', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Open Crowd Map' }));
    expect(await screen.findByRole('heading', { level: 2, name: 'Simulated Venue Operations Map' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Home' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ask Fan Assistant' }));
    expect(await screen.findByRole('heading', { level: 2, name: 'Fan Operations Assistant' })).toBeInTheDocument();
  });

  it('hands the selected homepage venue to Crowd Map without synchronizing page state globally', async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('Venue view'), { target: { value: 'mexico-demo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Open this venue map' }));

    expect(await screen.findByLabelText(/Select Venue View/i)).toHaveValue('mexico-demo');
  });
});
