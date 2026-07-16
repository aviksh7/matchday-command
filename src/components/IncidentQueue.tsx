import React from 'react';
import SeverityBadge from './SeverityBadge';
import type { IncidentData } from '../types';

interface IncidentQueueProps {
  incidents: IncidentData[];
  selectedIncidentId: string | null;
  venueName: string;
  onSelect: (incident: IncidentData) => void;
}

export const IncidentQueue: React.FC<IncidentQueueProps> = ({
  incidents,
  selectedIncidentId,
  venueName,
  onSelect,
}) => (
  <section className="card incident-panel incident-queue" aria-labelledby="incident-queue-title">
    <h3 id="incident-queue-title">Simulated Incident Queue Snapshot</h3>
    <p className="incident-panel__description">
      Select an incident from the log queue to calculate response planning drafts.
    </p>

    <div
      className="incident-table-shell"
      role="region"
      aria-label="Scrollable simulated incident table"
      tabIndex={0}
    >
      <table className="incident-queue__table">
        <caption>
          Simulated incidents for {venueName}. Select an incident to calculate a response planning draft.
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
          {incidents.map((incident) => {
            const isSelected = incident.id === selectedIncidentId;
            const rowClasses = [
              isSelected ? 'incident-queue__row--selected' : '',
              incident.status === 'Resolved' ? 'incident-queue__row--resolved' : '',
            ].filter(Boolean).join(' ');

            return (
              <tr key={incident.id} className={rowClasses || undefined}>
                <th scope="row">
                  <button
                    type="button"
                    className="incident-queue__select"
                    aria-label={`Review incident ${incident.id}`}
                    aria-pressed={isSelected}
                    onClick={() => onSelect(incident)}
                  >
                    {incident.id}
                  </button>
                </th>
                <td>{incident.type}</td>
                <td><SeverityBadge severity={incident.severity} /></td>
                <td>
                  <span className={`incident-status incident-status--${incident.status.toLowerCase()}`}>
                    {incident.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </section>
);

export default IncidentQueue;
