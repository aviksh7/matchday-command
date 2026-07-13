import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FanAssistant from '../pages/FanAssistant';

describe('Fan Assistant API Integration & Fallback Flow', () => {
  let fetchMock: any;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders Vertex AI via Cloud Run response on successful API call', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        summary: 'Cloud Run Vertex AI guidance answer.',
        recommendedAction: 'Dispatch concourse team.',
        simulatedDataUsed: ['Gate A Pressure 88%'],
        limitations: 'Simulated data only.'
      })
    });

    render(<FanAssistant />);

    const quickPrompt = screen.getByText(/Find the least crowded gate/i);
    fireEvent.click(quickPrompt);

    await waitFor(() => {
      expect(screen.getByText('Cloud Run Vertex AI guidance answer.')).toBeInTheDocument();
      expect(screen.getByText('Dispatch concourse team.')).toBeInTheDocument();
      expect(screen.getByText(/Vertex AI via Cloud Run/i)).toBeInTheDocument();
    });
  });

  it('switches to Local deterministic fallback on server error or network failure', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network offline'));

    render(<FanAssistant />);

    const quickPrompt = screen.getByText(/Find lowest queue concession/i);
    fireEvent.click(quickPrompt);

    await waitFor(() => {
      expect(screen.getByText(/Local deterministic fallback/i)).toBeInTheDocument();
      expect(screen.getByText(/Network error or connection failure/i)).toBeInTheDocument();
    });
  });

  it('switches to Local deterministic fallback on malformed JSON or invalid schema response', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        unexpectedKey: 'missing summary and action'
      })
    });

    render(<FanAssistant />);

    const quickPrompt = screen.getByText(/Get accessibility guidance/i);
    fireEvent.click(quickPrompt);

    await waitFor(() => {
      expect(screen.getByText(/Local deterministic fallback/i)).toBeInTheDocument();
      expect(screen.getByText(/Response did not match expected schema/i)).toBeInTheDocument();
    });
  });

  it('displays loading state and prevents duplicate submission while request is in flight', async () => {
    let resolveFetch: (val: any) => void = () => {};
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    fetchMock.mockReturnValue(fetchPromise);

    render(<FanAssistant />);

    const input = screen.getByPlaceholderText(/Ask about gates/i);
    const sendButton = screen.getByRole('button', { name: /Send/i });

    fireEvent.change(input, { target: { value: 'How crowded is Gate A?' } });
    fireEvent.click(sendButton);

    // Should immediately show loading
    expect(screen.getByText(/Generating guidance via Vertex AI/i)).toBeInTheDocument();
    expect(sendButton).toBeDisabled();
    expect(input).toBeDisabled();

    // Try clicking send or quick prompt again while loading
    const quickPrompt = screen.getByText(/Find the least crowded gate/i);
    expect(quickPrompt).toBeDisabled();
    fireEvent.click(quickPrompt);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveFetch({
      ok: true,
      json: async () => ({
        summary: 'Gate A is at 90% capacity.',
        recommendedAction: 'Use Gate D.',
        simulatedDataUsed: ['Gate A'],
        limitations: 'Simulated'
      })
    });

    await waitFor(() => {
      expect(screen.getByText('Gate A is at 90% capacity.')).toBeInTheDocument();
      expect(sendButton).not.toBeDisabled();
    });
  });

  it('ignores stale response if venue changes while request is pending', async () => {
    let resolveFetch: (val: any) => void = () => {};
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    fetchMock.mockReturnValue(fetchPromise);

    render(<FanAssistant />);

    const input = screen.getByPlaceholderText(/Ask about gates/i);
    const sendButton = screen.getByRole('button', { name: /Send/i });

    fireEvent.change(input, { target: { value: 'Toronto specific query' } });
    fireEvent.click(sendButton);

    // Switch venue while fetch is pending
    const venueSelect = screen.getByLabelText(/Active Stadium Console:/i);
    fireEvent.change(venueSelect, { target: { value: 'mexico-demo' } });

    // Resolve the Toronto query now
    resolveFetch({
      ok: true,
      json: async () => ({
        summary: 'Toronto Gate A info.',
        recommendedAction: 'Action for Toronto.',
        simulatedDataUsed: ['Toronto Telemetry'],
        limitations: 'Simulated'
      })
    });

    // Verify that Toronto answer never appears in the Mexico venue chat
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /Mexico City Stadium Demo/i })).toBeInTheDocument();
    });
    expect(screen.queryByText('Toronto Gate A info.')).not.toBeInTheDocument();
  });
});
