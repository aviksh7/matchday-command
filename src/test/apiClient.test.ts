import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isValidFanAssistantResponse,
  isValidIncidentSupportResponse,
  validatePayloadLimits,
  postFanAssistant,
  postIncidentSupport,
  buildCompactVenue,
  buildCompactIncident,
  buildCompactContext
} from '../logic/apiClient';
import { SIMULATED_VENUES } from '../data/mockData';
import type { VenueData, IncidentData } from '../types';

describe('apiClient', () => {
  const mockVenue: VenueData = {
    id: 'test-venue',
    name: 'Test Stadium',
    locationName: 'Test City',
    simulatedCapacity: 50000,
    isSimulatedPrototype: true,
    simulationDisclaimer: 'Test disclaimer',
    gates: [
      { id: 'gate-1', name: 'Gate A', pressure: 'Low', percentage: 20, isOpen: true, accessibleReady: true }
    ],
    zones: [],
    concessions: [],
    accessibilityRequests: [],
    transitStatus: [],
    sustainability: {
      waterRefillStationLoadPercentage: 50,
      wasteSortingCompliancePercentage: 80,
      greenTransitEncouragementPercentage: 70
    },
    incidents: []
  };

  const mockIncident: IncidentData = {
    id: 'INC-1',
    type: 'Spill Hazard',
    location: 'Sec 101',
    severity: 'Medium',
    status: 'Open',
    timestamp: '12:00'
  };

  describe('Response Validators', () => {
    it('isValidFanAssistantResponse should validate correct Fan Assistant response schema', () => {
      expect(isValidFanAssistantResponse({
        summary: 'Valid summary',
        recommendedAction: 'Valid action',
        simulatedDataUsed: ['Gate A'],
        limitations: 'Simulated data only'
      })).toBe(true);
    });

    it('isValidFanAssistantResponse should reject invalid types or empty strings', () => {
      expect(isValidFanAssistantResponse(null)).toBe(false);
      expect(isValidFanAssistantResponse({})).toBe(false);
      expect(isValidFanAssistantResponse({
        summary: '',
        recommendedAction: 'Action',
        simulatedDataUsed: ['Gate A'],
        limitations: 'Simulated'
      })).toBe(false);
      expect(isValidFanAssistantResponse({
        summary: 'Summary',
        recommendedAction: 'Action',
        simulatedDataUsed: [123],
        limitations: 'Simulated'
      })).toBe(false);
    });

    it('isValidFanAssistantResponse should reject empty arrays and whitespace-only data entries', () => {
      const validResponse = {
        summary: 'Summary',
        recommendedAction: 'Action',
        simulatedDataUsed: ['Gate A'],
        limitations: 'Simulated'
      };

      expect(isValidFanAssistantResponse({
        ...validResponse,
        simulatedDataUsed: []
      })).toBe(false);
      expect(isValidFanAssistantResponse({
        ...validResponse,
        simulatedDataUsed: ['Gate A', '   ']
      })).toBe(false);
    });

    it('isValidIncidentSupportResponse should validate correct Incident Support response schema', () => {
      expect(isValidIncidentSupportResponse({
        situationSummary: 'Valid situation',
        priorityLevel: 'High',
        recommendedActions: ['Action 1'],
        volunteerBriefing: 'Briefing',
        fanAnnouncementDraft: 'Announcement',
        accessibilityNote: 'Note',
        crowdTransitNote: 'Transit',
        simulatedDataUsed: ['Telemetry'],
        limitations: 'Simulated'
      })).toBe(true);
    });

    it('isValidIncidentSupportResponse should reject invalid priority levels or empty fields', () => {
      expect(isValidIncidentSupportResponse({
        situationSummary: 'Valid situation',
        priorityLevel: 'Urgent', // invalid enum
        recommendedActions: ['Action 1'],
        volunteerBriefing: 'Briefing',
        fanAnnouncementDraft: 'Announcement',
        accessibilityNote: 'Note',
        crowdTransitNote: 'Transit',
        simulatedDataUsed: ['Telemetry'],
        limitations: 'Simulated'
      })).toBe(false);
    });

    it('isValidIncidentSupportResponse should reject empty arrays and whitespace-only array entries', () => {
      const validResponse = {
        situationSummary: 'Valid situation',
        priorityLevel: 'High',
        recommendedActions: ['Action 1'],
        volunteerBriefing: 'Briefing',
        fanAnnouncementDraft: 'Announcement',
        accessibilityNote: 'Note',
        crowdTransitNote: 'Transit',
        simulatedDataUsed: ['Telemetry'],
        limitations: 'Simulated'
      };

      expect(isValidIncidentSupportResponse({
        ...validResponse,
        recommendedActions: []
      })).toBe(false);
      expect(isValidIncidentSupportResponse({
        ...validResponse,
        recommendedActions: ['Action 1', '\t']
      })).toBe(false);
      expect(isValidIncidentSupportResponse({
        ...validResponse,
        simulatedDataUsed: []
      })).toBe(false);
      expect(isValidIncidentSupportResponse({
        ...validResponse,
        simulatedDataUsed: ['Telemetry', '\n']
      })).toBe(false);
    });
  });

  describe('Payload Size Guard & Compact Builders', () => {
    it('buildCompactVenue should produce compact serializable venue info', () => {
      const compact = buildCompactVenue(mockVenue);
      expect(compact).toEqual({
        id: 'test-venue',
        name: 'Test Stadium',
        locationName: 'Test City',
        simulatedCapacity: 50000
      });
    });

    it('buildCompactIncident should produce compact serializable incident info (< 1000 chars)', () => {
      const compact = buildCompactIncident(mockIncident);
      expect(JSON.stringify(compact).length).toBeLessThan(1000);
      expect(compact).toEqual({
        id: 'INC-1',
        type: 'Spill Hazard',
        location: 'Sec 101',
        severity: 'Medium',
        status: 'Open'
      });
    });

    it('buildCompactContext should include simulated support and volunteer grounding while counting only unresolved incidents', () => {
      const groundedVenue: VenueData = {
        ...mockVenue,
        zones: [
          { id: 'zone-1', name: 'North Concourse', density: 'High', occupancyPercentage: 76, volunteerCount: 7 }
        ],
        accessibilityRequests: [
          { id: 'acc-internal-1', type: 'Wheelchair Assistance', location: 'Gate A', status: 'Pending', timestamp: '12:05' },
          { id: 'acc-internal-2', type: 'Sensory Room Request', location: 'Section 114', status: 'Resolved', timestamp: '11:45' }
        ],
        incidents: [
          mockIncident,
          { ...mockIncident, id: 'INC-2', status: 'Dispatched' },
          { ...mockIncident, id: 'INC-3', status: 'Resolved' }
        ]
      };

      const compact = buildCompactContext(groundedVenue);
      expect(compact.zones).toEqual([
        { name: 'North Concourse', density: 'High', occupancyPercentage: 76, volunteerCount: 7 }
      ]);
      expect(compact.accessibilitySupportRequests).toEqual([
        { type: 'Wheelchair Assistance', location: 'Gate A', status: 'Pending' },
        { type: 'Sensory Room Request', location: 'Section 114', status: 'Resolved' }
      ]);
      expect(compact.unresolvedIncidentCount).toBe(2);
      expect(compact).not.toHaveProperty('activeIncidentsCount');

      const serialized = JSON.stringify(compact);
      expect(serialized).not.toContain('acc-internal');
      expect(serialized).not.toContain('12:05');
    });

    it('keeps compact real-fixture requests comfortably below current server payload limits', () => {
      for (const venue of SIMULATED_VENUES) {
        const compactVenue = buildCompactVenue(venue);
        const compactContext = buildCompactContext(venue);
        const compactIncident = buildCompactIncident(venue.incidents[0] || mockIncident);
        const userQuery = 'Where is the lowest-pressure accessible route?';

        const venueSize = JSON.stringify(compactVenue).length;
        const contextSize = JSON.stringify(compactContext).length;
        const incidentSize = JSON.stringify(compactIncident).length;
        const fanRequestSize = JSON.stringify({
          userQuery,
          venue: compactVenue,
          simulatedVenueContext: compactContext
        }).length;
        const incidentRequestSize = JSON.stringify({
          incident: compactIncident,
          venue: compactVenue,
          simulatedVenueContext: compactContext
        }).length;

        expect(venueSize).toBeLessThan(1000);
        expect(contextSize).toBeLessThan(4000);
        expect(incidentSize).toBeLessThan(1000);
        expect(fanRequestSize).toBeLessThan(9000);
        expect(incidentRequestSize).toBeLessThan(9000);
        expect(validatePayloadLimits({
          field1: userQuery,
          field1MaxLen: 500,
          venue: compactVenue,
          context: compactContext
        }).valid).toBe(true);
        expect(validatePayloadLimits({
          field1: compactIncident,
          field1MaxLen: 1000,
          venue: compactVenue,
          context: compactContext
        }).valid).toBe(true);
      }
    });

    it('validatePayloadLimits should return valid for normal payloads', () => {
      const res = validatePayloadLimits({
        field1: 'Quick query',
        field1MaxLen: 500,
        venue: buildCompactVenue(mockVenue),
        context: buildCompactContext(mockVenue)
      });
      expect(res.valid).toBe(true);
    });

    it('validatePayloadLimits should return payload-too-large for oversized field1 or context', () => {
      const hugeString = 'a'.repeat(600);
      const res = validatePayloadLimits({
        field1: hugeString,
        field1MaxLen: 500,
        venue: buildCompactVenue(mockVenue),
        context: buildCompactContext(mockVenue)
      });
      expect(res.valid).toBe(false);
      expect(res.reason).toBe('payload-too-large');
    });
  });

  describe('Network & Fallback Handling', () => {
    const validFanResponse = {
      summary: 'Summary',
      recommendedAction: 'Action',
      simulatedDataUsed: ['Data'],
      limitations: 'Simulated'
    };

    const validIncidentResponse = {
      situationSummary: 'Summary',
      priorityLevel: 'Medium' as const,
      recommendedActions: ['Action'],
      volunteerBriefing: 'Briefing',
      fanAnnouncementDraft: 'Announcement',
      accessibilityNote: 'Note',
      crowdTransitNote: 'Transit',
      simulatedDataUsed: ['Data'],
      limitations: 'Simulated'
    };

    const createAbortError = () => {
      const error = new Error('Internal abort detail must not leak');
      error.name = 'AbortError';
      return error;
    };

    const createExternalSignalHarness = () => {
      const controller = new AbortController();
      const addEventListenerSpy = vi.spyOn(controller.signal, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(controller.signal, 'removeEventListener');

      const expectAttached = () => {
        expect(addEventListenerSpy).toHaveBeenCalledTimes(1);
        expect(removeEventListenerSpy).not.toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(1);
      };

      const expectCleanedUp = () => {
        expect(addEventListenerSpy).toHaveBeenCalledTimes(1);
        const registeredListener = addEventListenerSpy.mock.calls[0]?.[1];
        expect(registeredListener).toEqual(expect.any(Function));
        expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
        expect(removeEventListenerSpy.mock.calls.some(
          ([type, listener]) => type === 'abort' && listener === registeredListener
        )).toBe(true);
        expect(vi.getTimerCount()).toBe(0);
      };

      return {
        controller,
        addEventListenerSpy,
        removeEventListenerSpy,
        expectAttached,
        expectCleanedUp
      };
    };

    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      vi.useFakeTimers();
      fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
      vi.clearAllTimers();
      vi.useRealTimers();
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    });

    it('posts the exact Fan Assistant request and returns the validated success result', async () => {
      const signalHarness = createExternalSignalHarness();
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(validFanResponse)
      });

      const result = await postFanAssistant('Hello', mockVenue, signalHarness.controller.signal);

      expect(result).toEqual({
        success: true,
        data: validFanResponse,
        source: 'Vertex AI via Cloud Run'
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const [url, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('/api/fan-assistant');
      expect(requestInit.method).toBe('POST');
      expect(requestInit.headers).toEqual({ 'Content-Type': 'application/json' });
      expect(JSON.parse(String(requestInit.body))).toEqual({
        userQuery: 'Hello',
        venue: buildCompactVenue(mockVenue),
        simulatedVenueContext: buildCompactContext(mockVenue)
      });
      expect(requestInit.signal).toBeDefined();
      expect(requestInit.signal).not.toBe(signalHarness.controller.signal);
      expect((requestInit.signal as AbortSignal).aborted).toBe(false);
      signalHarness.expectCleanedUp();
    });

    it('posts the exact Incident Support request and keeps its response schema distinct', async () => {
      const signalHarness = createExternalSignalHarness();
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(validIncidentResponse)
      });

      const result = await postIncidentSupport(mockIncident, mockVenue, signalHarness.controller.signal);

      expect(result).toEqual({
        success: true,
        data: validIncidentResponse,
        source: 'Vertex AI via Cloud Run'
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const [url, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('/api/incident-support');
      expect(requestInit.method).toBe('POST');
      expect(requestInit.headers).toEqual({ 'Content-Type': 'application/json' });
      expect(JSON.parse(String(requestInit.body))).toEqual({
        incident: buildCompactIncident(mockIncident),
        venue: buildCompactVenue(mockVenue),
        simulatedVenueContext: buildCompactContext(mockVenue)
      });
      expect(requestInit.signal).toBeDefined();
      expect(requestInit.signal).not.toBe(signalHarness.controller.signal);
      signalHarness.expectCleanedUp();
    });

    it('returns a safe server fallback for a 500 without reading or leaking its body', async () => {
      const signalHarness = createExternalSignalHarness();
      const json = vi.fn().mockResolvedValue({ internalDetail: 'sensitive backend body' });
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json
      });

      const result = await postFanAssistant('Hello', mockVenue, signalHarness.controller.signal);

      expect(result).toEqual({
        success: false,
        reason: 'server',
        message: 'Backend service returned a non-2xx response. Using local fallback.',
        source: 'Local deterministic fallback'
      });
      expect(json).not.toHaveBeenCalled();
      expect(JSON.stringify(result)).not.toContain('sensitive backend body');
      signalHarness.expectCleanedUp();
    });

    it.each([400, 413])('preserves the payload-too-large fallback for HTTP %i', async status => {
      const signalHarness = createExternalSignalHarness();
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status
      });

      const result = await postFanAssistant('Hello', mockVenue, signalHarness.controller.signal);

      expect(result).toEqual({
        success: false,
        reason: 'payload-too-large',
        message: 'The request payload was rejected or exceeded size limits. Using local fallback.',
        source: 'Local deterministic fallback'
      });
      signalHarness.expectCleanedUp();
    });

    it('returns a safe network fallback without leaking internal rejection details', async () => {
      const signalHarness = createExternalSignalHarness();
      fetchMock.mockRejectedValueOnce(new Error('secret DNS and credential detail'));

      const result = await postIncidentSupport(mockIncident, mockVenue, signalHarness.controller.signal);

      expect(result).toEqual({
        success: false,
        reason: 'network',
        message: 'Network error or connection failure. Using local fallback.',
        source: 'Local deterministic fallback'
      });
      expect(JSON.stringify(result)).not.toContain('secret DNS and credential detail');
      signalHarness.expectCleanedUp();
    });

    it('distinguishes malformed JSON from a network rejection', async () => {
      const signalHarness = createExternalSignalHarness();
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockRejectedValue(new SyntaxError('Unexpected secret response text'))
      });

      const result = await postFanAssistant('Hello', mockVenue, signalHarness.controller.signal);

      expect(result).toEqual({
        success: false,
        reason: 'invalid-response',
        message: 'Failed to parse JSON from response. Using local fallback.',
        source: 'Local deterministic fallback'
      });
      expect(JSON.stringify(result)).not.toContain('Unexpected secret response text');
      signalHarness.expectCleanedUp();
    });

    it('returns the schema-specific fallback for parsed but invalid data', async () => {
      const signalHarness = createExternalSignalHarness();
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ badKey: 123 })
      });

      const result = await postFanAssistant('Hello', mockVenue, signalHarness.controller.signal);

      expect(result).toEqual({
        success: false,
        reason: 'invalid-response',
        message: 'Response did not match expected schema. Using local fallback.',
        source: 'Local deterministic fallback'
      });
      signalHarness.expectCleanedUp();
    });

    it('aborts at exactly 20 seconds and cleans the timeout and external listener', async () => {
      const signalHarness = createExternalSignalHarness();
      let internalSignal: AbortSignal | undefined;

      fetchMock.mockImplementationOnce((_url: string, requestInit: RequestInit) => {
        internalSignal = requestInit.signal as AbortSignal;
        return new Promise((_resolve, reject) => {
          internalSignal?.addEventListener('abort', () => reject(createAbortError()), { once: true });
        });
      });

      const request = postFanAssistant('Hello', mockVenue, signalHarness.controller.signal);
      let settled = false;
      void request.then(() => {
        settled = true;
      });

      expect(internalSignal?.aborted).toBe(false);
      signalHarness.expectAttached();

      await vi.advanceTimersByTimeAsync(19_999);
      expect(internalSignal?.aborted).toBe(false);
      expect(settled).toBe(false);

      await vi.advanceTimersByTimeAsync(1);
      const result = await request;

      expect(internalSignal?.aborted).toBe(true);
      expect(result).toEqual({
        success: false,
        reason: 'timeout',
        message: 'Request timed out after 20 seconds. Using local fallback.',
        source: 'Local deterministic fallback'
      });
      signalHarness.expectCleanedUp();
    });

    it('handles an external abort immediately after listener attachment without starting fetch', async () => {
      const controller = new AbortController();
      const originalAddEventListener = controller.signal.addEventListener.bind(controller.signal);
      const addEventListenerSpy = vi.spyOn(controller.signal, 'addEventListener').mockImplementation(
        (type, listener, options) => {
          originalAddEventListener(type, listener, options);
          controller.abort();
        }
      );
      const removeEventListenerSpy = vi.spyOn(controller.signal, 'removeEventListener');

      const result = await postFanAssistant('Hello', mockVenue, controller.signal);

      expect(result).toEqual({
        success: false,
        reason: 'timeout',
        message: 'Request was cancelled. Using local fallback.',
        source: 'Local deterministic fallback'
      });
      expect(fetchMock).not.toHaveBeenCalled();
      expect(addEventListenerSpy).toHaveBeenCalledTimes(1);
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);
    });

    it('propagates an external abort while fetch is pending', async () => {
      const signalHarness = createExternalSignalHarness();
      let internalSignal: AbortSignal | undefined;

      fetchMock.mockImplementationOnce((_url: string, requestInit: RequestInit) => {
        internalSignal = requestInit.signal as AbortSignal;
        return new Promise((_resolve, reject) => {
          internalSignal?.addEventListener('abort', () => reject(createAbortError()), { once: true });
        });
      });

      const request = postFanAssistant('Hello', mockVenue, signalHarness.controller.signal);

      expect(internalSignal?.aborted).toBe(false);
      signalHarness.expectAttached();

      signalHarness.controller.abort();
      const result = await request;

      expect(internalSignal?.aborted).toBe(true);
      expect(result).toEqual({
        success: false,
        reason: 'timeout',
        message: 'Request was cancelled. Using local fallback.',
        source: 'Local deterministic fallback'
      });
      signalHarness.expectCleanedUp();
    });

    it('propagates an external abort while the response body is pending', async () => {
      const signalHarness = createExternalSignalHarness();
      let internalSignal: AbortSignal | undefined;
      let markJsonStarted: (() => void) | undefined;
      const jsonStarted = new Promise<void>(resolve => {
        markJsonStarted = resolve;
      });

      fetchMock.mockImplementationOnce((_url: string, requestInit: RequestInit) => {
        internalSignal = requestInit.signal as AbortSignal;
        return Promise.resolve({
          ok: true,
          status: 200,
          json: vi.fn(() => {
            markJsonStarted?.();
            return new Promise((_resolve, reject) => {
              internalSignal?.addEventListener('abort', () => reject(createAbortError()), { once: true });
            });
          })
        });
      });

      const request = postFanAssistant('Hello', mockVenue, signalHarness.controller.signal);
      await jsonStarted;

      expect(internalSignal?.aborted).toBe(false);
      signalHarness.expectAttached();

      signalHarness.controller.abort();
      const result = await request;

      expect(internalSignal?.aborted).toBe(true);
      expect(result).toEqual({
        success: false,
        reason: 'timeout',
        message: 'Request was cancelled. Using local fallback.',
        source: 'Local deterministic fallback'
      });
      signalHarness.expectCleanedUp();
    });

    it('returns immediately for an already-aborted external signal without starting a request or timer', async () => {
      const controller = new AbortController();
      controller.abort();
      const addEventListenerSpy = vi.spyOn(controller.signal, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(controller.signal, 'removeEventListener');

      const result = await postFanAssistant('Hello', mockVenue, controller.signal);

      expect(result).toEqual({
        success: false,
        reason: 'timeout',
        message: 'Request was cancelled. Using local fallback.',
        source: 'Local deterministic fallback'
      });
      expect(fetchMock).not.toHaveBeenCalled();
      expect(addEventListenerSpy).not.toHaveBeenCalled();
      expect(removeEventListenerSpy).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    });

    it('keeps lifecycle resources through status, JSON parsing, and schema validation, then cleans them', async () => {
      const signalHarness = createExternalSignalHarness();
      let resourcesActiveDuringFetch = false;
      let resourcesActiveDuringStatus = false;
      let resourcesActiveDuringJson = false;
      let resourcesActiveDuringSchema = false;

      const resourcesAreActive = () => (
        vi.getTimerCount() === 1
        && signalHarness.addEventListenerSpy.mock.calls.length === 1
        && signalHarness.removeEventListenerSpy.mock.calls.length === 0
      );

      const responseBody = {
        get summary() {
          resourcesActiveDuringSchema = resourcesAreActive();
          return validFanResponse.summary;
        },
        recommendedAction: validFanResponse.recommendedAction,
        simulatedDataUsed: validFanResponse.simulatedDataUsed,
        limitations: validFanResponse.limitations
      };

      const response = {
        get ok() {
          resourcesActiveDuringStatus = resourcesAreActive();
          return true;
        },
        status: 200,
        json: vi.fn(async () => {
          resourcesActiveDuringJson = resourcesAreActive();
          return responseBody;
        })
      };

      fetchMock.mockImplementationOnce(() => {
        resourcesActiveDuringFetch = resourcesAreActive();
        return Promise.resolve(response);
      });

      const result = await postFanAssistant('Hello', mockVenue, signalHarness.controller.signal);

      expect(result.success).toBe(true);
      expect(resourcesActiveDuringFetch).toBe(true);
      expect(resourcesActiveDuringStatus).toBe(true);
      expect(resourcesActiveDuringJson).toBe(true);
      expect(resourcesActiveDuringSchema).toBe(true);
      signalHarness.expectCleanedUp();
    });
  });
});
