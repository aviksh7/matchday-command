import type { VenueData, AssistantResponse } from '../types';

export type AssistantPromptKey = 
  | 'least-crowded-gate'
  | 'low-wait-concessions'
  | 'accessible-guidance'
  | 'transit-pressures'
  | 'sustainability-tips'
  | 'translate-announcement';

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
      const openGates = venue.gates.filter(g => g.isOpen);
      if (openGates.length === 0) {
        return {
          answer: `All gates are currently showing as closed in the simulated system.`,
          action: `Please wait for announcements or approach stadium guest services for direct instructions.`,
          telemetryUsed: `Simulated gates: ${venue.gates.map(g => `${g.name} (Closed)`).join(', ')}.`,
          disclaimer: `Simulated response based on prototype data. This is not a live or official gate status.`
        };
      }
      
      const leastCrowded = [...openGates].sort((a, b) => a.percentage - b.percentage)[0];
      const allGatePressures = venue.gates.map(g => `${g.name} (${g.isOpen ? `${g.percentage}% load` : 'Closed'})`).join(', ');

      return {
        answer: `Based on simulated stadium telemetry, ${leastCrowded.name} is recommended as it has the lowest intake pressure (${leastCrowded.percentage}% load).`,
        action: `Proceed to ${leastCrowded.name} to minimize entrance wait times.`,
        telemetryUsed: `Simulated gates telemetry: ${allGatePressures}.`,
        disclaimer: `Simulated response based on prototype data. This does not access real-time stadium queues.`
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
        answer += ` Note: Stadium operations has ${pendingReqsCount} pending accessibility ticket(s) currently being dispatched.`;
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
        action: `To avoid departure delays, we recommend routing via the ${lowestPressure.type} if it aligns with your travel plans.`,
        telemetryUsed: `Simulated transit statuses: ${venue.transitStatus.map(t => `${t.type} (${t.status}, ${t.crowdPressurePercentage}% pressure)`).join(', ')}.`,
        disclaimer: `Simulated transit data. Not connected to real municipal transit feeds, live timetables, or GPS mapping services.`
      };
    }

    case 'sustainability-tips': {
      const metrics = venue.sustainability;
      return {
        answer: `Simulated green metrics indicate water refill stations are operating at a ${metrics.waterRefillStationLoadPercentage}% load level, and waste sorting stations are showing a ${metrics.wasteSortingCompliancePercentage}% sorting compliance rate.`,
        action: `Bring a reusable container and locate a refill station. Thank you for participating in the recycling scheme, currently showing ${metrics.wasteSortingCompliancePercentage}% sorting compliance!`,
        telemetryUsed: `Simulated sustainability telemetry: Refill stations (${metrics.waterRefillStationLoadPercentage}%), sorting compliance (${metrics.wasteSortingCompliancePercentage}%), green transport usage (${metrics.greenTransitEncouragementPercentage}%).`,
        disclaimer: `Simulated sustainability feedback for demonstration purposes only.`
      };
    }

    case 'translate-announcement': {
      const sampleAnnouncement = `Attention fans, please do not run on the concourse ramps. Proceed slowly and yield to wheelchair lanes.`;
      return {
        answer: `Simulated Multilingual Translation Placeholder for PA announcement ("${sampleAnnouncement}"):
• Spanish: "Atención aficionados, por favor no corran en las rampas del corredor. Procedan despacio y cedan el paso a los carriles de sillas de ruedas."
• French: "Attention aux supporters, veuillez ne pas courir sur les rampes du hall. Procédez lentement et cédez le passage aux voies pour fauteuils roulants."`,
        action: `This is a prototype translation placeholder. In a future update, this action will be powered by the server-side Gemini API on Google Cloud Run to translate live PA announcements.`,
        telemetryUsed: `Static PA announcement template template_01.`,
        disclaimer: `Simulated translation placeholder. Does not guarantee real translation accuracy or connect to live public address systems.`
      };
    }

    default: {
      const escapedQuery = customQuery ? customQuery.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
      return {
        answer: `I received your query: "${escapedQuery || '...'}"

This simulated prototype assistant is Gemini-ready. Natural language processing and real-time operations guidance will be powered by the Gemini API server-side on Google Cloud Run in a future milestone.`,
        action: `Try clicking one of the quick action buttons above, or search for keywords like "gates", "restrooms", "transit", "wheelchair", or "eco" to test the simulated telemetry grounding engine.`,
        telemetryUsed: `None (Keyword fallback trigger).`,
        disclaimer: `Simulated prototype response.`
      };
    }
  }
};
