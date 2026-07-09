import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
});
