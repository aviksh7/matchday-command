import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import IncidentSupport from '../pages/IncidentSupport';

describe('Incident Support API Integration & Fallback Flow', () => {
  let fetchMock: any;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders Vertex AI via Cloud Run response when incident is selected and API succeeds', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        situationSummary: 'AI analysis of spill incident.',
        priorityLevel: 'High',
        recommendedActions: ['Isolate concourse section', 'Deploy janitorial crew'],
        volunteerBriefing: 'Keep fans 10 meters back.',
        fanAnnouncementDraft: 'Please use alternate concourse path.',
        accessibilityNote: 'Ramp 2 clear for accessible egress.',
        crowdTransitNote: 'No impact on Gate A flow.',
        simulatedDataUsed: ['Concourse Sec 102 Telemetry'],
        limitations: 'Simulated data only.'
      })
    });

    render(<IncidentSupport />);

    // Click INC-201
    const incidentRowId = screen.getByText('INC-201');
    fireEvent.click(incidentRowId);

    await waitFor(() => {
      expect(screen.getByText('AI analysis of spill incident.')).toBeInTheDocument();
      expect(screen.getByText(/Vertex AI via Cloud Run/i, { selector: '.incident-source' })).toBeInTheDocument();
      expect(screen.getByText('Simulated data only.')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent(
        'Decision-support draft ready for incident INC-201. Source: Vertex AI via Cloud Run. Limitations: Simulated data only.'
      );
    });

    const invariantLimitations = screen.getByText(/Qualified human review is required/i);
    expect(invariantLimitations).toHaveTextContent(/does not dispatch staff/i);
    expect(invariantLimitations).toHaveTextContent(/publish announcements/i);
    expect(invariantLimitations).toHaveTextContent(/official authority/i);
  });

  it('switches to Local deterministic fallback on network or server error', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network disconnected'));

    render(<IncidentSupport />);

    const incidentRowId = screen.getByText('INC-201');
    fireEvent.click(incidentRowId);

    await waitFor(() => {
      expect(screen.getByText(/Local deterministic fallback/i, { selector: '.incident-source' })).toBeInTheDocument();
      expect(screen.getByText(/Network error or connection failure/i)).toBeInTheDocument();
    });
  });

  it('switches to Local deterministic fallback on malformed JSON response schema', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        invalidKey: 'missing situationSummary and recommendedActions array'
      })
    });

    render(<IncidentSupport />);

    const incidentRowId = screen.getByText('INC-201');
    fireEvent.click(incidentRowId);

    await waitFor(() => {
      expect(screen.getByText(/Local deterministic fallback/i, { selector: '.incident-source' })).toBeInTheDocument();
      expect(screen.getByText(/Response did not match expected schema/i)).toBeInTheDocument();
    });
  });

  it('displays loading state and disables inputs while request is pending', async () => {
    let resolveFetch: (val: any) => void = () => {};
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    fetchMock.mockReturnValue(fetchPromise);

    render(<IncidentSupport />);

    const scenarioTypeSelect = screen.getByLabelText(/Incident Type:/i);
    const generateBtn = screen.getByRole('button', { name: /Generate Simulated Decision-Support Draft/i });
    const venueSelect = screen.getByLabelText(/Select Venue View/i);

    fireEvent.click(generateBtn);

    // Should immediately show loading
    expect(screen.getByText(/Generating Vertex AI guidance via Cloud Run/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Generating decision-support guidance for incident SCEN-MOCK via Vertex AI.'
    );
    const pendingPanel = screen.getByRole('heading', {
      level: 3,
      name: /Decision Support Detail: SCEN-MOCK/i
    }).closest('section');
    expect(pendingPanel).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText(/Situation Summary:/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Decision-Support Limitations/i })).not.toBeInTheDocument();
    expect(generateBtn).toBeDisabled();
    expect(scenarioTypeSelect).toBeDisabled();
    expect(venueSelect).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Dispatched' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Resolved' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Review incident INC-201/i })).not.toBeDisabled();

    resolveFetch({
      ok: true,
      json: async () => ({
        situationSummary: 'Scenario AI summary.',
        priorityLevel: 'Medium',
        recommendedActions: ['Action 1'],
        volunteerBriefing: 'Briefing text.',
        fanAnnouncementDraft: 'Draft text.',
        accessibilityNote: 'Note.',
        crowdTransitNote: 'Transit.',
        simulatedDataUsed: ['Scenario Data'],
        limitations: 'Simulated data only.'
      })
    });

    await waitFor(() => {
      expect(screen.getByText('Scenario AI summary.')).toBeInTheDocument();
      expect(generateBtn).not.toBeDisabled();
      expect(pendingPanel).toHaveAttribute('aria-busy', 'false');
      expect(screen.getByRole('status')).toHaveTextContent(
        'Decision-support draft ready for incident SCEN-MOCK. Source: Vertex AI via Cloud Run. Limitations: Simulated data only.'
      );
    });
  });

  it('ignores stale response if another incident is selected while request is pending', async () => {
    let resolveFirstFetch: (val: any) => void = () => {};
    const firstFetchPromise = new Promise((resolve) => {
      resolveFirstFetch = resolve;
    });

    let resolveSecondFetch: (val: any) => void = () => {};
    const secondFetchPromise = new Promise((resolve) => {
      resolveSecondFetch = resolve;
    });

    fetchMock
      .mockReturnValueOnce(firstFetchPromise)
      .mockReturnValueOnce(secondFetchPromise);

    render(<IncidentSupport />);

    // Switch to Mexico City venue which has INC-301 and INC-302
    const venueSelect = screen.getByLabelText(/Select Venue View/i);
    fireEvent.change(venueSelect, { target: { value: 'mexico-demo' } });

    // Click INC-301 first
    const inc301 = screen.getByText('INC-301');
    fireEvent.click(inc301);

    // Immediately click INC-302 while INC-301 fetch is in flight
    const inc302 = screen.getByText('INC-302');
    fireEvent.click(inc302);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
    expect(fetchMock.mock.calls[1][1].signal.aborted).toBe(false);

    // Resolve second query (INC-302)
    resolveSecondFetch({
      ok: true,
      json: async () => ({
        situationSummary: 'INC-302 AI Response.',
        priorityLevel: 'High',
        recommendedActions: ['INC-302 Action'],
        volunteerBriefing: 'INC-302 Briefing.',
        fanAnnouncementDraft: 'INC-302 Announcement.',
        accessibilityNote: 'INC-302 Note.',
        crowdTransitNote: 'INC-302 Transit.',
        simulatedDataUsed: ['INC-302 Telemetry'],
        limitations: 'Simulated data only.'
      })
    });

    await waitFor(() => {
      expect(screen.getByText('INC-302 AI Response.')).toBeInTheDocument();
    });

    // Now resolve the stale first query (INC-301) with distinct text
    const staleJson = vi.fn().mockResolvedValue({
      situationSummary: 'STALE INC-301 AI Response that should be ignored.',
      priorityLevel: 'Medium',
      recommendedActions: ['STALE Action'],
      volunteerBriefing: 'STALE Briefing.',
      fanAnnouncementDraft: 'STALE Announcement.',
      accessibilityNote: 'STALE Note.',
      crowdTransitNote: 'STALE Transit.',
      simulatedDataUsed: ['STALE Telemetry'],
      limitations: 'Simulated data only.'
    });

    resolveFirstFetch({
      ok: true,
      json: staleJson
    });

    // Yield until the stale response has actually traversed the async parser,
    // then verify it cannot overwrite the current incident.
    await waitFor(() => {
      expect(staleJson).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('STALE INC-301 AI Response that should be ignored.')).not.toBeInTheDocument();
      expect(screen.getByText('INC-302 AI Response.')).toBeInTheDocument();
    });
  });
});
