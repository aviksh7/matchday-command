import React, { useState, useEffect } from 'react';
import { SIMULATED_VENUES } from '../data/mockData';
import {
  getRelatedVenueRisks,
  getIncidentSupportSummary
} from '../logic/incidentSupport';
import type { VenueData, IncidentData } from '../types';

export const IncidentSupport: React.FC = () => {
  const [selectedVenueId, setSelectedVenueId] = useState<string>(SIMULATED_VENUES[0].id);
  const [localIncidents, setLocalIncidents] = useState<IncidentData[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  
  // Local Scenario Builder States
  const [customType, setCustomType] = useState<string>('Spill Hazard');
  const [customLocation, setCustomLocation] = useState<string>('Concourse Sec 102');
  const [customSeverity, setCustomSeverity] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [customScenario, setCustomScenario] = useState<IncidentData | null>(null);

  const selectedVenue = SIMULATED_VENUES.find(v => v.id === selectedVenueId) || SIMULATED_VENUES[0];

  // Reset incidents list when venue changes
  useEffect(() => {
    setLocalIncidents(selectedVenue.incidents);
    setSelectedIncidentId(null);
    setCustomScenario(null);
  }, [selectedVenueId]);

  const handleStatusChange = (incidentId: string, newStatus: 'Open' | 'Dispatched' | 'Resolved') => {
    if (incidentId === 'SCEN-MOCK' && customScenario) {
      setCustomScenario({ ...customScenario, status: newStatus });
    } else {
      setLocalIncidents(prev =>
        prev.map(inc => (inc.id === incidentId ? { ...inc, status: newStatus } : inc))
      );
    }
  };

  const handleCreateScenario = (e: React.FormEvent) => {
    e.preventDefault();
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

  // Get decision support outputs
  const relatedRisks = selectedIncident ? getRelatedVenueRisks(selectedIncident, venueSnapshot) : [];
  const supportSummary = selectedIncident ? getIncidentSupportSummary(selectedIncident, venueSnapshot) : null;

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Disclaimer Banner */}
      <div className="disclaimer-banner" role="alert" style={{ margin: 0 }}>
        <strong>Important Simulated Notice:</strong> This incident support page uses simulated prototype data and does not access external FIFA, venue, transit, ticket, emergency, or current crowd systems. Current external systems are not connected. All response plans are response planning drafts.
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Incident Decision Support Center (Local simulated decision support)</h2>
          <p style={{ margin: '0.2rem 0', color: '#5f6368' }}>
            Prototype operations panel to review mock safety tickets, access local simulated checklists, and build custom test scenarios.
          </p>
        </div>

        {/* Venue Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label htmlFor="incident-venue-select" style={{ fontWeight: 'bold' }}>Select Venue View (Simulated):</label>
          <select 
            id="incident-venue-select" 
            value={selectedVenueId} 
            onChange={(e) => setSelectedVenueId(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }}
          >
            {SIMULATED_VENUES.map(venue => (
              <option key={venue.id} value={venue.id}>{venue.name} ({venue.locationName})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* Left Column: Log Queue & Custom Scenario Builder */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Active Incident Queue */}
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
                {localIncidents.map(inc => {
                  const isSelected = inc.id === selectedIncidentId;
                  const severityColor = inc.severity === 'High' ? '#db4437' : inc.severity === 'Medium' ? '#f4b400' : '#1a73e8';
                  return (
                    <tr 
                      key={inc.id} 
                      onClick={() => {
                        setSelectedIncidentId(inc.id);
                        if (customScenario && customScenario.id !== selectedIncidentId) {
                          setCustomScenario(null);
                        }
                      }}
                      style={{ 
                        cursor: 'pointer', 
                        background: isSelected ? '#eef2f7' : 'transparent',
                        borderBottom: '1px solid #eee'
                      }}
                    >
                      <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{inc.id}</td>
                      <td style={{ padding: '0.5rem' }}>{inc.type}</td>
                      <td style={{ padding: '0.5rem', color: severityColor, fontWeight: 'bold' }}>{inc.severity}</td>
                      <td style={{ padding: '0.5rem' }}>
                        <span style={{ 
                          padding: '0.1rem 0.4rem', 
                          borderRadius: '3px', 
                          fontSize: '0.8rem',
                          background: inc.status === 'Resolved' ? '#e6f4ea' : inc.status === 'Dispatched' ? '#fef7e0' : '#fce8e6',
                          color: inc.status === 'Resolved' ? '#137333' : inc.status === 'Dispatched' ? '#b06000' : '#c5221f'
                        }}>
                          {inc.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Local Scenario Builder */}
          <div className="card" style={{ margin: 0, background: '#fafafa' }}>
            <h3>Local Incident Scenario Builder</h3>
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '-0.5rem', marginBottom: '1rem' }}>
              Create a custom mock incident to generate a local simulated response plan template in component memory.
            </p>
            <form onSubmit={handleCreateScenario} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem' }}>
              
              <div>
                <label htmlFor="scenario-type" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Incident Type:</label>
                <select
                  id="scenario-type"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="Spill Hazard">Spill Hazard</option>
                  <option value="Crowd Bottleneck">Crowd Bottleneck</option>
                  <option value="Lost Belongings">Lost Belongings</option>
                  <option value="Equipment Malfunction">Equipment Malfunction</option>
                  <option value="Guest Health Support Request">Guest Health Support Request</option>
                </select>
              </div>

              <div>
                <label htmlFor="scenario-location" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Location:</label>
                <input
                  id="scenario-location"
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
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
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <button
                type="submit"
                style={{
                  background: '#1a73e8',
                  color: 'white',
                  border: 'none',
                  padding: '0.6rem',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                  cursor: 'pointer',
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
                        disabled={selectedIncident!.status === status}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.4rem',
                          background: selectedIncident!.status === status ? '#ccc' : '#f5f5f5',
                          border: '1px solid #ccc',
                          borderRadius: '3px',
                          cursor: selectedIncident!.status === status ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Related Telemetry Risks */}
              <div>
                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.95rem' }}>Related Telemetry Risk Warnings</h4>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#db4437' }}>
                  {relatedRisks.map((risk, idx) => (
                    <li key={idx} style={{ marginBottom: '0.2rem' }}>{risk}</li>
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
                Priority Support Level: <strong style={{ color: selectedIncident.severity === 'High' ? '#db4437' : selectedIncident.severity === 'Medium' ? '#f4b400' : '#1a73e8' }}>{supportSummary.priorityLevel}</strong>
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
                <div>{supportSummary.transitNote}</div>
              </div>

              {/* Grounding Info */}
              <div style={{ fontSize: '0.75rem', color: '#888', fontStyle: 'italic' }}>
                {supportSummary.telemetryUsed}
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
