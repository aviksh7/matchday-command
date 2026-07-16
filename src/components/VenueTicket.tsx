import React from 'react';
import type { VenueData } from '../types';
import Button from './Button';
import Icon from './Icon';
import StatusChip from './StatusChip';

interface VenueTicketProps {
  venue: VenueData;
  venues: VenueData[];
  status: 'Normal' | 'Elevated' | 'Critical';
  onVenueChange: (venueId: string) => void;
  onOpenMap: () => void;
}

export const VenueTicket: React.FC<VenueTicketProps> = ({ venue, venues, status, onVenueChange, onOpenMap }) => (
  <section className="venue-ticket" aria-labelledby="venue-ticket-title">
    <div className="venue-ticket__rail" aria-hidden="true">
      <Icon name="venue" size={24} />
      <span>VENUE<br />VIEW</span>
    </div>
    <div className="venue-ticket__identity">
      <span className="venue-ticket__kicker">Selected simulated venue</span>
      <h3 id="venue-ticket-title">{venue.name}</h3>
      <p>{venue.locationName} · Capacity {venue.simulatedCapacity.toLocaleString()}</p>
    </div>
    <div className="venue-ticket__control">
      <label htmlFor="venue-select">Venue view</label>
      <select className="mc-select mc-select--paper" id="venue-select" value={venue.id} onChange={(event) => onVenueChange(event.target.value)}>
        {venues.map(option => (
          <option key={option.id} value={option.id}>{option.name} ({option.locationName})</option>
        ))}
      </select>
    </div>
    <div className="venue-ticket__status">
      <StatusChip status={status} theme="paper" label={`${status} status`} />
      <Button variant="paper" trailingIcon="arrow-right" onClick={onOpenMap}>Open this venue map</Button>
    </div>
  </section>
);

export default VenueTicket;
