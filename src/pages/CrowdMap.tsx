import React, { useState } from 'react';
import { SIMULATED_VENUES } from '../data/mockData';
import {
  getLeastCrowdedGate,
  getHighestDensityZones,
  getAccessibleEntryOptions,
  getMapGuidanceSummary
} from '../logic/crowdMap';
import type { ZoneData } from '../types';

export const CrowdMap: React.FC = () => {
  const [selectedVenueId, setSelectedVenueId] = useState<string>(SIMULATED_VENUES[0].id);

  const selectedVenue = SIMULATED_VENUES.find(v => v.id === selectedVenueId) || SIMULATED_VENUES[0];

  const leastCrowdedGate = getLeastCrowdedGate(selectedVenue);
  const highestDensityZones = getHighestDensityZones(selectedVenue);
  const accessibleEntries = getAccessibleEntryOptions(selectedVenue);
  const guidanceSummary = getMapGuidanceSummary(selectedVenue);

  const getDensityColor = (density: string) => {
    switch (density) {
      case 'Critical': return '#db4437'; // Red
      case 'High': return '#ff6d00';     // Orange
      case 'Medium': return '#f4b400';   // Yellow
      default: return '#0f9d58';         // Green
    }
  };

  const getGateColor = (gate: { isOpen: boolean; percentage: number }) => {
    if (!gate.isOpen) return '#9ca3af'; // Grey
    if (gate.percentage >= 80) return '#db4437'; // Red
    if (gate.percentage >= 50) return '#f4b400'; // Yellow
    return '#0f9d58'; // Green
  };

  // Helper to safely map 4 zones of active venue to layout coordinates
  const getZoneLabel = (idx: number, zones: ZoneData[]) => {
    if (idx >= zones.length) return { name: 'N/A', density: 'Low', occupancy: 0 };
    return {
      name: zones[idx].name,
      density: zones[idx].density,
      occupancy: zones[idx].occupancyPercentage
    };
  };

  const zone0 = getZoneLabel(0, selectedVenue.zones);
  const zone1 = getZoneLabel(1, selectedVenue.zones);
  const zone2 = getZoneLabel(2, selectedVenue.zones);
  const zone3 = getZoneLabel(3, selectedVenue.zones);

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Disclaimer Banner */}
      <div className="disclaimer-banner" role="alert" style={{ margin: 0 }}>
        <strong>Important Simulated Notice:</strong> This map uses simulated prototype data and does not access external FIFA, venue, transit, ticketing, emergency, or current crowd systems. Current external systems are not connected. All visuals represent a prototype crowd map.
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Simulated Venue Operations Map (Prototype Crowd Map)</h2>
          <p style={{ margin: '0.2rem 0', color: '#5f6368' }}>
            Visual mockup representing simulated concourse zone densities, perimeter gate loads, and accessible arrival points.
          </p>
        </div>

        {/* Venue Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label htmlFor="map-venue-select" style={{ fontWeight: 'bold' }}>Select Venue View (Simulated):</label>
          <select 
            id="map-venue-select" 
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* Left Column: Visual Map Representation */}
        <div className="card" style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3>Simulated Stadium Layout Overview</h3>
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '-0.5rem' }}>
            * This vector graphic is a simulated schematic representation for telemetry display purposes and is not geographically accurate.
          </p>

          {/* SVG Map Container */}
          <div style={{ background: '#f8fafc', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <svg 
              width="100%" 
              viewBox="0 0 600 400" 
              style={{ display: 'block', maxHeight: '350px' }}
              aria-labelledby="map-title"
              aria-describedby="map-desc"
            >
              <title id="map-title">Simulated Stadium Crowd Density Map</title>
              <desc id="map-desc">
                A prototype layout showing simulated gate pressures and crowd density zones inside the concourse.
              </desc>

              {/* Pitch/Field Area (Center) */}
              <rect x="220" y="150" width="160" height="100" rx="10" fill="#a7f3d0" stroke="#059669" strokeWidth="2" />
              <text x="300" y="205" textAnchor="middle" fill="#047857" style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                SIMULATED PITCH
              </text>

              {/* Concourse Areas (Colored by density) */}
              
              {/* North Zone / concourse zone 0 */}
              <path 
                d="M 150 130 A 180 110 0 0 1 450 130 L 390 150 A 110 70 0 0 0 210 150 Z" 
                fill={getDensityColor(zone0.density)} 
                opacity="0.85" 
                stroke="#fff" 
                strokeWidth="2" 
              />
              <text x="300" y="105" textAnchor="middle" fill="#fff" style={{ fontSize: '0.75rem', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
                {zone0.name}: {zone0.density} ({zone0.occupancy}%)
              </text>

              {/* South Zone / concourse zone 1 */}
              <path 
                d="M 150 270 A 180 110 0 0 0 450 270 L 390 250 A 110 70 0 0 1 210 250 Z" 
                fill={getDensityColor(zone1.density)} 
                opacity="0.85" 
                stroke="#fff" 
                strokeWidth="2" 
              />
              <text x="300" y="300" textAnchor="middle" fill="#fff" style={{ fontSize: '0.75rem', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
                {zone1.name}: {zone1.density} ({zone1.occupancy}%)
              </text>

              {/* West Zone / concourse zone 3 (drawn on left) */}
              <path 
                d="M 150 130 A 180 110 0 0 0 150 270 L 210 250 A 110 70 0 0 1 210 150 Z" 
                fill={getDensityColor(zone3.density)} 
                opacity="0.85" 
                stroke="#fff" 
                strokeWidth="2" 
              />
              <text x="120" y="205" textAnchor="middle" fill="#fff" style={{ fontSize: '0.7rem', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
                {zone3.name}
              </text>
              <text x="120" y="220" textAnchor="middle" fill="#fff" style={{ fontSize: '0.65rem', textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
                {zone3.density} ({zone3.occupancy}%)
              </text>

              {/* East Zone / concourse zone 2 (drawn on right) */}
              <path 
                d="M 450 130 A 180 110 0 0 1 450 270 L 390 250 A 110 70 0 0 0 390 150 Z" 
                fill={getDensityColor(zone2.density)} 
                opacity="0.85" 
                stroke="#fff" 
                strokeWidth="2" 
              />
              <text x="480" y="205" textAnchor="middle" fill="#fff" style={{ fontSize: '0.7rem', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
                {zone2.name}
              </text>
              <text x="480" y="220" textAnchor="middle" fill="#fff" style={{ fontSize: '0.65rem', textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
                {zone2.density} ({zone2.occupancy}%)
              </text>

              {/* Outer Security Gate Dots and Labels */}
              {selectedVenue.gates.map((gate, idx) => {
                // Layout gates in cardinal positions: Gate 0 (Top), Gate 1 (Bottom), Gate 2 (Right), Gate 3 (Left)
                let x = 300, y = 20;
                let textAnchor: 'inherit' | 'end' | 'start' | 'middle' | undefined = 'middle';
                let offset = { x: 0, y: -12 };
                
                if (idx === 0) { // Top
                  x = 300; y = 20;
                  offset = { x: 0, y: -10 };
                } else if (idx === 1) { // Bottom
                  x = 300; y = 380;
                  offset = { x: 0, y: 15 };
                } else if (idx === 2) { // Right
                  x = 570; y = 200;
                  offset = { x: 0, y: -10 };
                } else if (idx === 3) { // Left
                  x = 30; y = 200;
                  offset = { x: 0, y: -10 };
                } else {
                  // Fallback layout
                  x = 100 + (idx * 100); y = 340;
                  offset = { x: 0, y: 15 };
                }

                return (
                  <g key={gate.id}>
                    {/* Circle representing gate dot */}
                    <circle cx={x} cy={y} r="10" fill={getGateColor(gate)} stroke="#333" strokeWidth="1.5" />
                    
                    {/* Accessibility icon wrapper */}
                    {gate.isOpen && gate.accessibleReady && (
                      <circle cx={x} cy={y} r="4" fill="#1a73e8" />
                    )}

                    {/* Text Label */}
                    <text 
                      x={x + offset.x} 
                      y={y + offset.y} 
                      textAnchor={textAnchor}
                      fill="#333"
                      style={{ fontSize: '0.75rem', fontWeight: 'bold' }}
                    >
                      {gate.name} {!gate.isOpen ? '(CLOSED)' : `(${gate.percentage}%)`}{gate.accessibleReady ? ' ♿' : ''}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Map Legend */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Safer Movement Map Legend</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#0f9d58', borderRadius: '2px' }}></span>
                <span>Low Occupancy (Normal)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#f4b400', borderRadius: '2px' }}></span>
                <span>Medium Occupancy</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#ff6d00', borderRadius: '2px' }}></span>
                <span>High Occupancy</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#db4437', borderRadius: '2px' }}></span>
                <span>Critical Occupancy</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#9ca3af', borderRadius: '2px' }}></span>
                <span>Closed Gate / Route</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#1a73e8', borderRadius: '50%' }}></span>
                <span>Accessibility Support (♿)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Guidance Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{ margin: 0, background: '#f8fafc', borderLeft: '4px solid #1a73e8' }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>Simulated Safer Movement Guidance</h3>
            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>
              Deterministic local suggestions computed from current simulated telemetry snapshots.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {guidanceSummary.map((item, index) => (
                <div 
                  key={index}
                  style={{ 
                    padding: '0.75rem', 
                    background: 'white', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    lineHeight: '1.4'
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Details on Entry / Avoidance Recommendations */}
          <div className="card" style={{ margin: 0 }}>
            <h3>Local Simulated Route Analysis</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div>
                <strong>Recommended Low-Pressure Gate:</strong><br />
                {leastCrowdedGate ? (
                  <span>
                    Simulated {leastCrowdedGate.name} is currently recommended with an intake pressure of {leastCrowdedGate.percentage}%.
                  </span>
                ) : (
                  <span style={{ color: '#db4437' }}>No entry gates are currently open in the simulation data.</span>
                )}
              </div>

              <div style={{ borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
                <strong>Zones to Avoid:</strong><br />
                {highestDensityZones.length > 0 ? (
                  <ul style={{ margin: '0.2rem 0 0 0', paddingLeft: '1.2rem', color: '#ff6d00' }}>
                    {highestDensityZones.map(z => (
                      <li key={z.id}>
                        {z.name} - Occupancy level is {z.density} ({z.occupancyPercentage}%)
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span style={{ color: '#0f9d58' }}>All concourses showing low occupancy density.</span>
                )}
              </div>

              <div style={{ borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
                <strong>Accessibility-Friendly Entry Lanes:</strong><br />
                {accessibleEntries.length > 0 ? (
                  <ul style={{ margin: '0.2rem 0 0 0', paddingLeft: '1.2rem', color: '#1a73e8' }}>
                    {accessibleEntries.map(g => (
                      <li key={g.id}>
                        {g.name} is open & accessibility-equipped (simulated load: {g.percentage}%)
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span style={{ color: '#db4437' }}>No accessible gates are showing open. Assist volunteers should deploy.</span>
                )}
              </div>

              <div style={{ borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
                <strong>Simulated Departure Exit Load:</strong><br />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.2rem' }}>
                  {selectedVenue.transitStatus.map(t => (
                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', color: t.loadLevel === 'Critical' ? '#db4437' : '#555' }}>
                      <span>{t.type}:</span>
                      <strong>{t.loadLevel} ({t.crowdPressurePercentage}%)</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default CrowdMap;
