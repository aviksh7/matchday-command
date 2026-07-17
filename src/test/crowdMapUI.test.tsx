import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CrowdMap from '../pages/CrowdMap';
import { SIMULATED_VENUES } from '../data/mockData';

describe('Crowd Map UI Dashboard Component', () => {
  it('renders the Crowd Map header and selector', () => {
    render(<CrowdMap />);
    expect(screen.getByRole('heading', { level: 2, name: /Simulated Venue Operations Map/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Select Venue View/i)).toBeInTheDocument();
  });

  it('renders the simulated disclaimer clearly', () => {
    render(<CrowdMap />);
    const disclaimer = screen.getByRole('note', { name: 'Simulated map notice' });
    expect(disclaimer).toBeInTheDocument();
    expect(disclaimer.textContent).toContain('simulated prototype data');
    expect(disclaimer.textContent).toContain('does not access external FIFA');
  });

  it('renders the custom SVG map layout with legend and guidance cards', () => {
    render(<CrowdMap />);
    
    // Check that SVG is rendered (find by test-id, or name/role, or tag name)
    const svgElement = screen.getByTitle('Simulated Stadium Crowd Density Map');
    expect(svgElement).toBeInTheDocument();
    const mapGroup = screen.getByRole('group', { name: 'Simulated Stadium Crowd Density Map' });
    expect(mapGroup).toContainElement(svgElement);
    expect(mapGroup).toHaveAccessibleDescription(/Interactive prototype map with four crowd districts/i);
    expect(screen.getByRole('region', { name: 'Scrollable simulated stadium map' })).toHaveAttribute(
      'aria-describedby',
      'map-scroll-instructions',
    );

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
    expect(screen.getAllByText(/Toronto Stadium Demo/i).length).toBeGreaterThan(0);
    
    // Select Mexico City Stadium Demo
    fireEvent.change(selectDropdown, { target: { value: 'mexico-demo' } });

    // Verify view has updated to Mexico City
    expect(screen.getAllByText(/Lower Ring/i).length).toBeGreaterThan(0);
  });

  it('selects a map district with a pointer and updates the context panel', () => {
    render(<CrowdMap />);

    fireEvent.click(screen.getByRole('button', { name: /North Concourse district/i }));

    expect(screen.getByRole('heading', { level: 3, name: 'North Concourse' })).toBeInTheDocument();
    expect(screen.getByRole('meter', { name: 'Simulated occupancy' })).toHaveAttribute('aria-valuenow', '55');
  });

  it('supports Enter and Space map selection plus Escape to clear', () => {
    render(<CrowdMap />);

    const southDistrict = screen.getByRole('button', { name: /South Concourse district/i });
    fireEvent.keyDown(southDistrict, { key: 'Enter' });
    expect(screen.getByRole('heading', { level: 3, name: 'South Concourse' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Selected South Concourse district. High simulated density at 78% occupancy.',
    );

    const gate = screen.getByRole('button', { name: /Gate A \(Main\) gate/i });
    fireEvent.keyDown(gate, { key: ' ' });
    expect(screen.getByRole('heading', { level: 3, name: 'Gate A (Main)' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Selected Gate A (Main). Open with 82% simulated pressure. Accessibility-ready.',
    );

    fireEvent.keyDown(gate, { key: 'Escape' });
    expect(screen.getByRole('heading', { level: 3, name: SIMULATED_VENUES[0].name })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Map selection cleared. Showing the Toronto Stadium Demo venue overview.',
    );
  });

  it('hands the selected simulated venue and incident to Incident Support', () => {
    const onOpenIncidentSupport = vi.fn();
    render(<CrowdMap onOpenIncidentSupport={onOpenIncidentSupport} />);

    fireEvent.click(screen.getByRole('button', { name: /Incident INC-201/i }));
    expect(screen.getByRole('heading', { level: 3, name: 'Spill Hazard' })).toBeInTheDocument();
    expect(screen.getByText(/will preselect this simulated venue and incident/i)).toBeInTheDocument();
    expect(screen.getByText(/no operational system is contacted/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Open Incident Support' }));
    expect(onOpenIncidentSupport).toHaveBeenCalledOnce();
    expect(onOpenIncidentSupport).toHaveBeenCalledWith('toronto-demo', 'INC-201');
  });
});
