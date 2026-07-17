import React, { useEffect, useState } from 'react';
import { SIMULATED_VENUES } from '../data/mockData';
import { getMapGuidanceSummary } from '../logic/crowdMap';
import FeedChip from '../components/FeedChip';
import MapContextPanel from '../components/MapContextPanel';
import SectionHeader from '../components/SectionHeader';
import StadiumMap, { type MapSelection } from '../components/StadiumMap';
import '../styles/crowd-map.css';

interface CrowdMapProps {
  initialVenueId?: string;
  onOpenIncidentSupport?: () => void;
}

const getValidVenueId = (venueId?: string) => (
  venueId && SIMULATED_VENUES.some(venue => venue.id === venueId)
    ? venueId
    : SIMULATED_VENUES[0].id
);

export const CrowdMap: React.FC<CrowdMapProps> = ({ initialVenueId, onOpenIncidentSupport = () => {} }) => {
  const [selectedVenueId, setSelectedVenueId] = useState<string>(() => getValidVenueId(initialVenueId));
  const [selection, setSelection] = useState<MapSelection | null>(null);

  useEffect(() => {
    if (initialVenueId) {
      setSelectedVenueId(getValidVenueId(initialVenueId));
      setSelection(null);
    }
  }, [initialVenueId]);

  const selectedVenue = SIMULATED_VENUES.find(venue => venue.id === selectedVenueId) ?? SIMULATED_VENUES[0];
  const guidanceSummary = getMapGuidanceSummary(selectedVenue);

  const handleVenueChange = (venueId: string) => {
    setSelectedVenueId(venueId);
    setSelection(null);
  };

  return (
    <div className="page-container crowd-map-page">
      <div className="crowd-map-page__topline">
        <FeedChip tone="cyan" icon="map">Living matchday operations map</FeedChip>
        <span className="crowd-map-page__prototype-label">Schematic / simulated / not geographically accurate</span>
      </div>

      <SectionHeader
        eyebrow="Crowd flow intelligence"
        title="Simulated Venue Operations Map"
        description="A keyboard-ready operations surface for inspecting crowd districts, gates, transit pressure, accessible routes and incident markers from local prototype telemetry."
        action={(
          <div className="crowd-map-page__venue-control">
            <label htmlFor="map-venue-select">Select Venue View (Simulated):</label>
            <select className="mc-select" id="map-venue-select" value={selectedVenueId} onChange={(event) => handleVenueChange(event.target.value)}>
              {SIMULATED_VENUES.map(venue => (
                <option key={venue.id} value={venue.id}>{venue.name} ({venue.locationName})</option>
              ))}
            </select>
          </div>
        )}
      />

      <div className="disclaimer-banner crowd-map-page__disclaimer" role="note" aria-label="Simulated map notice">
        <strong>Important Simulated Notice:</strong> This map uses simulated prototype data and does not access external FIFA, venue, transit, ticketing, emergency, or current crowd systems. Current external systems are not connected. All visuals represent a prototype crowd map.
      </div>

      <section className="crowd-map-workspace" aria-label="Interactive simulated stadium map workspace">
        <div className="crowd-map-workspace__map">
          <div className="crowd-map-workspace__bar">
            <div>
              <span>Venue schematic</span>
              <strong>Active venue snapshot</strong>
            </div>
            <span>{selectedVenue.locationName}</span>
          </div>
          <StadiumMap venue={selectedVenue} selection={selection} onSelect={setSelection} />
        </div>

        <MapContextPanel
          venue={selectedVenue}
          selection={selection}
          onClear={() => setSelection(null)}
          onOpenIncidentSupport={onOpenIncidentSupport}
        />
      </section>

      <section className="movement-guidance" aria-labelledby="movement-guidance-title">
        <div className="movement-guidance__intro">
          <FeedChip tone="green" icon="route">Local deterministic output</FeedChip>
          <h3 id="movement-guidance-title">Simulated Safer Movement Guidance</h3>
          <p>Derived from the selected venue’s local snapshot. It does not call mapping, transit or emergency systems.</p>
        </div>
        <ol className="movement-guidance__list">
          {guidanceSummary.map((item, index) => (
            <li key={item}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <p>{item}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
};

export default CrowdMap;
