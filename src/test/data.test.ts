import { describe, it, expect } from 'vitest';
import { SIMULATED_VENUES } from '../data/mockData';

describe('Simulated Venue Datasets Security Constraints', () => {
  it('contains exactly 3 simulated demo venues', () => {
    expect(SIMULATED_VENUES).toHaveLength(3);
  });

  it('marks every venue with the isSimulatedPrototype flag', () => {
    SIMULATED_VENUES.forEach(venue => {
      expect(venue.isSimulatedPrototype).toBe(true);
    });
  });

  it('contains a non-empty simulationDisclaimer on every venue', () => {
    SIMULATED_VENUES.forEach(venue => {
      expect(venue.simulationDisclaimer).toBeDefined();
      expect(venue.simulationDisclaimer.trim().length).toBeGreaterThan(0);
    });
  });

  it('declares simulatedCapacity for every venue without claiming real data', () => {
    SIMULATED_VENUES.forEach(venue => {
      expect(venue.simulatedCapacity).toBeDefined();
      expect(typeof venue.simulatedCapacity).toBe('number');
      expect(venue.simulatedCapacity).toBeGreaterThan(0);
    });
  });
});
