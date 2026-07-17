import { describe, it, expect } from 'vitest';
import { getSimulatedAssistantResponse, SIMULATED_VENUE_ANNOUNCEMENT } from '../logic/fanAssistant';
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
    expect(response.action).not.toMatch(/avoid departure delays/i);
    expect(response.action).toMatch(/posted transit signs|transit staff/i);
  });

  it('labels sustainability values as simulated indicators rather than measured impact', () => {
    const response = getSimulatedAssistantResponse('sustainability-tips', null, mockTestVenue);
    const responseText = `${response.answer} ${response.action} ${response.telemetryUsed} ${response.disclaimer}`;

    expect(response.telemetryUsed).toContain('green-transit encouragement');
    expect(responseText).not.toContain('green transport usage');
    expect(responseText).toMatch(/not measurements of environmental impact|no live facility feed/i);
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

  it('prioritizes accessibility intent when a custom query also mentions a gate or entrance', () => {
    ['Which accessible gate is open?', 'Where is the wheelchair entrance?', 'Is there an accessibility entrance?'].forEach(query => {
      const response = getSimulatedAssistantResponse('custom', query, mockTestVenue);

      expect(response.answer).toContain('open gates are equipped with accessible lanes');
      expect(response.telemetryUsed).toContain('Simulated accessibility gates');
      expect(response.answer).not.toContain('lowest intake pressure');
    });

    const genericSignQuery = getSimulatedAssistantResponse('custom', 'Where are the signs at the gate?', mockTestVenue);
    expect(genericSignQuery.answer).toContain('lowest intake pressure');
    expect(genericSignQuery.telemetryUsed).toContain('Simulated gates telemetry');
  });

  it('describes pending accessibility support without claiming dispatch', () => {
    const venueWithPendingSupport: VenueData = {
      ...mockTestVenue,
      accessibilityRequests: [
        { id: 'a1', type: 'Wheelchair Assistance', location: 'Gate 2', status: 'Pending', timestamp: '19:10' }
      ]
    };
    const response = getSimulatedAssistantResponse('accessible-guidance', null, venueWithPendingSupport);

    expect(response.answer).toContain('1 pending accessibility support request');
    expect(response.answer).toContain('Gate 2 (Pending)');
    expect(response.telemetryUsed).toContain('Wheelchair Assistance at Gate 2 (Pending)');
    expect(`${response.answer} ${response.action}`).not.toMatch(/guest services|information booth/i);
    expect(response.answer).not.toMatch(/dispatch/i);
  });

  it('does not invent accessibility support locations when none exist in the venue snapshot', () => {
    const response = getSimulatedAssistantResponse('accessible-guidance', null, mockTestVenue);
    const responseText = `${response.answer} ${response.action} ${response.telemetryUsed}`;

    expect(response.answer).toContain('No active accessibility support request locations are recorded');
    expect(response.telemetryUsed).toContain('Simulated accessibility requests: None');
    expect(responseText).not.toMatch(/guest services|information booth/i);
  });

  it('uses the shared simulated announcement and clearly limits deterministic translation', () => {
    const response = getSimulatedAssistantResponse('translate-announcement', null, mockTestVenue);
    const responseText = `${response.answer} ${response.action} ${response.telemetryUsed} ${response.disclaimer}`;

    expect(response.answer).toContain(SIMULATED_VENUE_ANNOUNCEMENT);
    expect(response.answer).toContain('Spanish');
    expect(response.answer).toContain('French');
    expect(responseText).not.toMatch(/placeholder/i);
    expect(responseText).toMatch(/translation demonstration/i);
    expect(responseText).toMatch(/language coverage/i);
    expect(responseText).toMatch(/accuracy (?:is|are) not guaranteed/i);
    expect(responseText).toMatch(/fallback (?:cannot|is limited)/i);
  });
});
