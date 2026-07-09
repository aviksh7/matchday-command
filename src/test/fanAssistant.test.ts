import { describe, it, expect } from 'vitest';
import { getSimulatedAssistantResponse } from '../logic/fanAssistant';
import type { VenueData } from '../types';

const mockTestVenue: VenueData = {
  id: 'test-stadium',
  name: 'Test Stadium',
  locationName: 'Test City',
  simulatedCapacity: 50000,
  isSimulatedPrototype: true,
  simulationDisclaimer: 'Test disclaimer',
  gates: [
    { id: 'g1', name: 'Gate 1', pressure: 'High', percentage: 90, isOpen: true, accessibleReady: false },
    { id: 'g2', name: 'Gate 2', pressure: 'Low', percentage: 30, isOpen: true, accessibleReady: true },
    { id: 'g3', name: 'Gate 3', pressure: 'Low', percentage: 10, isOpen: false, accessibleReady: true }
  ],
  zones: [],
  concessions: [
    { id: 'c1', name: 'Concession 1', type: 'Food', waitTimeMinutes: 10, isAccessible: true }
  ],
  accessibilityRequests: [],
  transitStatus: [
    { id: 't1', type: 'Train Terminal', status: 'Normal Operations', crowdPressurePercentage: 25, loadLevel: 'Low' }
  ],
  sustainability: {
    waterRefillStationLoadPercentage: 40,
    wasteSortingCompliancePercentage: 70,
    greenTransitEncouragementPercentage: 80
  },
  incidents: []
};

describe('Simulated Fan Assistant Response Logic', () => {
  it('correctly identifies the least crowded OPEN gate (ignoring closed ones)', () => {
    const response = getSimulatedAssistantResponse('least-crowded-gate', null, mockTestVenue);
    // Gate 3 has 10% but is closed. Gate 2 has 30% and is open. It should select Gate 2.
    expect(response.answer).toContain('Gate 2');
    expect(response.action).toContain('Gate 2');
  });

  it('includes simulated-data grounding in responses', () => {
    const response = getSimulatedAssistantResponse('transit-pressures', null, mockTestVenue);
    expect(response.telemetryUsed).toContain('Train Terminal');
    expect(response.telemetryUsed).toContain('25%');
  });

  it('includes a prototype safety disclaimer on every response type', () => {
    const promptKeys = [
      'least-crowded-gate',
      'low-wait-concessions',
      'accessible-guidance',
      'transit-pressures',
      'sustainability-tips',
      'translate-announcement'
    ] as const;

    promptKeys.forEach(key => {
      const response = getSimulatedAssistantResponse(key, null, mockTestVenue);
      expect(response.disclaimer).toBeDefined();
      expect(response.disclaimer).toContain('Simulated');
    });

    const fallbackResponse = getSimulatedAssistantResponse('custom', 'unmatched query', mockTestVenue);
    expect(fallbackResponse.disclaimer).toBeDefined();
    expect(fallbackResponse.disclaimer).toContain('Simulated');
  });

  it('does NOT claim live, official, or real-time systems access in any disclaimer or answer', () => {
    const promptKeys = [
      'least-crowded-gate',
      'low-wait-concessions',
      'accessible-guidance',
      'transit-pressures',
      'sustainability-tips',
      'translate-announcement'
    ] as const;

    promptKeys.forEach(key => {
      const response = getSimulatedAssistantResponse(key, null, mockTestVenue);
      // Ensure it explicitly states it is simulated, not real, and does not claim access
      const allText = (response.answer + ' ' + response.action + ' ' + response.disclaimer).toLowerCase();
      expect(allText).not.toContain('real-time system');
      expect(allText).not.toContain('official access');
      expect(allText).toContain('simulate');
    });
  });

  it('maps custom query keywords to the correct simulated logic', () => {
    const gateResponse = getSimulatedAssistantResponse('custom', 'which gate is less busy?', mockTestVenue);
    expect(gateResponse.answer).toContain('Gate 2');

    const foodResponse = getSimulatedAssistantResponse('custom', 'where is food restroom wait?', mockTestVenue);
    expect(foodResponse.answer).toContain('Concession 1');

    const wheelchairResponse = getSimulatedAssistantResponse('custom', 'is there a wheelchair path?', mockTestVenue);
    expect(wheelchairResponse.answer).toContain('Gate 2'); // Gate 2 is accessibleReady
  });
});
