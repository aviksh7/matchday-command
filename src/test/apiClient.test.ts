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
    let fetchMock: any;

    beforeEach(() => {
      fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('postFanAssistant should return Vertex AI via Cloud Run on 200 OK with valid schema', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          summary: 'Summary',
          recommendedAction: 'Action',
          simulatedDataUsed: ['Data'],
          limitations: 'Simulated'
        })
      });

      const res = await postFanAssistant('Hello', mockVenue);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.source).toBe('Vertex AI via Cloud Run');
        expect(res.data.summary).toBe('Summary');
      }
    });

    it('postFanAssistant should return Local deterministic fallback on non-2xx', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const res = await postFanAssistant('Hello', mockVenue);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.source).toBe('Local deterministic fallback');
        expect(res.reason).toBe('server');
      }
    });

    it('postFanAssistant should return Local deterministic fallback on malformed JSON or schema failure', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ badKey: 123 })
      });

      const res = await postFanAssistant('Hello', mockVenue);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.source).toBe('Local deterministic fallback');
        expect(res.reason).toBe('invalid-response');
      }
    });

    it('postIncidentSupport should return Vertex AI via Cloud Run on 200 OK with valid schema', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          situationSummary: 'Summary',
          priorityLevel: 'Medium',
          recommendedActions: ['Action'],
          volunteerBriefing: 'Briefing',
          fanAnnouncementDraft: 'Announcement',
          accessibilityNote: 'Note',
          crowdTransitNote: 'Transit',
          simulatedDataUsed: ['Data'],
          limitations: 'Simulated'
        })
      });

      const res = await postIncidentSupport(mockIncident, mockVenue);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.source).toBe('Vertex AI via Cloud Run');
        expect(res.data.priorityLevel).toBe('Medium');
      }
    });

    it('postIncidentSupport should handle network rejection cleanly', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      const res = await postIncidentSupport(mockIncident, mockVenue);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.source).toBe('Local deterministic fallback');
        expect(res.reason).toBe('network');
      }
    });
  });
});
