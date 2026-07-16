import React from 'react';
import Button from './Button';
import SeverityBadge from './SeverityBadge';
import type { IncidentData } from '../types';

interface StaffIncidentStatusControlProps {
  incident: IncidentData;
  onStatusChange: (incidentId: string, status: IncidentData['status']) => void;
}

const INCIDENT_STATUSES: IncidentData['status'][] = ['Open', 'Dispatched', 'Resolved'];

export const StaffIncidentStatusControl: React.FC<StaffIncidentStatusControlProps> = ({ incident, onStatusChange }) => {
  const noteId = `staff-incident-status-note-${incident.id}`;

  return (
    <section className="card staff-command__card staff-command__incident-detail" aria-labelledby="staff-incident-detail-heading">
      <h3 id="staff-incident-detail-heading">Simulated Incident Details: {incident.id}</h3>
      <dl className="staff-command__incident-details">
        <div>
          <dt>Type</dt>
          <dd>{incident.type}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{incident.location}</dd>
        </div>
        <div>
          <dt>Severity</dt>
          <dd><SeverityBadge severity={incident.severity} /></dd>
        </div>
        <div>
          <dt>Timestamp</dt>
          <dd>{incident.timestamp}</dd>
        </div>
        <div>
          <dt>Current Simulation Status</dt>
          <dd aria-live="polite">{incident.status}</dd>
        </div>
      </dl>

      <fieldset className="staff-command__status-fieldset" aria-describedby={noteId}>
        <legend>Update Local Status:</legend>
        <div className="staff-command__status-actions">
          {INCIDENT_STATUSES.map(status => (
            <Button
              className={incident.status === status ? 'staff-command__status-action--active' : ''}
              type="button"
              variant="ghost"
              disabled={incident.status === status}
              onClick={() => onStatusChange(incident.id, status)}
              key={status}
            >
              {status}
            </Button>
          ))}
        </div>
      </fieldset>
      <p className="staff-command__session-note" id={noteId}>
        This status update is local to this session only and will reset upon page reload or venue change.
      </p>
    </section>
  );
};

export default StaffIncidentStatusControl;
