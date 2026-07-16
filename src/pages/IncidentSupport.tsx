import React, { useState, useEffect, useRef } from 'react';
import { SIMULATED_VENUES } from '../data/mockData';
import {
  getRelatedVenueRisks,
  getIncidentSupportSummary
} from '../logic/incidentSupport';
import type { VenueData, IncidentData } from '../types';
import { postIncidentSupport } from '../logic/apiClient';
import type { IncidentSupportApiResponse, ResponseSource } from '../logic/apiClient';
import Icon from '../components/Icon';

interface CachedApiResult {
  incidentId: string;
  data: IncidentSupportApiResponse | null;
  source: ResponseSource;
  reasonText?: string;
}

const normalizeLocalSummary = (summary: ReturnType<typeof getIncidentSupportSummary>): IncidentSupportApiResponse => ({
  situationSummary: summary.situationSummary,
  priorityLevel: summary.priorityLevel,
  recommendedActions: summary.recommendedActions,
  volunteerBriefing: summary.volunteerBriefing,
  fanAnnouncementDraft: summary.fanAnnouncementDraft,
  accessibilityNote: summary.accessibilityNote,
  crowdTransitNote: summary.transitNote,
  simulatedDataUsed: Array.isArray(summary.telemetryUsed) ? summary.telemetryUsed : [summary.telemetryUsed],
  limitations: 'Simulated prototype data only.'
});

