import React from 'react';
import Icon from './Icon';
import type { IncidentSupportApiResponse, ResponseSource } from '../logic/apiClient';
import type { IncidentData } from '../types';

interface IncidentDecisionSupportPanelProps {
  incident?: IncidentData;
  summary: IncidentSupportApiResponse | null;
  relatedRisks: string[];
  source?: ResponseSource;
  fallbackReason?: string;
  isLoading: boolean;
  onStatusChange: (incidentId: string, status: IncidentData['status']) => void;
}

interface IncidentStatusControlProps {
  incident: IncidentData;
  isLoading: boolean;
  onStatusChange: (incidentId: string, status: IncidentData['status']) => void;
}

const INCIDENT_STATUSES: IncidentData['status'][] = ['Open', 'Dispatched', 'Resolved'];

const IncidentStatusControl: React.FC<IncidentStatusControlProps> = ({
  incident,
  isLoading,
  onStatusChange,
}) => (
  <fieldset className="incident-status-control" aria-describedby="incident-status-note">
    <legend>Local Status:</legend>
    <div className="incident-status-control__buttons">
      {INCIDENT_STATUSES.map((status) => {
        const isCurrent = incident.status === status;
        return (
          <button
            key={status}
            type="button"
            className="incident-status-control__button"
            aria-pressed={isCurrent}
            onClick={() => onStatusChange(incident.id, status)}
            disabled={isCurrent || isLoading}
          >
            {status}
          </button>
        );
      })}
    </div>
    <p className="incident-status-control__note" id="incident-status-note">Local simulation only. Changing status does not dispatch staff.</p>
  </fieldset>
);

export const IncidentDecisionSupportPanel: React.FC<IncidentDecisionSupportPanelProps> = ({
  incident,
  summary,
  relatedRisks,
  source,
  fallbackReason,
  isLoading,
  onStatusChange,
}) => {
  if (!incident || !summary) {
    return (
      <section className="card incident-panel incident-decision incident-decision--empty">
        <h3>Incident Details &amp; Decision Support</h3>
        <p>
          Select an incident from the simulated log queue or configure a new custom scenario to inspect a simulated decision-support draft.
        </p>
      </section>
    );
  }

  const sourceClass = source === 'Vertex AI via Cloud Run'
    ? 'incident-source--vertex'
    : 'incident-source--fallback';

  return (
    <section className="card incident-panel incident-decision" aria-labelledby="incident-decision-title">
      <header className="incident-decision__header">
        <div>
          <h3 id="incident-decision-title">Decision Support Detail: {incident.id}</h3>
          <span className="incident-decision__location">Location: simulated {incident.location}</span>
        </div>
        <IncidentStatusControl
          incident={incident}
          isLoading={isLoading}
          onStatusChange={onStatusChange}
        />
      </header>

      <div className="incident-decision__source">
        {isLoading ? (
          <span className="incident-source incident-source--loading" role="status" aria-live="polite">
            <span className="inline-icon-label">
              <Icon name="spark" size={14} />
              Generating Vertex AI guidance via Cloud Run...
            </span>
          </span>
        ) : (
          <span className={`incident-source ${sourceClass}`} role="status">
            {source || 'Local deterministic fallback'}
          </span>
        )}

        {fallbackReason && !isLoading && (
          <p className="incident-fallback-reason">
            <strong>Fallback Reason:</strong> {fallbackReason}
          </p>
        )}
      </div>

      <aside className="incident-decision__limitations" aria-labelledby="incident-limitations-title">
        <h4 id="incident-limitations-title">Decision-Support Limitations</h4>
        <p>{summary.limitations}</p>
        <p>
          Qualified human review is required. This prototype does not dispatch staff, publish announcements,
          contact emergency services, or carry official authority.
        </p>
      </aside>

      <div className="incident-decision__section">
        <h4>Related Simulated Operations Risks</h4>
        <ul>
          {relatedRisks.map((risk, index) => <li key={`${index}-${risk}`}>{risk}</li>)}
        </ul>
      </div>

      <div className="incident-summary">
        <strong>Situation Summary:</strong>
        <p>{summary.situationSummary}</p>
      </div>

      <p className="incident-priority">
        Priority Support Level:{' '}
        <strong className={`incident-priority--${summary.priorityLevel.toLowerCase()}`}>
          {summary.priorityLevel}
        </strong>
      </p>

      <div className="incident-decision__section">
        <h4>Response Planning Draft Checklist</h4>
        <ol>
          {summary.recommendedActions.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}
        </ol>
      </div>

      <div className="incident-decision__section">
        <h4>Prototype Staff Briefing Guidelines</h4>
        <pre className="incident-briefing">{summary.volunteerBriefing}</pre>
      </div>

      <div className="incident-decision__section">
        <h4>Prototype Fan Announcement Draft</h4>
        <p className="incident-announcement">{summary.fanAnnouncementDraft}</p>
      </div>

      <div className="incident-decision__notes">
        <p>{summary.accessibilityNote}</p>
        <p>{summary.crowdTransitNote}</p>
      </div>

      <p className="incident-decision__grounding">
        {Array.isArray(summary.simulatedDataUsed)
          ? summary.simulatedDataUsed.join(', ')
          : summary.simulatedDataUsed}
      </p>
    </section>
  );
};

export default IncidentDecisionSupportPanel;
