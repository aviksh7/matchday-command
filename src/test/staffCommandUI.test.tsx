import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import StaffCommand from '../pages/StaffCommand';

describe('Staff Command Center UI Dashboard Component', () => {
  it('renders the Staff Command header and active venue overview', () => {
    render(<StaffCommand />);
    expect(screen.getByRole('heading', { level: 2, name: /Staff Command Center/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Select Venue View/i)).toBeInTheDocument();
  });

  it('renders the simulated disclaimer clearly', () => {
    render(<StaffCommand />);
    const disclaimer = screen.getByRole('alert');
    expect(disclaimer).toBeInTheDocument();
    expect(disclaimer.textContent).toContain('simulated prototype data');
    expect(disclaimer.textContent).toContain('does not access external FIFA');
  });

  it('shows service queue pressure from the selected local simulated venue snapshot', () => {
    render(<StaffCommand />);

    expect(screen.getByRole('heading', { level: 3, name: 'Simulated Service Queue Pressure' })).toBeInTheDocument();
    expect(screen.getByText('Local simulated snapshot, not live')).toBeInTheDocument();
    expect(screen.getByText(/Not connected to concession, restroom, or wait-time sensors/i)).toBeInTheDocument();

    const table = screen.getByRole('table', { name: /Simulated service waits for Toronto Stadium Demo/i });
    const headers = within(table).getAllByRole('columnheader');
    expect(headers.map(header => header.textContent)).toEqual(['Location', 'Service', 'Simulated wait', 'Pressure']);
    headers.forEach(header => expect(header).toHaveAttribute('scope', 'col'));

    const foodRow = within(table).getByRole('row', { name: /Maple Grills Sec 102 Food 12 min Elevated pressure/i });
    expect(within(foodRow).getByRole('rowheader')).toHaveAttribute('scope', 'row');

    expect(within(table).getByRole('row', { name: /Restroom Block Sec 108 Restroom 4 min Low pressure/i })).toBeInTheDocument();
    expect(within(table).getByRole('row', { name: /Merch Stand North Merchandise 18 min Elevated pressure/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'Simulated sustainability indicators' })).toBeInTheDocument();
    expect(screen.getByText('Green Transit Encouragement Indicator')).toBeInTheDocument();
  });

  it('updates simulated queue waits and pressure bands when the venue changes', () => {
    render(<StaffCommand />);

    fireEvent.change(screen.getByLabelText(/Select Venue View/i), {
      target: { value: 'mexico-demo' },
    });

    const table = screen.getByRole('table', { name: /Simulated service waits for Mexico City Stadium Demo/i });
    expect(within(table).getByRole('row', { name: /Taco Plaza Sec 120 Food 25 min High pressure/i })).toBeInTheDocument();
    expect(within(table).getByRole('row', { name: /Restroom Block Sec 134 Restroom 15 min Elevated pressure/i })).toBeInTheDocument();
    expect(within(table).getByRole('row', { name: /Official Souvenirs Plaza Merchandise 30 min High pressure/i })).toBeInTheDocument();
    expect(screen.queryByText('Maple Grills Sec 102')).not.toBeInTheDocument();
  });

  it('synchronizes incidents and clears the selection when the venue changes', async () => {
    render(<StaffCommand />);

    fireEvent.click(screen.getByText('INC-201'));
    expect(screen.getByText(/Simulated Incident Details: INC-201/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Select Venue View/i), {
      target: { value: 'mexico-demo' },
    });

    expect(await screen.findByText('INC-301')).toBeInTheDocument();
    expect(screen.queryByText('INC-201')).not.toBeInTheDocument();
    expect(screen.queryByText(/Simulated Incident Details: INC-201/i)).not.toBeInTheDocument();
  });

  it('allows selecting an incident and changing its status locally', () => {
    render(<StaffCommand />);
    
    // Find an incident in the list (e.g. incident rows or cells)
    // Let's search by text or by clicking the incident row
    const incidentRow = screen.getByText('INC-201');
    expect(incidentRow).toBeInTheDocument();
    
    // Click the incident row to select it and open the detail panel
    fireEvent.click(incidentRow);
    
    // The details panel should now be visible
    expect(screen.getByText(/Simulated Incident Details: INC-201/i)).toBeInTheDocument();
    
    // Find the status change buttons
    const dispatchButton = screen.getByRole('button', { name: 'Dispatched' });
    expect(dispatchButton).toBeInTheDocument();
    
    // Click to change status to Dispatched
    fireEvent.click(dispatchButton);
    
    // Confirm status is now Dispatched inside the detail panel
    expect(screen.getAllByText('Dispatched').length).toBeGreaterThan(0);
    
    // The button for Dispatched should now be disabled since it is the active status
    expect(dispatchButton).toBeDisabled();
  });

  it('resets local incident status when leaving and returning to a venue', async () => {
    render(<StaffCommand />);

    fireEvent.click(screen.getByRole('button', { name: /View incident INC-201 details/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Dispatched' }));
    expect(screen.getByRole('button', { name: 'Dispatched' })).toBeDisabled();

    const venueSelect = screen.getByLabelText(/Select Venue View/i);
    fireEvent.change(venueSelect, { target: { value: 'mexico-demo' } });
    fireEvent.change(venueSelect, { target: { value: 'toronto-demo' } });

    fireEvent.click(await screen.findByRole('button', { name: /View incident INC-201 details/i }));
    expect(screen.getByRole('button', { name: 'Open' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Dispatched' })).toBeEnabled();
  });

  it('exposes incident selection as a focusable native keyboard control', () => {
    render(<StaffCommand />);

    const selectIncident = screen.getByRole('button', { name: /View incident INC-201 details/i });
    expect(selectIncident.tagName).toBe('BUTTON');
    expect(selectIncident).toHaveAttribute('type', 'button');

    selectIncident.focus();
    expect(selectIncident).toHaveFocus();

    fireEvent.click(selectIncident);
    expect(screen.getByText(/Simulated Incident Details: INC-201/i)).toBeInTheDocument();
  });

  it('labels the incident table with a useful caption and scoped column headers', () => {
    render(<StaffCommand />);

    const table = screen.getByRole('table', { name: /Simulated incidents for Toronto Stadium Demo/i });
    const headers = within(table).getAllByRole('columnheader');

    expect(headers).toHaveLength(4);
    headers.forEach(header => expect(header).toHaveAttribute('scope', 'col'));
  });

  it('provides narrow-layout hooks without an inline minimum-width grid', () => {
    const { container } = render(<StaffCommand />);

    expect(container.firstElementChild).toHaveClass('staff-command');

    const grid = container.querySelector('.staff-command__grid');
    expect(grid).toBeInTheDocument();
    expect(grid).not.toHaveAttribute('style');

    const columns = container.querySelectorAll('.staff-command__column');
    expect(columns).toHaveLength(2);
    columns.forEach(column => expect(column).not.toHaveAttribute('style'));

    expect(container.querySelector('.staff-command__table-scroll')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Scrollable simulated service queue table' })).toHaveAttribute('tabindex', '0');
  });
});
