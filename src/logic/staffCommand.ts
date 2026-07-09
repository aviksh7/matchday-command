import type { VenueData, ZoneData, IncidentData, PriorityQueueItem } from '../types';

/**
 * Filter zones with 'Critical' or 'High' density levels.
 */
export const getCriticalCrowdZones = (venue: VenueData): ZoneData[] => {
  if (!venue.zones) return [];
  return venue.zones.filter(z => z.density === 'Critical' || z.density === 'High');
};

/**
 * Identify zones with high occupancy (>50%) but low volunteer coverage (<10 volunteers).
 */
export const getUndercoveredZones = (venue: VenueData): ZoneData[] => {
  if (!venue.zones) return [];
  return venue.zones.filter(z => z.occupancyPercentage > 50 && z.volunteerCount < 10);
};

/**
 * Filter unresolved (non-Resolved) incidents.
 */
export const getUnresolvedIncidents = (venue: VenueData): IncidentData[] => {
  if (!venue.incidents) return [];
  return venue.incidents.filter(inc => inc.status !== 'Resolved');
};

/**
 * Construct and sort a staff priority queue based on risk factors:
 * High severity incidents, critical gate pressure (>=80%), and critical zones.
 * Sorted by severity: High > Medium > Low.
 */
export const getStaffPriorityQueue = (venue: VenueData): PriorityQueueItem[] => {
  const queue: PriorityQueueItem[] = [];

  // Add unresolved incidents
  const activeIncidents = getUnresolvedIncidents(venue);
  activeIncidents.forEach(inc => {
    queue.push({
      id: inc.id,
      type: 'Incident',
      location: inc.location,
      details: `Active incident: ${inc.type}`,
      severity: inc.severity
    });
  });

  // Add high gate pressures (>=80%)
  if (venue.gates) {
    venue.gates.forEach(gate => {
      if (gate.isOpen && gate.percentage >= 80) {
        queue.push({
          id: `gate-${gate.id}`,
          type: 'Gate Pressure',
          location: gate.name,
          details: `Simulated high load pressure: ${gate.percentage}%`,
          severity: 'High'
        });
      } else if (gate.isOpen && gate.percentage >= 50) {
        queue.push({
          id: `gate-${gate.id}`,
          type: 'Gate Pressure',
          location: gate.name,
          details: `Simulated elevated load pressure: ${gate.percentage}%`,
          severity: 'Medium'
        });
      }
    });
  }

  // Add high/critical zones
  if (venue.zones) {
    venue.zones.forEach(zone => {
      if (zone.density === 'Critical') {
        queue.push({
          id: `zone-${zone.id}`,
          type: 'Crowd Density',
          location: zone.name,
          details: `Simulated critical density: ${zone.occupancyPercentage}% occupancy`,
          severity: 'High'
        });
      } else if (zone.density === 'High') {
        queue.push({
          id: `zone-${zone.id}`,
          type: 'Crowd Density',
          location: zone.name,
          details: `Simulated high density: ${zone.occupancyPercentage}% occupancy`,
          severity: 'Medium'
        });
      }
    });
  }

  // Sort queue by severity: High > Medium > Low
  const severityWeights = {
    'High': 3,
    'Medium': 2,
    'Low': 1
  };

  return queue.sort((a, b) => severityWeights[b.severity] - severityWeights[a.severity]);
};

/**
 * Generate deterministic staff recommendations grounded in simulated telemetry.
 * Wording is safe and explicitly references prototype/simulated data.
 */
export const getRecommendedStaffActions = (venue: VenueData): string[] => {
  const actions: string[] = [];

  // 1. Check unresolved incidents
  const activeIncidents = getUnresolvedIncidents(venue);
  const highIncidents = activeIncidents.filter(inc => inc.severity === 'High');
  if (highIncidents.length > 0) {
    highIncidents.forEach(inc => {
      actions.push(`Simulated operational recommendation: Dispatch nearest volunteer squad to active incident ${inc.id} (${inc.type}) at simulated ${inc.location}.`);
    });
  }

  // 2. Check undercovered zones
  const undercovered = getUndercoveredZones(venue);
  if (undercovered.length > 0) {
    undercovered.forEach(zone => {
      actions.push(`Simulated operational recommendation: Reassign field staff to undercovered zone: ${zone.name} (Simulated occupancy is ${zone.occupancyPercentage}% with only ${zone.volunteerCount} volunteers).`);
    });
  }

  // 3. Check high pressure gates and recommend redirecting to lowest pressure open gate
  if (venue.gates) {
    const highPressureGates = venue.gates.filter(g => g.isOpen && g.percentage >= 80);
    const openGates = venue.gates.filter(g => g.isOpen);
    const leastCrowded = openGates.length > 0 ? [...openGates].sort((a, b) => a.percentage - b.percentage)[0] : null;

    if (highPressureGates.length > 0 && leastCrowded && leastCrowded.percentage < 50) {
      highPressureGates.forEach(gate => {
        actions.push(`Simulated operational recommendation: Monitor bottleneck at ${gate.name} (${gate.percentage}% simulated pressure). Instruct static volunteers to guide inbound flow toward ${leastCrowded.name} (${leastCrowded.percentage}% simulated pressure).`);
      });
    }
  }

  // 4. Check transit pressure
  if (venue.transitStatus) {
    const highTransit = venue.transitStatus.filter(t => t.loadLevel === 'Critical' || t.loadLevel === 'High');
    if (highTransit.length > 0) {
      highTransit.forEach(t => {
        actions.push(`Simulated operational recommendation: Prepare egress path safety barriers for simulated ${t.type} showing ${t.crowdPressurePercentage}% simulated load (${t.loadLevel}).`);
      });
    }
  }

  // 5. Check pending accessibility requests
  if (venue.accessibilityRequests) {
    const pendingRequests = venue.accessibilityRequests.filter(r => r.status === 'Pending');
    if (pendingRequests.length > 0) {
      pendingRequests.forEach(req => {
        actions.push(`Simulated operational recommendation: Coordinate accessibility support: Assign volunteer escort for pending ${req.type} request at simulated ${req.location}.`);
      });
    }
  }

  // If list is empty, return a default simulated check recommendation
  if (actions.length === 0) {
    actions.push("Simulated operational recommendation: All metrics are within baseline parameters. Proceed with standard prototype volunteer patrol routes.");
  }

  return actions;
};
