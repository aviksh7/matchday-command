import React, { useState, useEffect } from 'react';
import { SIMULATED_VENUES } from '../data/mockData';
import { getOverallVenueStatus, calculateAverageGatePressure, summarizeAccessibilityRequests } from '../logic/operations';
import {
  getCriticalCrowdZones,
  getUndercoveredZones,
  getStaffPriorityQueue,
  getRecommendedStaffActions
} from '../logic/staffCommand';
import type { VenueData, IncidentData } from '../types';
import '../styles/staff-command.css';

export const StaffCommand: React.FC = () => {
  const [selectedVenueId, setSelectedVenueId] = useState<string>(SIMULATED_VENUES[0].id);
  const [localIncidents, setLocalIncidents] = useState<IncidentData[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  const selectedVenue = SIMULATED_VENUES.find(v => v.id === selectedVenueId) || SIMULATED_VENUES[0];

  // Initialize and update local incident list when selected venue changes
  useEffect(() => {
    const venue = SIMULATED_VENUES.find(v => v.id === selectedVenueId) || SIMULATED_VENUES[0];
    setLocalIncidents(venue.incidents);
    setSelectedIncidentId(null);
  }, [selectedVenueId]);

  // Construct a simulated venue snapshot with local component state incident overrides
  const venueSnapshot: VenueData = {
    ...selectedVenue,
    incidents: localIncidents
  };

  const avgGatePressure = calculateAverageGatePressure(venueSnapshot);
  const overallStatus = getOverallVenueStatus(venueSnapshot);
  const criticalZones = getCriticalCrowdZones(venueSnapshot);
  const undercoveredZones = getUndercoveredZones(venueSnapshot);
  const priorityQueue = getStaffPriorityQueue(venueSnapshot);
  const recommendedActions = getRecommendedStaffActions(venueSnapshot);
  const { pendingCount, activeCount } = summarizeAccessibilityRequests(venueSnapshot);

  const handleStatusChange = (incidentId: string, newStatus: 'Open' | 'Dispatched' | 'Resolved') => {
    setLocalIncidents(prev =>
      prev.map(inc => (inc.id === incidentId ? { ...inc, status: newStatus } : inc))
    );
  };

  const getStatusColorClass = (status: 'Normal' | 'Elevated' | 'Critical') => {
    switch (status) {
      case 'Critical': return 'status-critical';
      case 'Elevated': return 'status-elevated';
      default: return 'status-normal';
    }
  };

  const selectedIncident = localIncidents.find(inc => inc.id === selectedIncidentId);

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Disclaimer Banner */}
      <div className="disclaimer-banner" role="alert" style={{ margin: 0 }}>
        <strong>Important Simulated Notice:</strong> This dashboard uses simulated prototype data and does not access external FIFA, venue, transit, ticketing, emergency, or current crowd systems. All status panels, gate loads, and recommendations are simulated mockups.
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Staff Command Center (Simulated Venue Snapshot)</h2>
          <p style={{ margin: '0.2rem 0', color: '#5f6368' }}>
            Simulated stadium operations control center, wait times, gate pressure, and crowd density alerts.
          </p>
        </div>
        
        {/* Venue Selector */}
        <div className="staff-venue-control" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label htmlFor="staff-venue-select" style={{ fontWeight: 'bold' }}>Select Venue View (Simulated):</label>
          <select 
            id="staff-venue-select" 
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

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        
        {/* Left Column: Venue Status & Telemetry Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Overview Card */}
          <div className="card" style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>{venueSnapshot.name} Overview</h3>
              <span className={`status-badge ${getStatusColorClass(overallStatus)}`} style={{ padding: '0.4rem 0.8rem', borderRadius: '20px', color: 'white', fontWeight: 'bold', fontSize: '0.85rem' }}>
                Status: {overallStatus}
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#5f6368', marginBottom: '0.8rem' }}>
              Location: <strong>{venueSnapshot.locationName}</strong> | Capacity: <strong>{venueSnapshot.simulatedCapacity.toLocaleString()}</strong>
            </p>
            <p style={{ fontSize: '0.9rem', color: '#5f6368', margin: 0 }}>
              Average Gate Intake Pressure: <strong>{avgGatePressure}%</strong>
            </p>
          </div>

          {/* Gate Pressures Telemetry */}
          <div className="card" style={{ margin: 0 }}>
            <h3>Simulated Gate Pressure Telemetry</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {venueSnapshot.gates.map(gate => {
                const isHigh = gate.percentage >= 80;
                return (
                  <div key={gate.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: '#f8f9fa', borderRadius: '4px', borderLeft: `4px solid ${isHigh ? '#db4437' : '#0f9d58'}` }}>
                    <div>
                      <strong style={{ fontSize: '0.95rem' }}>{gate.name}</strong>
                      <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', color: gate.isOpen ? '#0f9d58' : '#db4437' }}>
                        {gate.isOpen ? '(Open)' : '(Closed)'}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{gate.percentage}% load</span>
                      <span style={{ fontSize: '0.8rem', display: 'block', color: '#888' }}>Pressure: {gate.pressure}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Crowd Densities & Undercovered Zones */}
          <div className="card" style={{ margin: 0 }}>
            <h3>Simulated Crowd &amp; Volunteer Flow</h3>
            
            <h4 style={{ margin: '0.5rem 0', fontSize: '0.95rem', color: '#333' }}>Critical / High Crowd Density Zones</h4>
            {criticalZones.length > 0 ? (
              <ul style={{ margin: '0 0 1rem 0', paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
                {criticalZones.map(zone => (
                  <li key={zone.id} style={{ marginBottom: '0.25rem' }}>
                    <strong>{zone.name}</strong>: <span style={{ color: zone.density === 'Critical' ? '#db4437' : '#f4b400', fontWeight: 'bold' }}>{zone.density}</span> ({zone.occupancyPercentage}% simulated occupancy)
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: '0.9rem', color: '#0f9d58', margin: '0 0 1rem 0' }}>All simulated zones within normal limits.</p>
            )}

            <h4 style={{ margin: '0.5rem 0', fontSize: '0.95rem', color: '#333' }}>Volunteer Coverage Gaps</h4>
            {undercoveredZones.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {undercoveredZones.map(zone => (
                  <div key={zone.id} style={{ fontSize: '0.85rem', padding: '0.4rem', background: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '4px', color: '#856404' }}>
                    <strong>{zone.name}</strong> needs support. Occupancy is <strong>{zone.occupancyPercentage}%</strong> with only <strong>{zone.volunteerCount}</strong> volunteers deployed.
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.9rem', color: '#0f9d58', margin: 0 }}>Simulated volunteer levels are balanced.</p>
            )}
          </div>

          {/* Transit & Sustainability Metrics */}
          <div className="card" style={{ margin: 0 }}>
            <h3>Simulated Transit &amp; Venue Egress</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {venueSnapshot.transitStatus.map(t => (
                <div key={t.id} style={{ fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t.type} ({t.status}):</span>
                  <strong>{t.loadLevel} ({t.crowdPressurePercentage}%)</strong>
                </div>
              ))}
            </div>

            <h4 style={{ margin: '0.5rem 0', fontSize: '0.95rem', color: '#333' }}>Sustainability telemetry</h4>
            <div style={{ fontSize: '0.85rem', color: '#5f6368' }}>
              <div>Water Station Refill Load: <strong>{venueSnapshot.sustainability.waterRefillStationLoadPercentage}%</strong></div>
              <div>Waste Sorting Compliance: <strong>{venueSnapshot.sustainability.wasteSortingCompliancePercentage}%</strong></div>
              <div>Green Transit Usage: <strong>{venueSnapshot.sustainability.greenTransitEncouragementPercentage}%</strong></div>
            </div>
          </div>

        </div>

        {/* Right Column: Priority Queue, Incident Queue, Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Local Simulated Recommendations */}
          <div className="card" style={{ margin: 0, borderLeft: '4px solid #1a73e8', background: '#f4f8fd' }}>
            <h3>Local Simulated Recommendations</h3>
            <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recommendedActions.map((action, idx) => (
                <li key={idx} style={{ color: '#1a73e8' }}>{action}</li>
              ))}
            </ul>
          </div>

          {/* Staff Priority Queue */}
          <div className="card" style={{ margin: 0 }}>
            <h3>Simulated Staff Priority Queue</h3>
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '-0.5rem', marginBottom: '1rem' }}>
              High-priority operational items sorted by severity risk level.
            </p>
            {priorityQueue.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {priorityQueue.map(item => {
                  const badgeColor = item.severity === 'High' ? '#db4437' : item.severity === 'Medium' ? '#f4b400' : '#1a73e8';
                  return (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.6rem', border: '1px solid #eee', borderRadius: '4px', fontSize: '0.85rem' }}>
                      <div>
                        <span style={{ background: badgeColor, color: 'white', padding: '0.1rem 0.3rem', borderRadius: '3px', fontSize: '0.75rem', fontWeight: 'bold', marginRight: '0.5rem' }}>
                          {item.severity}
                        </span>
                        <strong>[{item.type}]</strong> {item.location}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#5f6368' }}>{item.details}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: '0.9rem', color: '#0f9d58', margin: 0 }}>No high-priority alerts on queue.</p>
            )}
          </div>

          {/* Prototype Staff Incident Queue */}
          <div className="card" style={{ margin: 0 }}>
            <h3>Prototype Staff Incident Queue</h3>
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '-0.5rem', marginBottom: '1rem' }}>
              Select an incident to view details and update local simulation status.
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
                      onClick={() => setSelectedIncidentId(inc.id)}
                      style={{ 
                        cursor: 'pointer', 
                        background: isSelected ? '#eef2f7' : 'transparent'
                      }}
                      className="incident-row"
                    >
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>{inc.id}</td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{inc.type}</td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd', color: severityColor }}>{inc.severity}</td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
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

            {/* Accessibility Summary inside queue card */}
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee', fontSize: '0.85rem', color: '#5f6368', display: 'flex', justifyContent: 'space-between' }}>
              <span>Accessibility Requests Status:</span>
              <strong>{pendingCount} Pending / {activeCount} In Progress</strong>
            </div>
          </div>

          {/* Incident Detail / Update Panel */}
          {selectedIncident && (
            <div className="card" style={{ margin: 0, border: '1px solid #ccc', background: '#fafafa' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Simulated Incident Details: {selectedIncident.id}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem', marginBottom: '1rem' }}>
                <div><strong>Type:</strong> {selectedIncident.type}</div>
                <div><strong>Location:</strong> {selectedIncident.location}</div>
                <div><strong>Severity:</strong> {selectedIncident.severity}</div>
                <div><strong>Timestamp:</strong> {selectedIncident.timestamp}</div>
                <div><strong>Current Simulation Status:</strong> <span style={{ fontWeight: 'bold' }}>{selectedIncident.status}</span></div>
              </div>
              
              <div style={{ borderTop: '1px solid #eee', paddingTop: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#555' }}>
                  Update Local Status:
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => handleStatusChange(selectedIncident.id, 'Open')}
                    disabled={selectedIncident.status === 'Open'}
                    style={{
                      flex: 1,
                      padding: '0.4rem',
                      fontSize: '0.8rem',
                      cursor: selectedIncident.status === 'Open' ? 'not-allowed' : 'pointer',
                      background: selectedIncident.status === 'Open' ? '#ccc' : '#f5f5f5',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  >
                    Open
                  </button>
                  <button 
                    onClick={() => handleStatusChange(selectedIncident.id, 'Dispatched')}
                    disabled={selectedIncident.status === 'Dispatched'}
                    style={{
                      flex: 1,
                      padding: '0.4rem',
                      fontSize: '0.8rem',
                      cursor: selectedIncident.status === 'Dispatched' ? 'not-allowed' : 'pointer',
                      background: selectedIncident.status === 'Dispatched' ? '#ccc' : '#f5f5f5',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  >
                    Dispatched
                  </button>
                  <button 
                    onClick={() => handleStatusChange(selectedIncident.id, 'Resolved')}
                    disabled={selectedIncident.status === 'Resolved'}
                    style={{
                      flex: 1,
                      padding: '0.4rem',
                      fontSize: '0.8rem',
                      cursor: selectedIncident.status === 'Resolved' ? 'not-allowed' : 'pointer',
                      background: selectedIncident.status === 'Resolved' ? '#ccc' : '#f5f5f5',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  >
                    Resolved
                  </button>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#999', display: 'block', marginTop: '0.5rem' }}>
                  * This status update is local to this session only and will reset upon page reload or venue change.
                </span>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default StaffCommand;
