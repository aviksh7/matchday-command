import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '../pages/Home';
import StadiumMap from '../components/StadiumMap';
import { ACCESSIBILITY_ROUTES } from '../data/stadiumGeometry';
import { SIMULATED_VENUES } from '../data/mockData';

describe('Shared page accessibility semantics', () => {
  it('associates the Home mode section with its visible heading', () => {
    render(<Home setCurrentPage={vi.fn()} openCrowdMap={vi.fn()} />);

    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'One venue snapshot, built for the people moving through it.',
    });
    const section = screen.getByRole('region', {
      name: 'One venue snapshot, built for the people moving through it.',
    });

    expect(heading).toHaveAttribute('id', 'mode-split-title');
    expect(section).toHaveAttribute('aria-labelledby', 'mode-split-title');
    expect(section).toHaveTextContent(
      'Night carries the home, map and fan-guidance workspace. Paper supports operational tables, incident drafts and other detail that benefits from careful reading.'
    );
  });

  it('renders a simulated accessibility route for every open accessibility-ready gate', () => {
    const venue = {
      ...SIMULATED_VENUES[0],
      gates: SIMULATED_VENUES[0].gates.map(gate => (
        gate.id === 'gate-d' ? { ...gate, accessibleReady: true } : gate
      )),
    };
    const { container } = render(<StadiumMap venue={venue} selection={null} onSelect={vi.fn()} />);

    const visibleRoutes = container.querySelectorAll(
      'path.map-accessibility-route:not(.map-accessibility-route--underlay)'
    );
    const routeUnderlays = container.querySelectorAll('path.map-accessibility-route--underlay');

    expect(Array.from(visibleRoutes, route => route.getAttribute('d'))).toEqual([
      ACCESSIBILITY_ROUTES[0],
      ACCESSIBILITY_ROUTES[2],
    ]);
    expect(routeUnderlays).toHaveLength(2);
  });
});
