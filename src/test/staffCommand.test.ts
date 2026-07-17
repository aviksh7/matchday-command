import { describe, it, expect } from 'vitest';
import {
  getCriticalCrowdZones,
  getUndercoveredZones,
  getUnresolvedIncidents,
  getStaffPriorityQueue,
  getRecommendedStaffActions
} from '../logic/staffCommand';
import type { VenueData } from '../types';

const mockTestVenue: VenueData = {
  id: 'test-stadium-staff',
  name: 'Test Staff Venue',
  locationName: 'Test City',
  simulatedCapacity: 60000,
  isSimulatedPrototype: true,
  simulationDisclaimer: 'Test disclaimer',
  gates: [
    { id: 'g1', name: 'Gate 1', pressure: 'High', percentage: 90, isOpen: true, accessibleReady: true },
    { id: 'g2', name: 'Gate 2', pressure: 'Medium', percentage: 55, isOpen: true, accessibleReady: false },
    { id: 'g3', name: 'Gate 3', pressure: 'Low', percentage: 15, isOpen: true, accessibleReady: true },
    { id: 'g4', name: 'Gate 4', pressure: 'Low', percentage: 10, isOpen: false, accessibleReady: false }
  ],
  zones: [
    { id: 'z1', name: 'North Zone', density: 'Critical', occupancyPercentage: 85, volunteerCount: 3 },
    { id: 'z2', name: 'South Zone', density: 'High', occupancyPercentage: 70, volunteerCount: 15 },
    { id: 'z3', name: 'East Zone', density: 'Low', occupancyPercentage: 20, volunteerCount: 8 }
  ],
  concessions: [],
  accessibilityRequests: [
    { id: 'a1', type: 'Wheelchair Assistance', location: 'Gate 1', status: 'Pending', timestamp: '12:00' },
    { id: 'a2', type: 'Sign Language', location: 'Gate 2', status: 'In Progress', timestamp: '12:05' }
  ],
  transitStatus: [
    { id: 't1', type: 'Train Terminal', status: 'Normal Operations', crowdPressurePercentage: 85, loadLevel: 'Critical' },
    { id: 't2', type: 'Bus Shuttle', status: 'Normal Operations', crowdPressurePercentage: 20, loadLevel: 'Low' }
  ],
  sustainability: {
    waterRefillStationLoadPercentage: 40,
    wasteSortingCompliancePercentage: 70,
    greenTransitEncouragementPercentage: 80
  },
  incidents: [
    { id: 'i1', type: 'Spill', location: 'Sec 101', severity: 'Medium', status: 'Open', timestamp: '12:00' },
    { id: 'i2', type: 'Medical Alert', location: 'Sec 102', severity: 'High', status: 'Open', timestamp: '12:02' },
    { id: 'i3', type: 'Lost Item', location: 'Sec 103', severity: 'Low', status: 'Resolved', timestamp: '11:00' }
  ]
};

describe('Staff Command Helper Logic Functions', () => {
  it('correctly filters critical or high density zones', () => {
    const criticalZones = getCriticalCrowdZones(mockTestVenue);
    expect(criticalZones).toHaveLength(2);
    expect(criticalZones.map(z => z.id)).toContain('z1');
    expect(criticalZones.map(z => z.id)).toContain('z2');
  });

  it('correctly identifies undercovered zones', () => {
    // z1: occupancy 85% (>50%), volunteerCount 3 (<10) -> Undercovered
    // z2: occupancy 70% (>50%), volunteerCount 15 (>=10) -> Covered
    // z3: occupancy 20% (<=50%) -> Covered
    const undercovered = getUndercoveredZones(mockTestVenue);
    expect(undercovered).toHaveLength(1);
    expect(undercovered[0].id).toBe('z1');
  });

  it('correctly filters unresolved incidents', () => {
    const unresolved = getUnresolvedIncidents(mockTestVenue);
    expect(unresolved).toHaveLength(2);
    expect(unresolved.map(inc => inc.id)).toContain('i1');
    expect(unresolved.map(inc => inc.id)).toContain('i2');
    expect(unresolved.map(inc => inc.id)).not.toContain('i3');
  });

  it('correctly constructs and sorts the priority queue by severity risk', () => {
    const queue = getStaffPriorityQueue({
      ...mockTestVenue,
      incidents: [
        ...mockTestVenue.incidents,
        { id: 'i4', type: 'Lost guest', location: 'Sec 104', severity: 'Low', status: 'Open', timestamp: '12:04' },
      ],
    });
    const severityRank = { High: 3, Medium: 2, Low: 1 } as const;
    const ranks = queue.map(item => severityRank[item.severity]);

    expect(ranks).toEqual([...ranks].sort((first, second) => second - first));
    expect(queue.some(item => item.severity === 'Low')).toBe(true);
  });

  it.each([
    [49, []],
    [50, ['Medium']],
    [79, ['Medium']],
    [80, ['High']],
  ] as const)('classifies an open gate at %i%% in the priority queue', (percentage, expectedSeverities) => {
    const queue = getStaffPriorityQueue({
      ...mockTestVenue,
      gates: [
        { id: 'boundary', name: 'Boundary gate', pressure: 'Medium', percentage, isOpen: true, accessibleReady: true },
      ],
      zones: [],
      incidents: [],
    });

    expect(queue.map(item => item.severity)).toEqual(expectedSeverities);
  });

  it.each([
    [49, true],
    [50, false],
  ] as const)('only recommends a lower-pressure diversion target below 50%% (%i%%)', (targetPressure, shouldRecommend) => {
    const actions = getRecommendedStaffActions({
      ...mockTestVenue,
      gates: [
        { id: 'high', name: 'High gate', pressure: 'High', percentage: 90, isOpen: true, accessibleReady: false },
        { id: 'target', name: 'Target gate', pressure: 'Medium', percentage: targetPressure, isOpen: true, accessibleReady: true },
      ],
      zones: [],
      incidents: [],
      transitStatus: [],
      accessibilityRequests: [],
    });

    expect(actions.join(' ').includes('Target gate')).toBe(shouldRecommend);
  });

  it('grounds recommended actions in the simulated telemetry and uses safe wording', () => {
    const actions = getRecommendedStaffActions(mockTestVenue);
    expect(actions).toHaveLength(5); // i2 (High Incident), z1 (undercovered), g1 (High pressure Gate 1), t1 (Critical Train), a1 (Pending Accessibility)
    
    // Test grounding details are present
    const joinedActions = actions.join(' ');
    expect(joinedActions).toContain('i2');
    expect(joinedActions).toContain('Medical Alert');
    expect(joinedActions).toContain('North Zone');
    expect(joinedActions).toContain('Gate 1');
    expect(joinedActions).toContain('Train Terminal');
    expect(joinedActions).toContain('Wheelchair Assistance');

    // Ensure safe wording: no claims of real-time, live, official, dispatch, ticketing or emergency access
    actions.forEach(action => {
      const lower = action.toLowerCase();
      expect(lower).toContain('simulated');
      expect(lower).not.toContain('real-time');
      expect(lower).not.toContain('official');
      expect(lower).not.toContain('emergency response');
      expect(lower).not.toContain('live systems');
    });
  });
});
