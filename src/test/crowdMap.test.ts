import { describe, it, expect } from 'vitest';
import {
  getLeastCrowdedGate,
  getHighestDensityZones,
  getAccessibleEntryOptions,
  getMapGuidanceSummary
} from '../logic/crowdMap';
import type { VenueData } from '../types';

const mockTestVenue: VenueData = {
  id: 'test-stadium-map',
  name: 'Test Map Venue',
  locationName: 'Test City',
  simulatedCapacity: 70000,
  isSimulatedPrototype: true,
  simulationDisclaimer: 'Test disclaimer',
  gates: [
    { id: 'g1', name: 'Gate 1', pressure: 'High', percentage: 95, isOpen: true, accessibleReady: false },
    { id: 'g2', name: 'Gate 2', pressure: 'Medium', percentage: 50, isOpen: true, accessibleReady: true },
    { id: 'g3', name: 'Gate 3', pressure: 'Low', percentage: 10, isOpen: false, accessibleReady: true }
  ],
  zones: [
    { id: 'z1', name: 'North concourse', density: 'Critical', occupancyPercentage: 90, volunteerCount: 4 },
    { id: 'z2', name: 'South concourse', density: 'High', occupancyPercentage: 75, volunteerCount: 12 },
    { id: 'z3', name: 'West concourse', density: 'Low', occupancyPercentage: 20, volunteerCount: 6 }
  ],
  concessions: [],
  accessibilityRequests: [],
  transitStatus: [
    { id: 't1', type: 'Train Terminal', status: 'Normal Operations', crowdPressurePercentage: 90, loadLevel: 'Critical' }
  ],
  sustainability: {
    waterRefillStationLoadPercentage: 50,
    wasteSortingCompliancePercentage: 80,
    greenTransitEncouragementPercentage: 75
  },
  incidents: []
};

describe('Crowd Map Helper Logic Functions', () => {
  it('correctly identifies the least crowded OPEN gate, ignoring closed ones', () => {
    const gate = getLeastCrowdedGate(mockTestVenue);
    expect(gate).not.toBeNull();
    // Gate 3 has 10% but is closed. Gate 2 has 50% and is open.
    expect(gate!.id).toBe('g2');
  });

  it('returns no gate when every simulated gate is closed', () => {
    const gate = getLeastCrowdedGate({
      ...mockTestVenue,
      gates: mockTestVenue.gates.map(item => ({ ...item, isOpen: false })),
    });

    expect(gate).toBeNull();
  });

  it('correctly filters highest density zones (High and Critical)', () => {
    const highDensity = getHighestDensityZones(mockTestVenue);
    expect(highDensity).toHaveLength(2);
    expect(highDensity.map(z => z.id)).toContain('z1');
    expect(highDensity.map(z => z.id)).toContain('z2');
    expect(highDensity.map(z => z.id)).not.toContain('z3');
  });

  it('correctly filters accessible open gates only', () => {
    const accessible = getAccessibleEntryOptions(mockTestVenue);
    expect(accessible).toHaveLength(1);
    // Gate 3 has accessibleReady: true but is closed. Gate 2 is open and accessibleReady.
    expect(accessible[0].id).toBe('g2');
  });

  it('grounds guidance summary in simulated data and uses safety wording', () => {
    const summary = getMapGuidanceSummary(mockTestVenue);
    expect(summary.length).toBeGreaterThan(0);

    const joined = summary.join(' ');
    expect(joined).toContain('Gate 2');
    expect(joined).toContain('North concourse');
    expect(joined).toContain('South concourse');
    expect(joined).toContain('Train Terminal');

    summary.forEach(point => {
      const lower = point.toLowerCase();
      expect(lower).toContain('simulated');
      expect(lower).not.toContain('real-time');
      expect(lower).not.toContain('live');
      expect(lower).not.toContain('official');
      expect(lower).not.toContain('dispatch');
      expect(lower).not.toContain('ticketing');
      expect(lower).not.toContain('emergency');
      expect(lower).not.toContain('api access');
    });
  });
});