export const IncidentSupport: React.FC = () => {
  const [selectedVenueId, setSelectedVenueId] = useState<string>(SIMULATED_VENUES[0].id);
  const [localIncidents, setLocalIncidents] = useState<IncidentData[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  
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

  const selectedVenue = SIMULATED_VENUES.find(v => v.id === selectedVenueId) || SIMULATED_VENUES[0];

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

    setLocalIncidents(selectedVenue.incidents);
    setSelectedIncidentId(null);
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
    if (incidentId === 'SCEN-MOCK' && customScenario) {
      setCustomScenario({ ...customScenario, status: newStatus });
    } else {
      setLocalIncidents(prev =>
        prev.map(inc => (inc.id === incidentId ? { ...inc, status: newStatus } : inc))
      );
    }
  };

  // Find the selected incident (either from the local queue or the custom scenario builder)
  let selectedIncident: IncidentData | undefined;
  if (selectedIncidentId === 'SCEN-MOCK' && customScenario) {
    selectedIncident = customScenario;
  } else if (selectedIncidentId) {
    selectedIncident = localIncidents.find(inc => inc.id === selectedIncidentId);
  }

  // Construct current snapshot venue data
  const venueSnapshot: VenueData = {
    ...selectedVenue,
    incidents: customScenario && selectedIncidentId === 'SCEN-MOCK' 
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
      id: 'SCEN-MOCK',
      type: customType,
      location: customLocation.trim() || 'General Stadium Concourse',
      severity: customSeverity,
      status: 'Open',
      timestamp: new Date().toTimeString().split(' ')[0].substring(0, 5)
    };
    setCustomScenario(newScenario);
    setSelectedIncidentId('SCEN-MOCK');

    const updatedVenueSnapshot = {
      ...selectedVenue,
      incidents: [newScenario, ...localIncidents]
    };
    triggerIncidentGeneration(newScenario, updatedVenueSnapshot);
  };

  // Get decision support outputs
  const relatedRisks = selectedIncident ? getRelatedVenueRisks(selectedIncident, venueSnapshot) : [];
  const localSupportSummary = selectedIncident ? normalizeLocalSummary(getIncidentSupportSummary(selectedIncident, venueSnapshot)) : null;
  const supportSummary = (apiResult && selectedIncident && apiResult.incidentId === selectedIncident.id && apiResult.data)
    ? apiResult.data
    : localSupportSummary;

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Disclaimer Banner */}
      <div className="disclaimer-banner" role="alert" style={{ margin: 0 }}>
        <strong>Important Simulated Notice:</strong> This incident support page uses simulated prototype data and does not access external FIFA, venue, transit, ticket, emergency, or current crowd systems. Current external systems are not connected. All response plans are response planning drafts.
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Incident Decision Support Center (Vertex AI / Local simulated decision support)</h2>
          <p style={{ margin: '0.2rem 0', color: '#5f6368' }}>
            Prototype operations panel to review mock safety tickets, access hybrid AI checklists via Vertex AI Cloud Run or local fallback, and build custom test scenarios.
          </p>
        </div>

        {/* Venue Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label htmlFor="incident-venue-select" style={{ fontWeight: 'bold' }}>Select Venue View (Simulated):</label>
          <select 
            id="incident-venue-select" 
            value={selectedVenueId} 
            onChange={(e) => setSelectedVenueId(e.target.value)}
            disabled={isLoading}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }}
          >
            {SIMULATED_VENUES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.locationName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Queue & Scenario Builder */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* Left Column: Queue Snapshot & Local Scenario Builder */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{ margin: 0 }}>
            <h3>Simulated Incident Queue Snapshot</h3>
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '-0.5rem', marginBottom: '1rem' }}>
              Select an incident from the log queue to calculate response planning drafts.
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>ID</th>
                  <th style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Type</th>
                  <th style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Severity</th>
                  <th style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {venueSnapshot.incidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => handleSelectIncident(inc)}
                    style={{
                      cursor: 'pointer',
                      borderBottom: '1px solid #eee',
                      opacity: inc.status === 'Resolved' ? 0.6 : 1,
                      background: selectedIncident?.id === inc.id ? '#eef2f7' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{inc.id}</td>
                    <td style={{ padding: '0.5rem' }}>{inc.type}</td>
                    <td style={{
                      padding: '0.5rem',
                      color: inc.severity === 'High' ? '#db4437' : inc.severity === 'Medium' ? '#f4b400' : '#1a73e8',
                      fontWeight: 'bold'
                    }}>{inc.severity}</td>
                    <td style={{ padding: '0.5rem' }}>
                      <span style={{
                        padding: '0.1rem 0.4rem',
                        borderRadius: '3px',
                        fontSize: '0.8rem',
                        background: inc.status === 'Open' ? '#fce8e6' : inc.status === 'Dispatched' ? '#fef7e0' : '#e6f4ea',
                        color: inc.status === 'Open' ? '#c5221f' : inc.status === 'Dispatched' ? '#b06000' : '#137333'
                      }}>
                        {inc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card" style={{ margin: 0, background: '#fafafa' }}>
            <h3>Local Incident Scenario Builder</h3>
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '-0.5rem', marginBottom: '1rem' }}>
              Create a custom mock incident to test local fallback response plan calculation.
            </p>
            <form onSubmit={handleCreateCustomScenario} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              
              <div>
                <label htmlFor="scenario-type" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Incident Type:</label>
                <select
                  id="scenario-type"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  disabled={isLoading}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="Spill Hazard">Spill Hazard</option>
                  <option value="Crowd Bottleneck">Crowd Bottleneck</option>
                  <option value="Medical Emergency">Medical Emergency</option>
                  <option value="Gate Glitch">Gate Glitch</option>
                  <option value="Concession Supply Outage">Concession Supply Outage</option>
                  <option value="Guest Health Support Request">Guest Health Support Request</option>
                  <option value="Lost Belongings">Lost Belongings</option>
                  <option value="Equipment Malfunction">Equipment Malfunction</option>
                </select>
              </div>

              <div>
                <label htmlFor="scenario-location" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Location:</label>
                <input
                  id="scenario-location"
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  disabled={isLoading}
                  placeholder="e.g. Concourse Sec 108"
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label htmlFor="scenario-severity" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Severity Level:</label>
                <select
                  id="scenario-severity"
                  value={customSeverity}
                  onChange={(e) => setCustomSeverity(e.target.value as 'Low' | 'Medium' | 'High')}
                  disabled={isLoading}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  background: isLoading ? '#94a3b8' : '#1a73e8',
                  color: 'white',
                  border: 'none',
                  padding: '0.6rem',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                Generate Local Simulated Plan
              </button>

            </form>
          </div>

        </div>

        {/* Right Column: Simulated Decision Support Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {selectedIncident && supportSummary ? (
            <div className="card" style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '1.2rem', border: '1px solid #bbb' }}>
              
              {/* Header Details */}
              <div style={{ borderBottom: '1px solid #eee', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ margin: 0 }}>Decision Support Detail: {selectedIncident.id}</h3>
                  <span style={{ fontSize: '0.8rem', color: '#5f6368' }}>Location: simulated {selectedIncident.location}</span>
                </div>
                
                {/* Local Status Toggler */}
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.2rem' }}>Local Status:</span>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {(['Open', 'Dispatched', 'Resolved'] as const).map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(selectedIncident!.id, status)}
                        disabled={selectedIncident!.status === status || isLoading}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.4rem',
                          background: selectedIncident!.status === status ? '#ccc' : '#f5f5f5',
                          border: '1px solid #ccc',
                          borderRadius: '3px',
                          cursor: selectedIncident!.status === status || isLoading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Source Badge & Loading/Fallback Status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderBottom: '1px solid #eee', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {isLoading ? (
                    <span style={{
                      padding: '0.25rem 0.6rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      background: '#f1f5f9',
                      color: '#64748b',
                      border: '1px solid #cbd5e1'
                    }} role="status" aria-live="polite">
                      <span className="inline-icon-label"><Icon name="spark" size={14} />Generating Vertex AI guidance via Cloud Run...</span>
                    </span>
                  ) : (
                    <span style={{
                      padding: '0.25rem 0.6rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      background: apiResult?.source === 'Vertex AI via Cloud Run' ? '#e6f4ea' : '#fff3e0',
                      color: apiResult?.source === 'Vertex AI via Cloud Run' ? '#137333' : '#e65100',
                      border: `1px solid ${apiResult?.source === 'Vertex AI via Cloud Run' ? '#ceead6' : '#ffe0b2'}`
                    }} role="status">
                      {apiResult?.source || 'Local deterministic fallback'}
                    </span>
                  )}
                </div>

                {apiResult?.reasonText && !isLoading && (
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#c5221f',
                    background: '#fce8e6',
                    padding: '0.4rem 0.6rem',
                    borderRadius: '4px',
                    borderLeft: '3px solid #c5221f'
                  }}>
                    <strong>Fallback Reason:</strong> {apiResult.reasonText}
                  </div>
                )}
              </div>

              {/* Related Simulated Operations Risks */}
              <div>
                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.95rem' }}>Related Simulated Operations Risks</h4>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#555' }}>
                  {relatedRisks.map((risk, idx) => (
                    <li key={idx}>{risk}</li>
                  ))}
                </ul>
              </div>

              {/* Situation Summary */}
              <div style={{ padding: '0.5rem', background: '#f8f9fa', borderRadius: '4px', fontSize: '0.85rem' }}>
                <strong>Situation Summary:</strong>
                <p style={{ margin: '0.25rem 0 0 0', color: '#333' }}>{supportSummary.situationSummary}</p>
              </div>

              {/* Priority tag */}
              <div style={{ fontSize: '0.85rem' }}>
                Priority Support Level: <strong style={{ color: supportSummary.priorityLevel === 'High' ? '#db4437' : supportSummary.priorityLevel === 'Medium' ? '#f4b400' : '#1a73e8' }}>{supportSummary.priorityLevel}</strong>
              </div>

              {/* Action Plan */}
              <div>
                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.95rem' }}>Response Planning Draft Checklist</h4>
                <ol style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {supportSummary.recommendedActions.map((step, idx) => (
                    <li key={idx} style={{ color: '#333' }}>{step}</li>
                  ))}
                </ol>
              </div>

              {/* Volunteer Briefing Draft */}
              <div>
                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.95rem' }}>Prototype Staff Briefing Guidelines</h4>
                <pre style={{ margin: 0, padding: '0.5rem', background: '#202124', color: '#e8eaed', borderRadius: '4px', fontSize: '0.8rem', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                  {supportSummary.volunteerBriefing}
                </pre>
              </div>

              {/* Fan Announcement Draft */}
              <div>
                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.95rem' }}>Prototype Fan Announcement Draft</h4>
                <p style={{ margin: 0, padding: '0.5rem', background: '#eef2f7', borderLeft: '3px solid #1a73e8', borderRadius: '0 4px 4px 0', fontSize: '0.85rem', color: '#1a73e8', fontStyle: 'italic' }}>
                  {supportSummary.fanAnnouncementDraft}
                </p>
              </div>

              {/* Accessibility & Transit Notes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid #eee', paddingTop: '0.75rem', fontSize: '0.8rem', color: '#5f6368' }}>
                <div>{supportSummary.accessibilityNote}</div>
                <div>{supportSummary.crowdTransitNote}</div>
              </div>

              {/* Grounding Info */}
              <div style={{ fontSize: '0.75rem', color: '#888', fontStyle: 'italic' }}>
                {Array.isArray(supportSummary.simulatedDataUsed) ? supportSummary.simulatedDataUsed.join(', ') : supportSummary.simulatedDataUsed}
              </div>

            </div>
          ) : (
            <div className="card" style={{ margin: 0, background: '#f8fafc', borderLeft: '4px solid #1a73e8', textAlign: 'center', padding: '3rem 1.5rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>Incident Details & Decision Support</h3>
              <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>
                Select an incident from the simulated log queue or configure a new custom ticket to inspect simulated incident support plan templates.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default IncidentSupport;
