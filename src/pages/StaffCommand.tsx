import React, { useEffect, useState } from 'react';
import StaffIncidentQueue from '../components/StaffIncidentQueue';
import StaffIncidentStatusControl from '../components/StaffIncidentStatusControl';
import StaffPriorityPanel from '../components/StaffPriorityPanel';
import StaffTelemetryPanel from '../components/StaffTelemetryPanel';
import { SIMULATED_VENUES } from '../data/mockData';
import { calculateAverageGatePressure, getOverallVenueStatus, summarizeAccessibilityRequests } from '../logic/operations';
import {
  getCriticalCrowdZones,
  getRecommendedStaffActions,
  getStaffPriorityQueue,
  getUndercoveredZones,
} from '../logic/staffCommand';
import type { IncidentData, VenueData } from '../types';
import '../styles/operations-shared.css';
import '../styles/staff-command.css';

export const StaffCommand: React.FC = () => {
  const [selectedVenueId, setSelectedVenueId] = useState<string>(SIMULATED_VENUES[0].id);
  const [localIncidents, setLocalIncidents] = useState<IncidentData[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  const selectedVenue = SIMULATED_VENUES.find(venue => venue.id === selectedVenueId) ?? SIMULATED_VENUES[0];

  useEffect(() => {
    const venue = SIMULATED_VENUES.find(item => item.id === selectedVenueId) ?? SIMULATED_VENUES[0];
    setLocalIncidents(venue.incidents);
    setSelectedIncidentId(null);
  }, [selectedVenueId]);

  const venueSnapshot: VenueData = {
    ...selectedVenue,
    incidents: localIncidents,
  };

  const averageGatePressure = calculateAverageGatePressure(venueSnapshot);
  const overallStatus = getOverallVenueStatus(venueSnapshot);
  const criticalZones = getCriticalCrowdZones(venueSnapshot);
  const undercoveredZones = getUndercoveredZones(venueSnapshot);
  const priorityQueue = getStaffPriorityQueue(venueSnapshot);
  const recommendedActions = getRecommendedStaffActions(venueSnapshot);
  const { pendingCount, activeCount } = summarizeAccessibilityRequests(venueSnapshot);
  const selectedIncident = localIncidents.find(incident => incident.id === selectedIncidentId);

  const handleStatusChange = (incidentId: string, status: IncidentData['status']) => {
    setLocalIncidents(previousIncidents => (
      previousIncidents.map(incident => incident.id === incidentId ? { ...incident, status } : incident)
    ));
  };

  return (
    <div className="page-container staff-command">
      <div className="disclaimer-banner staff-command__disclaimer" role="note" aria-label="Simulated staff dashboard notice">
        <strong>Important Simulated Notice:</strong> This dashboard uses simulated prototype data and does not access external FIFA, venue, transit, ticketing, emergency, or current crowd systems. All status panels, gate loads, and recommendations are simulated mockups.
      </div>

      <header className="staff-command__header">
        <div className="staff-command__heading-copy">
          <h2>Staff Command Center (Simulated Venue Snapshot)</h2>
          <p>Simulated stadium operations control center, wait times, gate pressure, and crowd density alerts.</p>
        </div>

        <div className="staff-command__venue-control">
          <label htmlFor="staff-venue-select">Select Venue View (Simulated):</label>
          <select
            className="mc-select mc-select--paper staff-command__venue-select"
            id="staff-venue-select"
            value={selectedVenueId}
            onChange={event => setSelectedVenueId(event.target.value)}
          >
            {SIMULATED_VENUES.map(venue => (
              <option key={venue.id} value={venue.id}>{venue.name} ({venue.locationName})</option>
            ))}
          </select>
        </div>
      </header>

      <div className="staff-command__grid">
        <StaffTelemetryPanel
          venue={venueSnapshot}
          averageGatePressure={averageGatePressure}
          overallStatus={overallStatus}
          criticalZones={criticalZones}
          undercoveredZones={undercoveredZones}
        />

        <div className="staff-command__column">
          <StaffPriorityPanel recommendedActions={recommendedActions} priorityQueue={priorityQueue} />
          <StaffIncidentQueue
            venueName={venueSnapshot.name}
            incidents={localIncidents}
            selectedIncidentId={selectedIncidentId}
            pendingAccessibilityCount={pendingCount}
            activeAccessibilityCount={activeCount}
            onSelectIncident={setSelectedIncidentId}
          />
          {selectedIncident && (
            <StaffIncidentStatusControl incident={selectedIncident} onStatusChange={handleStatusChange} />
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffCommand;
