import React from 'react';
import SeverityBadge from './SeverityBadge';
import type { IncidentData } from '../types';

interface StaffIncidentQueueProps {
  venueName: string;
  incidents: IncidentData[];
  selectedIncidentId: string | null;
  pendingAccessibilityCount: number;
  activeAccessibilityCount: number;
  onSelectIncident: (incidentId: string) => void;
}

const getStatusClassName = (status: IncidentData['status']) => (
  `staff-command__incident-status staff-command__incident-status--${status.toLowerCase()}`
);

export const StaffIncidentQueue: React.FC<StaffIncidentQueueProps> = ({
  venueName,
  incidents,
  selectedIncidentId,
  pendingAccessibilityCount,
  activeAccessibilityCount,
  onSelectIncident,
}) => (
  <section className="card staff-command__card" aria-labelledby="staff-incident-queue-heading">
    <h3 id="staff-incident-queue-heading">Prototype Staff Incident Queue</h3>
    <div
      className="staff-command__table-scroll"
      role="region"
      aria-label="Scrollable simulated incident table"
      tabIndex={0}
    >
      <table className="staff-command__incident-table">
        <caption>
          Simulated incidents for {venueName}. Select an incident to view details and update its local simulation status.
        </caption>
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Type</th>
            <th scope="col">Severity</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map(incident => {
            const isSelected = incident.id === selectedIncidentId;
            return (
              <tr className={isSelected ? 'staff-command__incident-row--selected' : undefined} key={incident.id}>
                <th scope="row">
                  <button
                    className="staff-command__incident-select"
                    type="button"
                    aria-label={`View incident ${incident.id} details`}
                    aria-pressed={isSelected}
                    onClick={() => onSelectIncident(incident.id)}
                  >
                    {incident.id}
                  </button>
                </th>
                <td>{incident.type}</td>
                <td><SeverityBadge severity={incident.severity} /></td>
                <td><span className={getStatusClassName(incident.status)}>{incident.status}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    <div className="staff-command__accessibility-summary">
      <span>Accessibility Requests Status:</span>
      <strong>{pendingAccessibilityCount} Pending / {activeAccessibilityCount} In Progress</strong>
    </div>
  </section>
);

export default StaffIncidentQueue;
