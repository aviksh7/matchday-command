import type { VenueData, AssistantResponse } from '../types';
import { getLowestPressureOpenGate } from './operations';

export type AssistantPromptKey = 
  | 'least-crowded-gate'
  | 'low-wait-concessions'
  | 'accessible-guidance'
  | 'transit-pressures'
  | 'sustainability-tips'
  | 'translate-announcement';

export const SIMULATED_VENUE_ANNOUNCEMENT =
  'Attention fans: Please walk on the concourse ramps, move slowly, and keep the marked wheelchair lanes clear.';

/**
 * Local simulated response engine. Computes responses using mock venue telemetry data.
 * All responses are clearly marked as simulated and prototype-only.
 */
export const getSimulatedAssistantResponse = (
  promptKey: AssistantPromptKey | 'custom',
  customQuery: string | null,
  venue: VenueData
): AssistantResponse => {
  // If custom query, check for keyword matches
  let activeKey: AssistantPromptKey | 'custom' = promptKey;
  if (activeKey === 'custom' && customQuery) {
    const queryLower = customQuery.toLowerCase();
    if (queryLower.includes('gate') || queryLower.includes('entrance') || queryLower.includes('enter')) {
      activeKey = 'least-crowded-gate';
    } else if (queryLower.includes('restroom') || queryLower.includes('toilet') || queryLower.includes('wait') || queryLower.includes('concession') || queryLower.includes('food') || queryLower.includes('merch')) {
      activeKey = 'low-wait-concessions';
    } else if (queryLower.includes('accessible') || queryLower.includes('wheelchair') || queryLower.includes('sensory') || queryLower.includes('sign')) {
      activeKey = 'accessible-guidance';
    } else if (queryLower.includes('transit') || queryLower.includes('train') || queryLower.includes('bus') || queryLower.includes('rideshare')) {
      activeKey = 'transit-pressures';
    } else if (queryLower.includes('sustainability') || queryLower.includes('eco') || queryLower.includes('recycling') || queryLower.includes('refill')) {
      activeKey = 'sustainability-tips';
    } else if (queryLower.includes('translate') || queryLower.includes('announcement') || queryLower.includes('language')) {
      activeKey = 'translate-announcement';
    }
  }

  switch (activeKey) {
    case 'least-crowded-gate': {
      const leastCrowded = getLowestPressureOpenGate(venue);
      if (!leastCrowded) {
        return {
          answer: `All gates are currently showing as closed in the simulated system.`,
          action: `Please wait for announcements or approach stadium guest services for direct instructions.`,
          telemetryUsed: `Simulated gates: ${venue.gates.map(g => `${g.name} (Closed)`).join(', ')}.`,
          disclaimer: `Simulated response based on prototype data. This is not an authorized or current gate status.`
        };
      }
      
      const allGatePressures = venue.gates.map(g => `${g.name} (${g.isOpen ? `${g.percentage}% load` : 'Closed'})`).join(', ');

      return {
        answer: `Based on simulated stadium telemetry, ${leastCrowded.name} is recommended as it has the lowest intake pressure (${leastCrowded.percentage}% load).`,
        action: `Proceed to ${leastCrowded.name} to minimize entrance wait times.`,
        telemetryUsed: `Simulated gates telemetry: ${allGatePressures}.`,
        disclaimer: `Simulated response based on prototype data. This does not access current stadium queue systems.`
      };
    }

    case 'low-wait-concessions': {
      if (venue.concessions.length === 0) {
        return {
          answer: `No simulated concession telemetry is available for this venue.`,
          action: `Follow physical signage once inside the concourse.`,
          telemetryUsed: `None.`,
          disclaimer: `Simulated response based on prototype data.`
        };
      }

      const sortedConcessions = [...venue.concessions].sort((a, b) => a.waitTimeMinutes - b.waitTimeMinutes);
      const lowestWait = sortedConcessions[0];
      const foodConcessions = venue.concessions.filter(c => c.type === 'Food');
      const lowestFood = foodConcessions.length > 0 ? foodConcessions.sort((a, b) => a.waitTimeMinutes - b.waitTimeMinutes)[0] : null;

      let answer = `According to simulated concourse queues, ${lowestWait.name} (${lowestWait.type}) has the lowest estimated wait time of ${lowestWait.waitTimeMinutes} minutes.`;
      let action = `For quick services, proceed to ${lowestWait.name}.`;
      if (lowestFood && lowestFood.id !== lowestWait.id) {
        answer += ` For food specifically, ${lowestFood.name} has the lowest wait at ${lowestFood.waitTimeMinutes} minutes.`;
        action = `Proceed to ${lowestWait.name} for general needs, or ${lowestFood.name} for food.`;
      }

      const allConcessionQueues = venue.concessions.map(c => `${c.name} (${c.waitTimeMinutes} mins wait)`).join(', ');

      return {
        answer,
        action,
        telemetryUsed: `Simulated concession wait times: ${allConcessionQueues}.`,
        disclaimer: `Simulated response based on prototype data. Not connected to real concession or bathroom wait sensors.`
      };
    }

    case 'accessible-guidance': {
      const accessibleGates = venue.gates.filter(g => g.isOpen && g.accessibleReady).map(g => g.name);
      const pendingReqsCount = venue.accessibilityRequests.filter(r => r.status === 'Pending').length;

      let answer = `Simulated accessibility status shows that the following open gates are equipped with accessible lanes: ${accessibleGates.join(', ') || 'None'}.`;
      let action = `Approach one of these gates for wheelchair-ready security screening.`;

      const activeBooths = venue.id === 'mexico-demo' ? 'Information Booth 2' : venue.id === 'nynj-demo' ? 'Gate C Guest Services' : 'North Guest Services';
      answer += ` Assistance points are active at the ${activeBooths}.`;
      action += ` For mobility support inside the stadium, locate the ${activeBooths}.`;

      if (pendingReqsCount > 0) {
        const supportRequestLabel = pendingReqsCount === 1 ? 'request' : 'requests';
        answer += ` Note: This simulated snapshot contains ${pendingReqsCount} pending accessibility support ${supportRequestLabel}.`;
      }

      return {
        answer,
        action,
        telemetryUsed: `Simulated accessibility gates: ${venue.gates.map(g => `${g.name} (${g.accessibleReady ? 'Ready' : 'Standard'})`).join(', ')}. Active support tickets: ${venue.accessibilityRequests.length}.`,
        disclaimer: `Simulated accessibility guidance helper. Does not guarantee real-world stadium ADA route accuracy.`
      };
    }

    case 'transit-pressures': {
      if (venue.transitStatus.length === 0) {
        return {
          answer: `No transit telemetry data is simulated for this venue.`,
          action: `Please follow municipal signs and steward directions outside the exit plaza.`,
          telemetryUsed: `None.`,
          disclaimer: `Simulated response based on prototype data.`
        };
      }

      const sortedTransit = [...venue.transitStatus].sort((a, b) => a.crowdPressurePercentage - b.crowdPressurePercentage);
      const lowestPressure = sortedTransit[0];
      const highestPressure = sortedTransit[sortedTransit.length - 1];

      return {
        answer: `Simulated transit monitoring indicates that the ${lowestPressure.type} is operating with the lowest crowd pressure (${lowestPressure.crowdPressurePercentage}% load, status: ${lowestPressure.status}). The ${highestPressure.type} is showing high pressure (${highestPressure.crowdPressurePercentage}% load).`,
        action: `If it suits your plans, consider the ${lowestPressure.type} to reduce exposure to higher simulated crowd pressure. Confirm actual service and departure information on posted transit signs or with transit staff.`,
        telemetryUsed: `Simulated transit statuses: ${venue.transitStatus.map(t => `${t.type} (${t.status}, ${t.crowdPressurePercentage}% pressure)`).join(', ')}.`,
        disclaimer: `Simulated transit data. Not connected to real municipal transit feeds, current transit timetables, or GPS mapping services.`
      };
    }

    case 'sustainability-tips': {
      const metrics = venue.sustainability;
      return {
        answer: `The local prototype snapshot assigns water refill stations a simulated ${metrics.waterRefillStationLoadPercentage}% load indicator and waste sorting a simulated ${metrics.wasteSortingCompliancePercentage}% compliance indicator.`,
        action: `Use refill and sorting facilities where available. These prototype indicators are guidance cues, not measurements of environmental impact.`,
        telemetryUsed: `Simulated sustainability indicators: refill station load (${metrics.waterRefillStationLoadPercentage}%), sorting compliance (${metrics.wasteSortingCompliancePercentage}%), green-transit encouragement (${metrics.greenTransitEncouragementPercentage}%).`,
        disclaimer: `Simulated sustainability guidance for demonstration only. No live facility feed or measured environmental impact is available.`
      };
    }

    case 'translate-announcement': {
      return {
        answer: `Limited deterministic translation demonstration for this simulated venue announcement ("${SIMULATED_VENUE_ANNOUNCEMENT}"):
• Spanish: "Atención, aficionados: caminen por las rampas del vestíbulo, avancen despacio y mantengan despejados los carriles señalizados para sillas de ruedas."
• French: "Supporters, attention : marchez sur les rampes du hall, avancez lentement et laissez dégagées les voies signalées pour les fauteuils roulants."`,
        action: `Review this fixed Spanish and French sample with a qualified language reviewer before use. The local fallback cannot translate other text or languages and does not publish announcements.`,
        telemetryUsed: `Fixed simulated venue announcement; local fallback sample languages: Spanish and French.`,
        disclaimer: `Simulated translation demonstration only. Language coverage and translation accuracy are not guaranteed. The deterministic fallback is limited to this fixed announcement in Spanish and French and is not connected to public-address systems.`
      };
    }

    default: {
      const escapedQuery = customQuery ? customQuery.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
      return {
        answer: `I received your query: "${escapedQuery || '...'}"
 
Natural language processing and context-aware guidance are processed by Vertex AI via Cloud Run when available, with deterministic local simulation as the offline or error fallback.`,
        action: `Try clicking one of the quick action buttons above, or search for keywords like "gates", "restrooms", "transit", "wheelchair", or "eco" to test the simulated telemetry grounding engine.`,
        telemetryUsed: `None (Keyword fallback trigger).`,
        disclaimer: `Simulated prototype response.`
      };
    }
  }
};
