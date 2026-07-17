import React from 'react';
import SeverityBadge from './SeverityBadge';
import type { PriorityQueueItem } from '../types';

interface StaffPriorityPanelProps {
  recommendedActions: string[];
  priorityQueue: PriorityQueueItem[];
}

export const StaffPriorityPanel: React.FC<StaffPriorityPanelProps> = ({ recommendedActions, priorityQueue }) => (
  <>
    <section className="card staff-command__card staff-command__recommendations" aria-labelledby="staff-recommendations-heading">
      <h3 id="staff-recommendations-heading">Local Simulated Recommendations</h3>
      <p className="staff-command__review-boundary" role="note" aria-label="Recommendation review boundary">
        <strong>Decision support only.</strong> A qualified human must review these options. Nothing listed here dispatches staff or changes venue systems.
      </p>
      <ul className="staff-command__recommendation-list">
        {recommendedActions.map((action, index) => <li key={`${index}-${action}`}>{action}</li>)}
      </ul>
    </section>

    <section className="card staff-command__card" aria-labelledby="staff-priority-heading">
      <h3 id="staff-priority-heading">Simulated Staff Priority Queue</h3>
      <p className="staff-command__supporting-copy">High-priority operational items sorted by severity risk level.</p>
      {priorityQueue.length > 0 ? (
        <div className="staff-command__priority-list">
          {priorityQueue.map(item => (
            <article className="staff-command__priority-item" key={item.id}>
              <div className="staff-command__priority-label">
                <SeverityBadge severity={item.severity} />
                <strong>[{item.type}]</strong>
                <span>{item.location}</span>
              </div>
              <p>{item.details}</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="staff-command__success-copy">No high-priority alerts on queue.</p>
      )}
    </section>
  </>
);

export default StaffPriorityPanel;
