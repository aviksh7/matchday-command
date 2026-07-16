import React from 'react';
import Meter from './Meter';
import StatusChip from './StatusChip';
import type { VenueData, ZoneData } from '../types';

interface StaffTelemetryPanelProps {
  venue: VenueData;
  averageGatePressure: number;
  overallStatus: 'Normal' | 'Elevated' | 'Critical';
  criticalZones: ZoneData[];
  undercoveredZones: ZoneData[];
}

const getGateTone = (percentage: number): 'green' | 'amber' | 'red' => {
  if (percentage >= 80) return 'red';
  if (percentage >= 50) return 'amber';
  return 'green';
};

export const StaffTelemetryPanel: React.FC<StaffTelemetryPanelProps> = ({
  venue,
  averageGatePressure,
  overallStatus,
  criticalZones,
  undercoveredZones,
}) => (
  <div className="staff-command__column">
    <section className="card staff-command__card" aria-labelledby="staff-venue-overview-heading">
      <div className="staff-command__card-heading">
        <h3 id="staff-venue-overview-heading">{venue.name} Overview</h3>
        <StatusChip status={overallStatus} theme="paper" label={`Status: ${overallStatus}`} />
      </div>
      <dl className="staff-command__overview-list">
        <div>
          <dt>Location</dt>
          <dd>{venue.locationName}</dd>
        </div>
        <div>
          <dt>Capacity</dt>
          <dd>{venue.simulatedCapacity.toLocaleString()}</dd>
        </div>
        <div>
          <dt>Average gate intake pressure</dt>
          <dd>{averageGatePressure}%</dd>
        </div>
      </dl>
    </section>

    <section className="card staff-command__card" aria-labelledby="staff-gate-telemetry-heading">
      <h3 id="staff-gate-telemetry-heading">Simulated Gate Pressure Telemetry</h3>
      <div className="staff-command__gate-list">
        {venue.gates.map(gate => (
          <div className="staff-command__gate" key={gate.id}>
            <Meter
              value={gate.percentage}
              label={`${gate.name} simulated load`}
              tone={getGateTone(gate.percentage)}
            />
            <div className="staff-command__gate-meta">
              <span className={gate.isOpen ? 'staff-command__gate-state--open' : 'staff-command__gate-state--closed'}>
                {gate.isOpen ? 'Open' : 'Closed'}
              </span>
              <span>Pressure: {gate.pressure}</span>
            </div>
          </div>
        ))}
      </div>
    </section>

    <section className="card staff-command__card" aria-labelledby="staff-crowd-flow-heading">
      <h3 id="staff-crowd-flow-heading">Simulated Crowd &amp; Volunteer Flow</h3>

      <h4>Critical / High Crowd Density Zones</h4>
      {criticalZones.length > 0 ? (
        <ul className="staff-command__density-list">
          {criticalZones.map(zone => (
            <li key={zone.id}>
              <strong>{zone.name}</strong>:{' '}
              <span className={`staff-command__density staff-command__density--${zone.density.toLowerCase()}`}>
                {zone.density}
              </span>{' '}
              ({zone.occupancyPercentage}% simulated occupancy)
            </li>
          ))}
        </ul>
      ) : (
        <p className="staff-command__success-copy">All simulated zones within normal limits.</p>
      )}

      <h4>Volunteer Coverage Gaps</h4>
      {undercoveredZones.length > 0 ? (
        <div className="staff-command__coverage-list">
          {undercoveredZones.map(zone => (
            <p className="staff-command__coverage-alert" key={zone.id}>
              <strong>{zone.name}</strong> needs support. Occupancy is <strong>{zone.occupancyPercentage}%</strong> with only{' '}
              <strong>{zone.volunteerCount}</strong> volunteers deployed.
            </p>
          ))}
        </div>
      ) : (
        <p className="staff-command__success-copy">Simulated volunteer levels are balanced.</p>
      )}
    </section>

    <section className="card staff-command__card" aria-labelledby="staff-egress-heading">
      <h3 id="staff-egress-heading">Simulated Transit &amp; Venue Egress</h3>
      <ul className="staff-command__transit-list">
        {venue.transitStatus.map(transit => (
          <li key={transit.id}>
            <span>{transit.type} ({transit.status})</span>
            <strong>{transit.loadLevel} ({transit.crowdPressurePercentage}%)</strong>
          </li>
        ))}
      </ul>

      <h4>Sustainability telemetry</h4>
      <dl className="staff-command__sustainability-list">
        <div>
          <dt>Water Station Refill Load</dt>
          <dd>{venue.sustainability.waterRefillStationLoadPercentage}%</dd>
        </div>
        <div>
          <dt>Waste Sorting Compliance</dt>
          <dd>{venue.sustainability.wasteSortingCompliancePercentage}%</dd>
        </div>
        <div>
          <dt>Green Transit Usage</dt>
          <dd>{venue.sustainability.greenTransitEncouragementPercentage}%</dd>
        </div>
      </dl>
    </section>
  </div>
);

export default StaffTelemetryPanel;
