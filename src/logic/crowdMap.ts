import type { VenueData, GateData, ZoneData } from '../types';

/**
 * Find the open gate with the lowest simulated load percentage.
 * Ignores closed gates.
 */
export const getLeastCrowdedGate = (venue: VenueData): GateData | null => {
  if (!venue.gates) return null;
  const openGates = venue.gates.filter(g => g.isOpen);
  if (openGates.length === 0) return null;
  return [...openGates].sort((a, b) => a.percentage - b.percentage)[0];
};

/**
 * Filter zones with 'High' or 'Critical' density levels.
 */
export const getHighestDensityZones = (venue: VenueData): ZoneData[] => {
  if (!venue.zones) return [];
  return venue.zones.filter(z => z.density === 'High' || z.density === 'Critical');
};

/**
 * Find open gates that are accessibility-ready.
 */
export const getAccessibleEntryOptions = (venue: VenueData): GateData[] => {
  if (!venue.gates) return [];
  return venue.gates.filter(g => g.isOpen && g.accessibleReady);
};

/**
 * Generate deterministic map movement guidance based on simulated telemetry.
 * All text is grounded in mock data and avoids forbidden words.
 */
export const getMapGuidanceSummary = (venue: VenueData): string[] => {
  const guidance: string[] = [];

  // 1. Least crowded gate guidance
  const leastCrowded = getLeastCrowdedGate(venue);
  if (leastCrowded) {
    guidance.push(`Simulated guidance: The entry point with the lowest crowd pressure is simulated ${leastCrowded.name} (${leastCrowded.percentage}% load). We recommend routing incoming spectators through this lane.`);
  }

  // 2. High density zones guidance
  const highDensity = getHighestDensityZones(venue);
  if (highDensity.length > 0) {
    const zoneNames = highDensity.map(z => z.name).join(', ');
    guidance.push(`Simulated guidance: To maintain balanced movement, avoid routing large groups through simulated high-density zones: ${zoneNames}.`);
  }

  // 3. Accessibility entry guidance
  const accessibleEntries = getAccessibleEntryOptions(venue);
  if (accessibleEntries.length > 0) {
    const gateNames = accessibleEntries.map(g => g.name).join(', ');
    guidance.push(`Simulated guidance: Mobility-friendly access options are available at open, accessibility-equipped gates: ${gateNames}.`);
  } else {
    guidance.push(`Simulated guidance: No accessibility-ready entry gates are showing as open on the active dashboard.`);
  }

  // 4. Egress transit caution
  if (venue.transitStatus) {
    const heavyTransit = venue.transitStatus.filter(t => t.loadLevel === 'Critical' || t.loadLevel === 'High');
    if (heavyTransit.length > 0) {
      const transitNames = heavyTransit.map(t => `${t.type} (${t.loadLevel} load)`).join(', ');
      guidance.push(`Simulated guidance: Egress caution: High simulated load pressure at simulated departure zones: ${transitNames}. Consider holding crowd discharges or warning volunteers.`);
    }
  }

  // 5. General staff/fan movement note based on overall status
  const openGatesCount = venue.gates ? venue.gates.filter(g => g.isOpen).length : 0;
  guidance.push(`Simulated movement note: Standard prototype crowd plan is active with ${openGatesCount} gates open. Current external systems are not connected.`);

  return guidance;
};
