import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CrowdMap from '../pages/CrowdMap';

describe('Crowd Map UI Dashboard Component', () => {
  it('renders the Crowd Map header and selector', () => {
    render(<CrowdMap />);
    expect(screen.getByRole('heading', { level: 2, name: /Simulated Venue Operations Map/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Select Venue View/i)).toBeInTheDocument();
  });

  it('renders the simulated disclaimer clearly', () => {
    render(<CrowdMap />);
    const disclaimer = screen.getByRole('alert');
    expect(disclaimer).toBeInTheDocument();
    expect(disclaimer.textContent).toContain('simulated prototype data');
    expect(disclaimer.textContent).toContain('does not access external FIFA');
  });

  it('renders the custom SVG map layout with legend and guidance cards', () => {
    render(<CrowdMap />);
    
    // Check that SVG is rendered (find by test-id, or name/role, or tag name)
    const svgElement = screen.getByTitle('Simulated Stadium Crowd Density Map');
    expect(svgElement).toBeInTheDocument();

    // Check legend items
    expect(screen.getByText('Low Occupancy (Normal)')).toBeInTheDocument();
    expect(screen.getByText('Critical Occupancy')).toBeInTheDocument();

    // Check guidance cards title
    expect(screen.getByRole('heading', { level: 3, name: 'Simulated Safer Movement Guidance' })).toBeInTheDocument();
  });

  it('updates map details when selecting a different venue', () => {
    render(<CrowdMap />);

    // Selector element
    const selectDropdown = screen.getByLabelText(/Select Venue View/i);
    expect(selectDropdown).toBeInTheDocument();

    // Default venue is Toronto. Check for Toronto-specific details
    expect(screen.getByText(/Toronto Stadium Demo/i)).toBeInTheDocument();
    
    // Select Mexico City Stadium Demo
    fireEvent.change(selectDropdown, { target: { value: 'mexico-demo' } });

    // Verify view has updated to Mexico City
    expect(screen.getAllByText(/Lower Ring/i).length).toBeGreaterThan(0);
  });
});
