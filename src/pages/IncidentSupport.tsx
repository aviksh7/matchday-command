import React, { useState, useEffect, useRef } from 'react';
import { SIMULATED_VENUES } from '../data/mockData';
import {
  getRelatedVenueRisks,
  getIncidentSupportSummary
} from '../logic/incidentSupport';
import type { VenueData, IncidentData } from '../types';
import { postIncidentSupport } from '../logic/apiClient';
import type { IncidentSupportApiResponse, ResponseSource } from '../logic/apiClient';
import IncidentQueue from '../components/IncidentQueue';
import IncidentScenarioBuilder from '../components/IncidentScenarioBuilder';
import IncidentDecisionSupportPanel from '../components/IncidentDecisionSupportPanel';
import '../styles/operations-shared.css';
import '../styles/incident-support.css';

interface CachedApiResult {
  incidentId: string;
  data: IncidentSupportApiResponse | null;
  source: ResponseSource;
  reasonText?: string;
}

const LOCAL_INCIDENT_LIMITATIONS = [
  'Simulated prototype data only.',
  'The deterministic fallback is limited to this local venue snapshot and cannot verify conditions or replace trained staff.'
].join(' ');

const CUSTOM_SCENARIO_ID = 'SCEN-MOCK';

interface IncidentSupportProps {
  initialVenueId?: string;
  initialIncidentId?: string;
}

const resolveInitialSelection = (venueId?: string, incidentId?: string) => {
  const requestedVenue = SIMULATED_VENUES.find(item => item.id === venueId);
  const venue = requestedVenue ?? SIMULATED_VENUES[0];
  const incident = requestedVenue && incidentId
    ? requestedVenue.incidents.find(item => item.id === incidentId)
    : undefined;

  return { venue, incident };
};

const normalizeLocalSummary = (summary: ReturnType<typeof getIncidentSupportSummary>): IncidentSupportApiResponse => ({
  situationSummary: summary.situationSummary,
  priorityLevel: summary.priorityLevel,
  recommendedActions: summary.recommendedActions,
  volunteerBriefing: summary.volunteerBriefing,
  fanAnnouncementDraft: summary.fanAnnouncementDraft,
  accessibilityNote: summary.accessibilityNote,
  crowdTransitNote: summary.transitNote,
  simulatedDataUsed: Array.isArray(summary.telemetryUsed) ? summary.telemetryUsed : [summary.telemetryUsed],
  limitations: LOCAL_INCIDENT_LIMITATIONS
});

