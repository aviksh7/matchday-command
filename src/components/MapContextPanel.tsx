import React from 'react';
import type { VenueData } from '../types';
import {
  calculateAverageGatePressure,
  getLowestPressureOpenGate,
  getOverallVenueStatus,
  getPressureTone,
} from '../logic/operations';
import type { MapSelection } from './StadiumMap';
import Button from './Button';
import FeedChip from './FeedChip';
import Icon from './Icon';
import Meter from './Meter';
import SeverityBadge from './SeverityBadge';
import StatusChip from './StatusChip';

interface MapContextPanelProps {
  venue: VenueData;
  selection: MapSelection | null;
  onClear: () => void;
  onOpenIncidentSupport: () => void;
}

export const MapContextPanel: React.FC<MapContextPanelProps> = ({
  venue,
  selection,
  onClear,
  onOpenIncidentSupport,
}) => {
  const renderContent = () => {
    if (!selection) {
      const status = getOverallVenueStatus(venue);
      const leastCrowdedGate = getLowestPressureOpenGate(venue);
      const averageGatePressure = calculateAverageGatePressure(venue);
      const busiestDistricts = [...venue.zones]
        .sort((first, second) => second.occupancyPercentage - first.occupancyPercentage)
        .slice(0, 2);
      const openIncidentCount = venue.incidents.filter(incident => incident.status !== 'Resolved').length;
      return (
        <>
          <div className="map-context__heading">
            <FeedChip tone="cyan" icon="venue">Venue overview</FeedChip>
            <h3>{venue.name}</h3>
            <p>{venue.locationName} · current simulated operational snapshot.</p>
          </div>
          <StatusChip status={status} theme="paper" label={`${status} venue status`} />
          <Meter value={averageGatePressure} label="Average gate intake pressure" tone={getPressureTone(averageGatePressure)} />
          <div className="map-context__callout">
            <Icon name="route" size={18} />
            <div>
              <span>Lowest-pressure open gate</span>
              <strong>{leastCrowdedGate ? `${leastCrowdedGate.name} · ${leastCrowdedGate.percentage}%` : 'No open gate in this snapshot'}</strong>
            </div>
          </div>
          <dl className="map-context__facts map-context__facts--overview">
            {busiestDistricts.map((district, index) => (
              <div key={district.id}><dt>{index === 0 ? 'Busiest district' : 'Next busiest'}</dt><dd>{district.name} · {district.occupancyPercentage}%</dd></div>
            ))}
            <div><dt>Open incidents</dt><dd>{openIncidentCount}</dd></div>
          </dl>
          <footer className="map-context__footer">
            <p>Select a district, gate, transit node or incident marker for its simulated operational context.</p>
            <p>Keyboard: Tab through map features, press Enter or Space to select, and Escape to clear.</p>
          </footer>
        </>
      );
    }

    if (selection.kind === 'district') {
      const zone = venue.zones.find(item => item.id === selection.id);
      if (!zone) return null;
      return (
        <>
          <div className="map-context__heading">
            <FeedChip tone={zone.density === 'Critical' || zone.density === 'High' ? 'amber' : 'green'} icon="operations">Operational district</FeedChip>
            <h3>{zone.name}</h3>
            <p>Simulated crowd-density district mapped to the current venue snapshot.</p>
          </div>
          <Meter value={zone.occupancyPercentage} label="Simulated occupancy" tone={getPressureTone(zone.occupancyPercentage)} />
          <dl className="map-context__facts">
            <div><dt>Density</dt><dd>{zone.density}</dd></div>
            <div><dt>Volunteers</dt><dd>{zone.volunteerCount}</dd></div>
            <div><dt>District ID</dt><dd>{zone.id}</dd></div>
          </dl>
        </>
      );
    }

    if (selection.kind === 'gate') {
      const gate = venue.gates.find(item => item.id === selection.id);
      if (!gate) return null;
      return (
        <>
          <div className="map-context__heading">
            <FeedChip tone={gate.isOpen ? 'cyan' : 'red'} icon="venue">Perimeter gate</FeedChip>
            <h3>{gate.name}</h3>
            <p>{gate.isOpen ? 'Open in this simulated snapshot.' : 'Closed in this simulated snapshot.'}</p>
          </div>
          <Meter value={gate.percentage} label="Simulated intake pressure" tone={getPressureTone(gate.percentage)} />
          <dl className="map-context__facts">
            <div><dt>Pressure</dt><dd>{gate.pressure}</dd></div>
            <div><dt>Access lane</dt><dd>{gate.accessibleReady ? 'Accessibility-ready' : 'Standard'}</dd></div>
            <div><dt>Gate state</dt><dd>{gate.isOpen ? 'Open' : 'Closed'}</dd></div>
          </dl>
        </>
      );
    }

    if (selection.kind === 'transit') {
      const transit = venue.transitStatus.find(item => item.id === selection.id);
      if (!transit) return null;
      return (
        <>
          <div className="map-context__heading">
            <FeedChip tone={transit.loadLevel === 'Critical' || transit.loadLevel === 'High' ? 'amber' : 'cyan'} icon={transit.type.includes('Train') ? 'train' : 'bus'}>Transit node</FeedChip>
            <h3>{transit.type}</h3>
            <p>Prototype departure-node conditions; no municipal feed is connected.</p>
          </div>
          <Meter value={transit.crowdPressurePercentage} label="Simulated crowd pressure" tone={getPressureTone(transit.crowdPressurePercentage)} />
          <dl className="map-context__facts">
            <div><dt>Load</dt><dd>{transit.loadLevel}</dd></div>
            <div><dt>Status</dt><dd>{transit.status}</dd></div>
            <div><dt>Node ID</dt><dd>{transit.id}</dd></div>
          </dl>
        </>
      );
    }

    const incident = venue.incidents.find(item => item.id === selection.id);
    if (!incident) return null;
    return (
      <>
        <div className="map-context__heading">
          <FeedChip tone="red" icon="incident">Incident marker</FeedChip>
          <h3>{incident.type}</h3>
          <p>{incident.location}</p>
        </div>
        <div className="map-context__incident-meta">
          <SeverityBadge severity={incident.severity} />
          <span>{incident.status}</span>
          <span>{incident.timestamp}</span>
          <span>{incident.id}</span>
        </div>
        <p className="map-context__notice">This marker only opens incident details on the map. Incident Support will open without preselecting this incident.</p>
        <Button variant="paper" icon="incident" trailingIcon="arrow-right" onClick={onOpenIncidentSupport}>Open Incident Support</Button>
      </>
    );
  };

  return (
    <aside className={`map-context ${selection ? 'map-context--selected' : ''}`} aria-label="Selected map feature details" aria-live="polite">
      {selection && (
        <button className="map-context__clear" type="button" onClick={onClear}>Clear selection</button>
      )}
      {renderContent()}
    </aside>
  );
};

export default MapContextPanel;
