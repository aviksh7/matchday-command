import React from 'react';
import Button from './Button';
import type { IncidentData } from '../types';

interface IncidentScenarioBuilderProps {
  incidentType: string;
  location: string;
  severity: IncidentData['severity'];
  isLoading: boolean;
  onIncidentTypeChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSeverityChange: (value: IncidentData['severity']) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const INCIDENT_TYPES = [
  'Spill Hazard',
  'Crowd Bottleneck',
  'Medical Emergency',
  'Gate Glitch',
  'Concession Supply Outage',
  'Guest Health Support Request',
  'Lost Belongings',
  'Equipment Malfunction',
];

export const IncidentScenarioBuilder: React.FC<IncidentScenarioBuilderProps> = ({
  incidentType,
  location,
  severity,
  isLoading,
  onIncidentTypeChange,
  onLocationChange,
  onSeverityChange,
  onSubmit,
}) => (
  <section className="card incident-panel incident-scenario" aria-labelledby="incident-scenario-title">
    <h3 id="incident-scenario-title">Simulated Incident Scenario Builder</h3>
    <p className="incident-panel__description">
      Create a custom mock incident to test a simulated decision-support draft.
    </p>

    <form className="incident-scenario__form" onSubmit={onSubmit}>
      <div className="incident-field">
        <label htmlFor="scenario-type">Incident Type:</label>
        <select
          id="scenario-type"
          value={incidentType}
          onChange={(event) => onIncidentTypeChange(event.target.value)}
          disabled={isLoading}
        >
          {INCIDENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>

      <div className="incident-field">
        <label htmlFor="scenario-location">Location:</label>
        <input
          id="scenario-location"
          type="text"
          value={location}
          onChange={(event) => onLocationChange(event.target.value)}
          disabled={isLoading}
          placeholder="e.g. Concourse Sec 108"
        />
      </div>

      <div className="incident-field">
        <label htmlFor="scenario-severity">Severity Level:</label>
        <select
          id="scenario-severity"
          value={severity}
          onChange={(event) => onSeverityChange(event.target.value as IncidentData['severity'])}
          disabled={isLoading}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      <Button type="submit" variant="paper" className="incident-scenario__submit" disabled={isLoading}>
        Generate Simulated Decision-Support Draft
      </Button>
    </form>
  </section>
);

export default IncidentScenarioBuilder;
