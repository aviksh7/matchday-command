import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import IncidentSupport from '../pages/IncidentSupport';

describe('Incident Support UI Dashboard Component', () => {
  it('renders the Incident Support header and selector', () => {
    render(<IncidentSupport />);
    expect(screen.getByRole('heading', { level: 2, name: /Incident Decision Support Center/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Select Venue View/i)).toBeInTheDocument();
  });

  it('renders the simulated disclaimer clearly', () => {
    render(<IncidentSupport />);
    const disclaimer = screen.getByRole('note', { name: 'Simulated incident-support limitations' });
    expect(disclaimer).toBeInTheDocument();
    expect(disclaimer.textContent).toContain('simulated prototype data');
    expect(disclaimer.textContent).toContain('does not access external FIFA');
  });

  it('supports selecting an incident and showing the decision support details', async () => {
    render(<IncidentSupport />);

    const incidentControl = screen.getByRole('button', { name: /Review incident INC-201/i });
    fireEvent.click(incidentControl);

    // Wait for async API or fallback response to settle and loading state to clear
    await waitFor(() => {
      expect(screen.queryByText(/Generating Vertex AI guidance via Cloud Run/i)).not.toBeInTheDocument();
    });

    // Verify detail panel headers render
    expect(screen.getByRole('heading', { level: 3, name: /Decision Support Detail: INC-201/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Active incident INC-201/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/staff briefing/i).length).toBeGreaterThan(0);
  });

  it('uses a native focusable control for keyboard incident selection', async () => {
    render(<IncidentSupport />);

    const incidentControl = screen.getByRole('button', { name: /Review incident INC-201/i });
    expect(incidentControl.tagName).toBe('BUTTON');
    expect(incidentControl).toHaveAttribute('type', 'button');

    incidentControl.focus();
    expect(incidentControl).toHaveFocus();

    fireEvent.click(incidentControl);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 3, name: /Decision Support Detail: INC-201/i })).toBeInTheDocument();
    });
    expect(incidentControl).toHaveAttribute('aria-pressed', 'true');
  });

  it('provides a useful queue caption and scoped column headers', () => {
    render(<IncidentSupport />);

    expect(screen.getByText(/Simulated incidents for Toronto Stadium Demo/i, { selector: 'caption' })).toBeInTheDocument();
    const headers = screen.getAllByRole('columnheader');
    expect(headers.map((header) => header.textContent)).toEqual(['ID', 'Type', 'Severity', 'Status']);
    headers.forEach((header) => expect(header).toHaveAttribute('scope', 'col'));
  });

  it('keeps incident status changes local to the selected ticket', async () => {
    render(<IncidentSupport />);

    fireEvent.click(screen.getByRole('button', { name: /Review incident INC-201/i }));
    const dispatchedButton = await screen.findByRole('button', { name: 'Dispatched' });
    fireEvent.click(dispatchedButton);

    expect(dispatchedButton).toBeDisabled();
    expect(screen.getByRole('row', { name: /INC-201 Spill Hazard Medium Dispatched/i })).toBeInTheDocument();
  });

  it('supports local scenario builder to create a custom plan', async () => {
    render(<IncidentSupport />);

    // Scenario builder form inputs
    const typeSelect = screen.getByLabelText(/Incident Type:/i);
    const locationInput = screen.getByLabelText(/Location:/i);
    const severitySelect = screen.getByLabelText(/Severity Level:/i);
    const submitButton = screen.getByRole('button', { name: /Generate Simulated Decision-Support Draft/i });

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

    // Wait for async API or fallback response to settle and loading state to clear
    await waitFor(() => {
      expect(screen.queryByText(/Generating Vertex AI guidance via Cloud Run/i)).not.toBeInTheDocument();
    });

    // Verify mock incident ID SCEN-MOCK is selected and detailed in decision support panel
    expect(screen.getByRole('heading', { level: 3, name: /Decision Support Detail: SCEN-MOCK/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Guest Health Support Request/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/simulated North Concourse Sec 108/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/simulated severity level High/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { level: 4, name: /Decision-Support Limitations/i })).toBeInTheDocument();
    expect(screen.getAllByText(/qualified human review|review by qualified people/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/does not dispatch staff/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/publish announcements/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/official authority/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('group', { name: /Local Status/i })).toHaveAttribute('aria-describedby', 'incident-status-note');
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

  it('renders responsive containment hooks for narrow layouts', () => {
    const { container } = render(<IncidentSupport />);

    expect(container.querySelector('.incident-support')).toBeInTheDocument();
    expect(container.querySelector('.incident-support__layout')).toBeInTheDocument();
    expect(container.querySelectorAll('.incident-support__column')).toHaveLength(2);
    expect(container.querySelector('.incident-table-shell')).toBeInTheDocument();
    expect(container.querySelector('.incident-support')).not.toHaveAttribute('style');
    expect(container.querySelector('.incident-support__layout')).not.toHaveAttribute('style');
  });
});
