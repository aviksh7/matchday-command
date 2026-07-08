import { describe, it, expect } from 'vitest';
import { 
  calculateAverageGatePressure, 
  getHighestPriorityIncidents, 
  getOverallVenueStatus, 
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
    const priority = getHighestPriorityIncidents(mockTestVenue);
    expect(priority).toHaveLength(2);
    expect(priority[0].id).toBe('i2'); // High severity should be first
    expect(priority[1].id).toBe('i1'); // Medium severity second
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
});