export const IncidentSupport: React.FC<IncidentSupportProps> = ({
  initialVenueId,
  initialIncidentId,
}) => {
  const initialSelectionRef = useRef(resolveInitialSelection(initialVenueId, initialIncidentId));
  const initialSelection = initialSelectionRef.current;
  const [selectedVenueId, setSelectedVenueId] = useState<string>(initialSelection.venue.id);
  const [localIncidents, setLocalIncidents] = useState<IncidentData[]>(initialSelection.venue.incidents);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(initialSelection.incident?.id ?? null);
  
  // Local Scenario Builder States
  const [customType, setCustomType] = useState<string>('Spill Hazard');
  const [customLocation, setCustomLocation] = useState<string>('Concourse Sec 102');
  const [customSeverity, setCustomSeverity] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [customScenario, setCustomScenario] = useState<IncidentData | null>(null);

  // API Client & Async Lifecycle States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiResult, setApiResult] = useState<CachedApiResult | null>(null);
  const activeRequestRef = useRef<AbortController | null>(null);
  const currentIncidentIdRef = useRef<string | null>(null);
  const currentVenueIdRef = useRef<string>(selectedVenueId);
  const previousVenueIdRef = useRef<string>(selectedVenueId);

  const selectedVenue = SIMULATED_VENUES.find(v => v.id === selectedVenueId) || SIMULATED_VENUES[0];
  const hasActiveMapContext = Boolean(
    initialSelection.incident
    && selectedVenueId === initialSelection.venue.id
    && selectedIncidentId === initialSelection.incident.id
  );

  // Reset incidents list and cancel active requests when venue changes
  useEffect(() => {
    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
      activeRequestRef.current = null;
    }
    setIsLoading(false);
    setApiResult(null);
    currentIncidentIdRef.current = null;
    currentVenueIdRef.current = selectedVenueId;

    const venueChanged = previousVenueIdRef.current !== selectedVenueId;
    previousVenueIdRef.current = selectedVenueId;

    setLocalIncidents(selectedVenue.incidents);
    if (venueChanged) {
      setSelectedIncidentId(null);
    }
    setCustomScenario(null);
  }, [selectedVenueId, selectedVenue]);

  // Clean up any pending request on unmount
  useEffect(() => {
    return () => {
      if (activeRequestRef.current) {
        activeRequestRef.current.abort();
      }
    };
  }, []);

  const triggerIncidentGeneration = async (incident: IncidentData, venue: VenueData) => {
    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
    }
    const controller = new AbortController();
    activeRequestRef.current = controller;
    currentIncidentIdRef.current = incident.id;
    const requestVenueId = venue.id;

    setIsLoading(true);
    setApiResult(null);

    try {
      const result = await postIncidentSupport(incident, venue, controller.signal);

      if (controller.signal.aborted || currentIncidentIdRef.current !== incident.id || currentVenueIdRef.current !== requestVenueId) {
        return;
      }

      if (result.success) {
        setApiResult({
          incidentId: incident.id,
          data: result.data,
          source: result.source
        });
      } else {
        const localSummary = normalizeLocalSummary(getIncidentSupportSummary(incident, venue));
        const reasonText = result.message || 'Switched to local deterministic fallback due to network or server error.';

        setApiResult({
          incidentId: incident.id,
          data: localSummary,
          source: result.source,
          reasonText
        });
      }
    } catch {
      if (controller.signal.aborted || currentIncidentIdRef.current !== incident.id || currentVenueIdRef.current !== requestVenueId) {
        return;
      }
      const localSummary = normalizeLocalSummary(getIncidentSupportSummary(incident, venue));
      setApiResult({
        incidentId: incident.id,
        data: localSummary,
        source: 'Local deterministic fallback',
        reasonText: 'Network connection failure. Switched to local deterministic fallback.'
      });
    } finally {
      if (activeRequestRef.current === controller) {
        setIsLoading(false);
        activeRequestRef.current = null;
      }
    }
  };

  const handleStatusChange = (incidentId: string, newStatus: 'Open' | 'Dispatched' | 'Resolved') => {
    if (incidentId === CUSTOM_SCENARIO_ID && customScenario) {
      setCustomScenario({ ...customScenario, status: newStatus });
    } else {
      setLocalIncidents(prev =>
        prev.map(inc => (inc.id === incidentId ? { ...inc, status: newStatus } : inc))
      );
    }
  };

  // Find the selected incident (either from the local queue or the custom scenario builder)
  let selectedIncident: IncidentData | undefined;
  if (selectedIncidentId === CUSTOM_SCENARIO_ID && customScenario) {
    selectedIncident = customScenario;
  } else if (selectedIncidentId) {
    selectedIncident = localIncidents.find(inc => inc.id === selectedIncidentId);
  }

  // Construct current snapshot venue data
  const venueSnapshot: VenueData = {
    ...selectedVenue,
    incidents: customScenario && selectedIncidentId === CUSTOM_SCENARIO_ID
      ? [customScenario, ...localIncidents] 
      : localIncidents
  };

  const handleSelectIncident = (inc: IncidentData) => {
    setSelectedIncidentId(inc.id);
    if (customScenario && customScenario.id !== inc.id) {
      setCustomScenario(null);
    }
    triggerIncidentGeneration(inc, venueSnapshot);
  };

  const handleCreateCustomScenario = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const newScenario: IncidentData = {
      id: CUSTOM_SCENARIO_ID,
      type: customType,
      location: customLocation.trim() || 'General Stadium Concourse',
      severity: customSeverity,
      status: 'Open',
      timestamp: new Date().toTimeString().split(' ')[0].substring(0, 5)
    };
    setCustomScenario(newScenario);
    setSelectedIncidentId(CUSTOM_SCENARIO_ID);

    const updatedVenueSnapshot = {
      ...selectedVenue,
      incidents: [newScenario, ...localIncidents]
    };
    triggerIncidentGeneration(newScenario, updatedVenueSnapshot);
  };

  // Get decision support outputs
  const relatedRisks = selectedIncident ? getRelatedVenueRisks(selectedIncident, venueSnapshot) : [];
  const localSupportSummary = selectedIncident ? normalizeLocalSummary(getIncidentSupportSummary(selectedIncident, venueSnapshot)) : null;
  const supportSummary = isLoading
    ? null
    : (apiResult && selectedIncident && apiResult.incidentId === selectedIncident.id && apiResult.data)
      ? apiResult.data
      : localSupportSummary;

  return (
    <div className="page-container incident-support">
      <div
        className="disclaimer-banner incident-support__notice"
        role="note"
        aria-label="Simulated incident-support limitations"
      >
        <strong>Important Simulated Notice:</strong> This incident support page uses simulated prototype data and does not access external FIFA, venue, transit, ticket, emergency, or current crowd systems. Every output is a simulated decision-support draft requiring qualified human review. Local status changes do not dispatch staff; announcement drafts are not published and carry no official authority.
      </div>

      <header className="incident-support__header">
        <div className="incident-support__intro">
          <h2>Incident Decision Support Center (Vertex AI / Local simulated decision support)</h2>
          <p>
            Prototype operations panel to review mock safety tickets, access hybrid AI checklists via Vertex AI Cloud Run or local fallback, and build custom test scenarios.
          </p>
          {hasActiveMapContext && initialSelection.incident && (
            <p role="note" aria-label="Map handoff context">
              <strong>Map context loaded:</strong> {initialSelection.venue.name}, incident {initialSelection.incident.id}. This is a local simulated handoff; review the selected record before using its decision-support draft.
            </p>
          )}
        </div>

        <div className="incident-venue-control">
          <label htmlFor="incident-venue-select">Select Venue View (Simulated):</label>
          <select
            id="incident-venue-select"
            className="mc-select mc-select--paper"
            value={selectedVenueId}
            onChange={(event) => setSelectedVenueId(event.target.value)}
            disabled={isLoading}
          >
            {SIMULATED_VENUES.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.name} ({venue.locationName})
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="incident-support__layout">
        <div className="incident-support__column">
          <IncidentQueue
            incidents={venueSnapshot.incidents}
            selectedIncidentId={selectedIncident?.id || null}
            venueName={venueSnapshot.name}
            onSelect={handleSelectIncident}
          />

          <IncidentScenarioBuilder
            incidentType={customType}
            location={customLocation}
            severity={customSeverity}
            isLoading={isLoading}
            onIncidentTypeChange={setCustomType}
            onLocationChange={setCustomLocation}
            onSeverityChange={setCustomSeverity}
            onSubmit={handleCreateCustomScenario}
          />
        </div>

        <div className="incident-support__column">
          <IncidentDecisionSupportPanel
            incident={selectedIncident}
            summary={supportSummary}
            relatedRisks={relatedRisks}
            source={apiResult?.source}
            fallbackReason={apiResult?.reasonText}
            isLoading={isLoading}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>
    </div>
  );
};

export default IncidentSupport;
