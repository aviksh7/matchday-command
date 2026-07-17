import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FanAssistant from '../pages/FanAssistant';
import { SIMULATED_VENUE_ANNOUNCEMENT } from '../logic/fanAssistant';

describe('Fan Assistant API Integration & Fallback Flow', () => {
  let fetchMock: any;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('provides persistent prompt and quick-command labels', () => {
    render(<FanAssistant />);

    expect(screen.getByRole('textbox', { name: 'Ask the Fan Operations Assistant' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Quick guidance prompt shortcuts' })).toBeInTheDocument();
  });

  it('describes cloud and local fallback capability without claiming cloud AI is always enabled', () => {
    render(<FanAssistant />);

    expect(screen.getByText('Cloud AI + local fallback')).toHaveAccessibleName(
      'Hybrid guidance: cloud AI when available, with deterministic local fallback'
    );
    expect(screen.queryByText('AI GUIDANCE ENABLED')).not.toBeInTheDocument();
  });

  it('uses non-animated transcript scrolling when reduced motion is requested', () => {
    const scrollSpy = vi.spyOn(window.HTMLElement.prototype, 'scrollIntoView');
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));

    render(<FanAssistant />);

    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'auto' });
  });

  it('renders Vertex AI via Cloud Run response on successful API call', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        summary: 'Cloud Run **Vertex AI** guidance answer.',
        recommendedAction: 'Use Gate C and confirm posted venue guidance.',
        simulatedDataUsed: ['Gate A Pressure 88%'],
        limitations: 'Simulated data only.'
      })
    });

    render(<FanAssistant />);

    expect(screen.getByText(/prototype for the Toronto Stadium Demo console/i)).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent('**Toronto Stadium Demo**');

    const quickPrompt = screen.getByText(/Find the least crowded gate/i);
    fireEvent.click(quickPrompt);

    await waitFor(() => {
      expect(screen.getByText((_, element) => element?.tagName === 'P' && element.textContent === 'Cloud Run Vertex AI guidance answer.')).toBeInTheDocument();
      expect(screen.getByText('Vertex AI', { selector: 'strong' })).toBeInTheDocument();
      expect(screen.getByText('Use Gate C and confirm posted venue guidance.')).not.toHaveTextContent(/\bdispatch\b/i);
      expect(screen.getByText(/Vertex AI via Cloud Run/i, { selector: '.fan-source-badge' })).toBeInTheDocument();
    });
  });

  it('switches to Local deterministic fallback on server error or network failure', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network offline'));

    render(<FanAssistant />);

    const quickPrompt = screen.getByText(/Find lowest queue concession/i);
    fireEvent.click(quickPrompt);

    await waitFor(() => {
      expect(screen.getByText(/Local deterministic fallback/i, { selector: '.fan-source-badge' })).toBeInTheDocument();
      expect(screen.getByText(/Network error or connection failure/i)).toBeInTheDocument();
    });
  });

  it('submits the real simulated announcement with explicit translation targets', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        summary: 'Spanish and French translation demonstration.',
        recommendedAction: 'Have a qualified language reviewer check this draft.',
        simulatedDataUsed: ['Fixed simulated venue announcement'],
        limitations: 'Translation coverage and accuracy are not guaranteed.'
      })
    });

    render(<FanAssistant />);

    expect(screen.getByText(/Translation is a limited demonstration/i)).toBeInTheDocument();
    expect(screen.getByText(/Local fallback is limited to the fixed Spanish\/French announcement sample/i)).toBeInTheDocument();

    const translationButton = screen.getByRole('button', { name: /Demo Spanish\/French translation/i });
    expect(translationButton).toHaveAttribute('aria-describedby', 'fan-translation-limitations');
    fireEvent.click(translationButton);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const request = JSON.parse(fetchMock.mock.calls[0][1].body);

    expect(request.userQuery).toContain(SIMULATED_VENUE_ANNOUNCEMENT);
    expect(request.userQuery).toContain('Spanish and French');
    expect(request.userQuery).not.toMatch(/placeholder/i);
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
      expect(screen.getByText(/Local deterministic fallback/i, { selector: '.fan-source-badge' })).toBeInTheDocument();
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

    const input = screen.getByRole('textbox', { name: 'Ask the Fan Operations Assistant' });
    const sendButton = screen.getByRole('button', { name: /Send/i });

    fireEvent.change(input, { target: { value: 'How crowded is Gate A?' } });
    fireEvent.click(sendButton);

    // Should immediately show loading
    expect(screen.getByText(/Generating guidance via Vertex AI/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Generating fan guidance via Vertex AI.');
    expect(screen.getByRole('region', { name: 'Assistant conversation' })).toHaveAttribute('aria-busy', 'true');
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
      expect(screen.getByRole('status')).toHaveTextContent(
        'Fan guidance ready. Source: Vertex AI via Cloud Run. Limitations: Simulated'
      );
      expect(screen.getByRole('region', { name: 'Assistant conversation' })).toHaveAttribute('aria-busy', 'false');
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
