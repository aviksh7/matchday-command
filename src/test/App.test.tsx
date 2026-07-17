import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

  it('provides skip navigation and moves focus to the main landmark after page changes', async () => {
    render(<App />);

    const skipLink = screen.getByRole('link', { name: 'Skip to main content' });
    const main = screen.getByRole('main');
    expect(skipLink).toHaveAttribute('href', '#main-content');
    expect(main).toHaveAttribute('id', 'main-content');
    expect(main).toHaveAttribute('tabindex', '-1');

    fireEvent.click(skipLink);
    expect(main).toHaveFocus();

    fireEvent.click(screen.getByRole('button', { name: 'Fan Assistant' }));
    expect(await screen.findByRole('heading', { level: 2, name: 'Fan Operations Assistant' })).toBeInTheDocument();
    await waitFor(() => expect(main).toHaveFocus());
    expect(document.title).toBe('Fan Assistant | Matchday Command');
  });

  it('moves focus into the open mobile menu and returns it on Escape', async () => {
    render(<App />);

    const menuButton = screen.getByRole('button', { name: 'Menu' });
    fireEvent.click(menuButton);

    await waitFor(() => expect(screen.getByRole('button', { name: 'Home' })).toHaveFocus());
    fireEvent.keyDown(screen.getByRole('navigation', { name: 'Primary navigation' }), { key: 'Escape' });

    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(menuButton).toHaveFocus();
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

  it('carries a selected map incident into Incident Support and clears it on direct navigation', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Open Crowd Map' }));
    const mapVenueSelect = await screen.findByLabelText(/Select Venue View/i);
    fireEvent.change(mapVenueSelect, { target: { value: 'mexico-demo' } });
    fireEvent.click(screen.getByRole('button', { name: /Incident INC-302/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Open Incident Support' }));

    expect(await screen.findByLabelText(/Select Venue View/i)).toHaveValue('mexico-demo');
    expect(screen.getByRole('button', { name: 'Review incident INC-302' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { level: 3, name: 'Decision Support Detail: INC-302' })).toBeInTheDocument();
    expect(screen.getByRole('note', { name: 'Map handoff context' })).toHaveTextContent(
      'Map context loaded: Mexico City Stadium Demo, incident INC-302.',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Incident Support' }));

    expect(await screen.findByLabelText(/Select Venue View/i)).toHaveValue('toronto-demo');
    expect(screen.getByRole('button', { name: 'Review incident INC-201' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('heading', { level: 3, name: 'Incident Details & Decision Support' })).toBeInTheDocument();
    expect(screen.queryByRole('note', { name: 'Map handoff context' })).not.toBeInTheDocument();
  });
});
