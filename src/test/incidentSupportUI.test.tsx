import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import IncidentSupport from '../pages/IncidentSupport';

describe('Incident Support UI Dashboard Component', () => {
  it('renders the Incident Support header and selector', () => {
    render(<IncidentSupport />);
    expect(screen.getByRole('heading', { level: 2, name: /Incident Decision Support Center/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Select Venue View/i)).toBeInTheDocument();
  });

  it('renders the simulated disclaimer clearly', () => {
    render(<IncidentSupport />);
    const disclaimer = screen.getByRole('alert');
    expect(disclaimer).toBeInTheDocument();
    expect(disclaimer.textContent).toContain('simulated prototype data');
    expect(disclaimer.textContent).toContain('does not access external FIFA');
  });

  it('supports selecting an incident and showing the decision support details', () => {
    render(<IncidentSupport />);

    // Click on a row inside the incident queue
    const incidentRowId = screen.getByText('INC-201');
    expect(incidentRowId).toBeInTheDocument();
    fireEvent.click(incidentRowId);

    // Verify detail panel headers render
    expect(screen.getByRole('heading', { level: 3, name: /Decision Support Detail: INC-201/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Active incident INC-201/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/staff briefing/i).length).toBeGreaterThan(0);
  });

  it('supports local scenario builder to create a custom plan', () => {
    render(<IncidentSupport />);

    // Scenario builder form inputs
    const typeSelect = screen.getByLabelText(/Incident Type:/i);
    const locationInput = screen.getByLabelText(/Location:/i);
    const severitySelect = screen.getByLabelText(/Severity Level:/i);
    const submitButton = screen.getByRole('button', { name: /Generate Local Simulated Plan/i });

    expect(typeSelect).toBeInTheDocument();
    expect(locationInput).toBeInTheDocument();
    expect(severitySelect).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();

    // Populate the form fields
    fireEvent.change(typeSelect, { target: { value: 'Guest Health Support Request' } });
    fireEvent.change(locationInput, { target: { value: 'North Concourse Sec 108' } });
    fireEvent.change(severitySelect, { target: { value: 'High' } });

    // Submit scenario
    fireEvent.click(submitButton);

    // Verify mock incident ID SCEN-MOCK is selected and detailed in decision support panel
    expect(screen.getByRole('heading', { level: 3, name: /Decision Support Detail: SCEN-MOCK/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Guest Health Support Request/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/simulated North Concourse Sec 108/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/simulated severity level High/i).length).toBeGreaterThan(0);
  });

  it('ensures no visible UI elements claim live, real-time, official, emergency, ticketing, or API access', () => {
    render(<IncidentSupport />);
    const pageText = document.body.textContent || '';
    
    // Safety wording check
    const lowerText = pageText.toLowerCase();
    expect(lowerText).not.toContain('real-time');
    expect(lowerText).not.toContain('live systems');
    expect(lowerText).not.toContain('official dispatch');
    expect(lowerText).not.toContain('emergency response');
    expect(lowerText).not.toContain('api access');
    expect(lowerText).not.toContain('ticketing system');
  });
});
