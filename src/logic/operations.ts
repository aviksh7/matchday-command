import type { VenueData, IncidentData } from '../types';

/**
 * Calculates the average gate pressure percentage across all gates in the venue.
 */
export const calculateAverageGatePressure = (venue: VenueData): number => {
  if (!venue.gates || venue.gates.length === 0) return 0;
  const sum = venue.gates.reduce((acc, gate) => acc + gate.percentage, 0);
  return Math.round(sum / venue.gates.length);
};

/**
 * Filter active (non-resolved) incidents and sort them by severity (High > Medium > Low).
 */
export const getHighestPriorityIncidents = (venue: VenueData): IncidentData[] => {
  if (!venue.incidents) return [];
  
  const activeIncidents = venue.incidents.filter(inc => inc.status !== 'Resolved');
  
  const severityWeights = {
    'High': 3,
    'Medium': 2,
    'Low': 1
  };
  
  return [...activeIncidents].sort((a, b) => {
    return severityWeights[b.severity] - severityWeights[a.severity];
  });
};

/**
 * Summarizes accessibility request statuses.
 */
export const summarizeAccessibilityRequests = (venue: VenueData): { pendingCount: number; activeCount: number } => {
  if (!venue.accessibilityRequests) return { pendingCount: 0, activeCount: 0 };
  
  let pendingCount = 0;
  let activeCount = 0;
  
  venue.accessibilityRequests.forEach(req => {
    if (req.status === 'Pending') {
      pendingCount++;
    } else if (req.status === 'In Progress') {
      activeCount++;
    }
  });
  
  return { pendingCount, activeCount };
};

/**
 * Determines the overall status level of a venue based on its telemetry:
 * - 'Critical': Average gate pressure > 80%, OR any zone is 'Critical', OR there are High-severity active incidents.
 * - 'Elevated': Average gate pressure > 50%, OR any zone is 'High', OR there are Medium-severity active incidents.
 * - 'Normal': Default fallback.
 */
export const getOverallVenueStatus = (venue: VenueData): 'Normal' | 'Elevated' | 'Critical' => {
  const avgGatePressure = calculateAverageGatePressure(venue);
  
  const hasHighIncidents = venue.incidents.some(inc => inc.status !== 'Resolved' && inc.severity === 'High');
  const hasCriticalZones = venue.zones.some(z => z.density === 'Critical');
  
  if (avgGatePressure > 80 || hasHighIncidents || hasCriticalZones) {
    return 'Critical';
  }
  
  const hasMediumIncidents = venue.incidents.some(inc => inc.status !== 'Resolved' && inc.severity === 'Medium');
  const hasHighZones = venue.zones.some(z => z.density === 'High');
  
  if (avgGatePressure > 50 || hasMediumIncidents || hasHighZones) {
    return 'Elevated';
  }
  
  return 'Normal';
};
