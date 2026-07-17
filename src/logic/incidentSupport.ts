import type { VenueData, IncidentData } from '../types';
import { PRESSURE_THRESHOLDS } from './operations';

export interface IncidentSupportSummary {
  situationSummary: string;
  priorityLevel: 'High' | 'Medium' | 'Low';
  recommendedActions: string[];
  fanAnnouncementDraft: string;
  volunteerBriefing: string;
  accessibilityNote: string;
  transitNote: string;
  telemetryUsed: string;
  disclaimer: string;
}

/**
 * Determine incident priority level.
 */
export const getIncidentPriority = (incident: IncidentData): 'High' | 'Medium' | 'Low' => {
  return incident.severity;
};

/**
 * Identify risk factors near the incident location using simulated venue telemetry.
 */
export const getRelatedVenueRisks = (incident: IncidentData, venue: VenueData): string[] => {
  const risks: string[] = [];
  const locLower = incident.location.toLowerCase();

  // Check if location is near high-pressure gates
  if (venue.gates) {
    venue.gates.forEach(gate => {
      const gateNameLower = gate.name.toLowerCase();
      if (locLower.includes(gateNameLower) || gateNameLower.includes(locLower)) {
        if (gate.percentage >= PRESSURE_THRESHOLDS.CRITICAL) {
          risks.push(`High crowd pressure at adjacent simulated gate: ${gate.name} (${gate.percentage}% simulated load).`);
        }
      }
    });
  }

  // Check if location matches a critical concourse zone
  if (venue.zones) {
    venue.zones.forEach(zone => {
      const zoneNameLower = zone.name.toLowerCase();
      if (locLower.includes(zoneNameLower) || zoneNameLower.includes(locLower)) {
        if (zone.density === 'Critical' || zone.density === 'High') {
          risks.push(`Critical crowd density in local simulated concourse: ${zone.name} (${zone.occupancyPercentage}% simulated occupancy).`);
        }
      }
    });
  }

  if (risks.length === 0) {
    risks.push("No immediate simulated venue bottlenecks or critical crowd pressures detected near this location.");
  }

  return risks;
};

/**
 * Generate step-by-step support action plan based on simulated telemetry.
 */
export const generateLocalActionPlan = (incident: IncidentData, venue: VenueData): string[] => {
  const steps: string[] = [];
  const priority = getIncidentPriority(incident);

  // Grounded in incident details
  steps.push(`Deploy simulated volunteer support team to inspect simulated ${incident.location} for report type: ${incident.type}.`);

  if (priority === 'High') {
    steps.push("Instruct volunteers at nearby sectors to form safety guiding lanes and slow down inbound flow.");
  } else if (priority === 'Medium') {
    steps.push("Alert nearby informational volunteers to stand by for guidance adjustments.");
  }

  // Grounded in accessibility requirements
  const pendingAccessibility = venue.accessibilityRequests ? venue.accessibilityRequests.filter(r => r.status === 'Pending') : [];
  if (pendingAccessibility.length > 0) {
    steps.push(`Coordinate with accessibility helpers: Ensure wheelchair lanes remain unobstructed during this incident support.`);
  }

  // Egress transit grounding
  if (venue.transitStatus) {
    const criticalTransit = venue.transitStatus.filter(t => t.loadLevel === 'Critical');
    if (criticalTransit.length > 0) {
      steps.push("Note egress load levels: Delay secondary non-essential stadium egress redirects until crowd clearance at exit sectors is complete.");
    }
  }

  steps.push("Complete simulated review of response planning draft and log updates locally.");

  return steps;
};

/**
 * Generate volunteer briefing guidelines.
 */
export const generateVolunteerBriefing = (incident: IncidentData, _venue: VenueData): string => {
  const priority = getIncidentPriority(incident);
  const instructions = [
    `Prototype staff briefing for simulated ${incident.location} (${incident.type}):`,
    `- Keep main concourse pathways clear.`,
    `- Advise spectators to move calmly around simulated ${incident.location}.`,
    priority === 'High' ? `- Alert sector leads to coordinate volunteer placement.` : `- Maintain regular prototype patrol routes.`
  ];

  return instructions.join('\n');
};

/**
 * Generate prototype public announcement draft.
 */
export const generateFanAnnouncementDraft = (incident: IncidentData, _venue: VenueData): string => {
  return `Prototype announcement draft (Not authorized for stadium broadcast): "Spectators near simulated ${incident.location}, please follow volunteer directions and move calmly through the concourse lanes. Thank you for your cooperation."`;
};

/**
 * Aggregate all local simulated decision support elements.
 */
export const getIncidentSupportSummary = (incident: IncidentData, venue: VenueData): IncidentSupportSummary => {
  const priority = getIncidentPriority(incident);
  const recommendedActions = generateLocalActionPlan(incident, venue);
  const fanAnnouncementDraft = generateFanAnnouncementDraft(incident, venue);
  const volunteerBriefing = generateVolunteerBriefing(incident, venue);

  // Generate accessibility notes
  const accessibleGates = venue.gates ? venue.gates.filter(g => g.isOpen && g.accessibleReady).map(g => g.name).join(', ') : '';
  const accessibilityNote = accessibleGates.length > 0
    ? `Simulated accessibility note: Ensure spectator routing does not block pathways leading to open accessible gates: ${accessibleGates}.`
    : `Simulated accessibility note: No accessible gates are open in the simulated snapshot. Prepare volunteer wheelchair escorts.`;

  // Generate transit notes
  const activeTransit = venue.transitStatus ? venue.transitStatus.map(t => `${t.type} (${t.loadLevel} load)`).join(', ') : 'None';
  const transitNote = `Simulated transit note: Current egress flow parameters show transit loading as: ${activeTransit}. Adjust egress gate release rates if loads are high.`;

  const telemetryUsed = `Simulated telemetry grounded in: Venue ${venue.name}, Gates (${venue.gates ? venue.gates.length : 0} open/closed states), Active Incident Severity (${incident.severity}).`;

  return {
    situationSummary: `Simulated situation: Active incident ${incident.id} (${incident.type}) at simulated ${incident.location} with simulated severity level ${incident.severity}.`,
    priorityLevel: priority,
    recommendedActions,
    fanAnnouncementDraft,
    volunteerBriefing,
    accessibilityNote,
    transitNote,
    telemetryUsed,
    disclaimer: "This simulated incident support plan uses simulated prototype data and does not access external FIFA, venue, transit, ticket, emergency, or current crowd systems."
  };
};
