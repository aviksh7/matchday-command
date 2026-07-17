import { describe, it, expect } from 'vitest';
import { 
  calculateAverageGatePressure, 
  getHighestPriorityIncidents, 
  getLowestPressureOpenGate,
  getOverallVenueStatus, 
  getPressureTone,
  summarizeAccessibilityRequests 
} from '../logic/operations';
import type { VenueData } from '../types';

// Deterministic mock venue data for testing helpers
const mockTestVenue: VenueData = {
  id: 'test-stadium',
  name: 'Test Stadium',
  locationName: 'Test City',
  simulatedCapacity: 50000,
  isSimulatedPrototype: true,
  simulationDisclaimer: 'Test disclaimer',
  gates: [
    { id: 'g1', name: 'Gate 1', pressure: 'High', percentage: 90, isOpen: true, accessibleReady: true },
    { id: 'g2', name: 'Gate 2', pressure: 'Low', percentage: 30, isOpen: true, accessibleReady: false }
  ],
  zones: [
    { id: 'z1', name: 'Zone 1', density: 'Medium', occupancyPercentage: 50, volunteerCount: 2 }
  ],
  concessions: [],
  accessibilityRequests: [
    { id: 'a1', type: 'Wheelchair Assistance', location: 'Gate 1', status: 'Pending', timestamp: '12:00' },
    { id: 'a2', type: 'Sign Language', location: 'Gate 2', status: 'In Progress', timestamp: '12:05' },
    { id: 'a3', type: 'Stroller Storage', location: 'Gate 1', status: 'Resolved', timestamp: '11:00' }
  ],
  transitStatus: [],
  sustainability: {
    waterRefillStationLoadPercentage: 40,
    wasteSortingCompliancePercentage: 70,
    greenTransitEncouragementPercentage: 80
  },
  incidents: [
    { id: 'i1', type: 'Spill', location: 'Sec 101', severity: 'Medium', status: 'Open', timestamp: '12:00' },
    { id: 'i2', type: 'Medical', location: 'Sec 102', severity: 'High', status: 'Open', timestamp: '12:02' }
  ]
};

describe('Operations Helper Logic Functions', () => {
  it('correctly calculates average gate pressure', () => {
    // (90 + 30) / 2 = 60
    expect(calculateAverageGatePressure(mockTestVenue)).toBe(60);
  });

  it('correctly filters and sorts active incidents by severity', () => {
    const venue: VenueData = {
      ...mockTestVenue,
      incidents: [
        { id: 'low', type: 'Lost item', location: 'Sec 100', severity: 'Low', status: 'Open', timestamp: '11:58' },
        ...mockTestVenue.incidents,
        { id: 'resolved-high', type: 'Resolved', location: 'Sec 103', severity: 'High', status: 'Resolved', timestamp: '11:50' },
      ],
    };

    expect(getHighestPriorityIncidents(venue).map(incident => incident.id)).toEqual(['i2', 'i1', 'low']);
  });

  it.each([
    [49, 'green'],
    [50, 'amber'],
    [79, 'amber'],
    [80, 'red'],
  ] as const)('maps %i%% pressure to the %s tone', (percentage, tone) => {
    expect(getPressureTone(percentage)).toBe(tone);
  });

  it('selects the lowest-pressure open gate and ignores a lower closed gate', () => {
    const gate = getLowestPressureOpenGate({
      ...mockTestVenue,
      gates: [
        { id: 'closed', name: 'Closed', pressure: 'Low', percentage: 5, isOpen: false, accessibleReady: true },
        { id: 'open-high', name: 'Open high', pressure: 'High', percentage: 80, isOpen: true, accessibleReady: false },
        { id: 'open-low', name: 'Open low', pressure: 'Low', percentage: 20, isOpen: true, accessibleReady: true },
      ],
    });

    expect(gate?.id).toBe('open-low');
  });

  it('correctly counts pending and active accessibility requests', () => {
    const summary = summarizeAccessibilityRequests(mockTestVenue);
    expect(summary.pendingCount).toBe(1);
    expect(summary.activeCount).toBe(1);
  });

  it('correctly evaluates overall venue status', () => {
    // mockTestVenue has an active High severity incident, so it should be Critical
    expect(getOverallVenueStatus(mockTestVenue)).toBe('Critical');

    // Remove high incident to check Elevated status
    const elevatedVenue: VenueData = {
      ...mockTestVenue,
      incidents: [
        { id: 'i1', type: 'Spill', location: 'Sec 101', severity: 'Medium', status: 'Open', timestamp: '12:00' }
      ]
    };
    expect(getOverallVenueStatus(elevatedVenue)).toBe('Elevated');

    // Clear all incidents and lower gate pressures to check Normal status
    const normalVenue: VenueData = {
      ...mockTestVenue,
      gates: [
        { id: 'g1', name: 'Gate 1', pressure: 'Low', percentage: 20, isOpen: true, accessibleReady: true }
      ],
      incidents: []
    };
    expect(getOverallVenueStatus(normalVenue)).toBe('Normal');
  });

  it.each([
    [50, 'Normal'],
    [51, 'Elevated'],
    [80, 'Elevated'],
    [81, 'Critical'],
  ] as const)('preserves strict overall-status boundaries at %i%%', (percentage, expectedStatus) => {
    const venue: VenueData = {
      ...mockTestVenue,
      gates: [
        { id: 'boundary', name: 'Boundary gate', pressure: 'Medium', percentage, isOpen: true, accessibleReady: true },
      ],
      zones: [
        { id: 'neutral', name: 'Neutral zone', density: 'Low', occupancyPercentage: 20, volunteerCount: 12 },
      ],
      incidents: [],
    };

    expect(getOverallVenueStatus(venue)).toBe(expectedStatus);
  });
});
