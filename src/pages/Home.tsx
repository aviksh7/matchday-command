import React, { useState } from 'react';
import { SIMULATED_VENUES } from '../data/mockData';
import type { PageId } from '../types';
import { 
  calculateAverageGatePressure, 
  getHighestPriorityIncidents, 
  getOverallVenueStatus, 
  summarizeAccessibilityRequests 
} from '../logic/operations';

interface HomeProps {
  setCurrentPage: (page: PageId) => void;
}

export const Home: React.FC<HomeProps> = ({ setCurrentPage }) => {
  const [selectedVenueId, setSelectedVenueId] = useState<string>(SIMULATED_VENUES[0].id);

  const selectedVenue = SIMULATED_VENUES.find(v => v.id === selectedVenueId) || SIMULATED_VENUES[0];

  const avgGatePressure = calculateAverageGatePressure(selectedVenue);
  const priorityIncidents = getHighestPriorityIncidents(selectedVenue);
  const overallStatus = getOverallVenueStatus(selectedVenue);
  const { pendingCount, activeCount } = summarizeAccessibilityRequests(selectedVenue);

  const getStatusColorClass = (status: 'Normal' | 'Elevated' | 'Critical') => {
    switch (status) {
      case 'Critical': return 'status-critical';
      case 'Elevated': return 'status-elevated';
      default: return 'status-normal';
    }
  };

  return (
    <div className="page-container">
      <div className="home-hero">
        <h2>Matchday Command</h2>
        <p className="subtitle">GenAI stadium operations and fan guidance for high-pressure tournament match days.</p>
      </div>

      <div className="card venue-selector-card">
        <label htmlFor="venue-select" style={{ fontWeight: 'bold', marginRight: '1rem' }}>Selected Venue View (Simulated):</label>
        <select 
          id="venue-select" 
          value={selectedVenueId} 
          onChange={(e) => setSelectedVenueId(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }}
        >
          {SIMULATED_VENUES.map(venue => (
            <option key={venue.id} value={venue.id}>{venue.name} ({venue.locationName})</option>
          ))}
        </select>
        
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#eef2f7', borderRadius: '4px', fontSize: '0.9rem', color: '#4b5563' }}>
          <strong>Simulation Disclaimer:</strong> {selectedVenue.simulationDisclaimer}
        </div>
      </div>

      <div className="venue-overview-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3>{selectedVenue.name} - Overview</h3>
          <p style={{ margin: '0.2rem 0', color: '#5f6368' }}>
            Location: <strong>{selectedVenue.locationName}</strong> | 
            Simulated Capacity: <strong>{selectedVenue.simulatedCapacity.toLocaleString()}</strong>
          </p>
        </div>
        <div className={`status-badge ${getStatusColorClass(overallStatus)}`} style={{ padding: '0.5rem 1rem', borderRadius: '20px', color: 'white', fontWeight: 'bold', textTransform: 'uppercase' }}>
          Status: {overallStatus}
        </div>
      </div>

      {/* Grid of 6 Status Cards */}
      <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* 1. Crowd Flow & Density */}
        <div className="card metric-card">
          <h4>Crowd Flow &amp; Density</h4>
          <p>Overall Zone Occupancy:</p>
          <div style={{ background: '#e5e7eb', height: '12px', borderRadius: '6px', margin: '0.5rem 0', overflow: 'hidden' }}>
            <div style={{ 
              background: selectedVenue.zones.some(z => z.density === 'Critical') ? '#db4437' : '#0f9d58', 
              width: `${Math.round(selectedVenue.zones.reduce((sum, z) => sum + z.occupancyPercentage, 0) / selectedVenue.zones.length)}%`, 
              height: '100%' 
            }}></div>
          </div>
          <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
            {selectedVenue.zones.map(zone => (
              <li key={zone.id}>
                {zone.name}: <strong>{zone.density}</strong> ({zone.occupancyPercentage}%)
              </li>
            ))}
          </ul>
        </div>

        {/* 2. Gate Pressures */}
        <div className="card metric-card">
          <h4>Security Gates</h4>
          <p>Average Intake Pressure: <strong>{avgGatePressure}%</strong></p>
          <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
            {selectedVenue.gates.map(gate => (
              <li key={gate.id}>
                {gate.name}: <strong style={{ color: gate.pressure === 'High' ? '#db4437' : '#5f6368' }}>{gate.pressure}</strong> ({gate.percentage}%) {gate.isOpen ? '🟢' : '🔴'}
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Incidents Status */}
        <div className="card metric-card">
          <h4>Active Incidents</h4>
          <p>Unresolved Reports: <strong>{priorityIncidents.length}</strong></p>
          {priorityIncidents.length > 0 ? (
            <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
              {priorityIncidents.slice(0, 2).map(inc => (
                <li key={inc.id} style={{ marginBottom: '0.3rem' }}>
                  <strong style={{ color: inc.severity === 'High' ? 'red' : 'orange' }}>[{inc.severity}]</strong> {inc.type} - <em>{inc.location}</em>
                </li>
              ))}
              {priorityIncidents.length > 2 && <li style={{ color: '#888' }}>+ {priorityIncidents.length - 2} more incident(s)</li>}
            </ul>
          ) : (
            <p style={{ color: 'green', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>🟢 Zero active safety incidents reported.</p>
          )}
        </div>

        {/* 4. Transit Status */}
        <div className="card metric-card">
          <h4>Transit Pressures</h4>
          <p style={{ fontSize: '0.9rem', color: '#5f6368' }}>Simulated dispatch terminal flow status:</p>
          <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
            {selectedVenue.transitStatus.map(t => (
              <li key={t.id} style={{ marginBottom: '0.3rem' }}>
                {t.type}: <strong>{t.status}</strong> <br />
                <span style={{ color: '#888', fontSize: '0.8rem' }}>Crowd load: {t.crowdPressurePercentage}% ({t.loadLevel})</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 5. Accessibility Requests */}
        <div className="card metric-card">
          <h4>Accessibility Summary</h4>
          <p>Pending Support Tickets: <strong style={{ color: pendingCount > 0 ? '#f4b400' : 'inherit' }}>{pendingCount}</strong></p>
          <p>Active In-Progress: <strong>{activeCount}</strong></p>
          {selectedVenue.accessibilityRequests.length > 0 ? (
            <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
              {selectedVenue.accessibilityRequests.filter(r => r.status !== 'Resolved').slice(0, 2).map(req => (
                <li key={req.id}>
                  {req.type} - <span style={{ fontStyle: 'italic' }}>{req.location}</span> ({req.status})
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'green', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>🟢 All mobility assistance requests cleared.</p>
          )}
        </div>

        {/* 6. Sustainability Signals */}
        <div className="card metric-card">
          <h4>Sustainability Signals</h4>
          <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
            <li style={{ marginBottom: '0.4rem' }}>
              Refill Station Load: <strong>{selectedVenue.sustainability.waterRefillStationLoadPercentage}%</strong>
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              Waste Sorting Status: <strong>{selectedVenue.sustainability.wasteSortingCompliancePercentage}% Compliance</strong>
            </li>
            <li>
              Transit Encouragement: <strong>{selectedVenue.sustainability.greenTransitEncouragementPercentage}% Green Transport Usage</strong>
            </li>
          </ul>
        </div>

      </div>

      {/* Mode Navigation Action Panel */}
      <div className="card action-panel-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2rem', textAlign: 'center' }}>
        <h3>Matchday Mode Selector</h3>
        <p style={{ maxWidth: '600px', color: '#4b5563', marginBottom: '1.5rem' }}>
          Toggle views below to access public fan resources (multilingual chat, accessibility routings) or private staff metrics (AI action dispatcher, volunteer rosters).
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button 
            onClick={() => setCurrentPage('fan-assistant')}
            style={{ 
              background: '#0f9d58', 
              color: 'white', 
              border: 'none', 
              padding: '0.75rem 1.5rem', 
              fontSize: '1rem', 
              fontWeight: 'bold', 
              borderRadius: '6px', 
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Launch Fan Mode
          </button>
          <button 
            onClick={() => setCurrentPage('staff-command')}
            style={{ 
              background: '#1a73e8', 
              color: 'white', 
              border: 'none', 
              padding: '0.75rem 1.5rem', 
              fontSize: '1rem', 
              fontWeight: 'bold', 
              borderRadius: '6px', 
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Launch Staff/Ops Mode
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
