import React from 'react';
import type { AccessibilityRequest } from '../types';

interface StaffAccessibilityRequestsProps {
  venueName: string;
  requests: AccessibilityRequest[];
}

const STATUS_ORDER: Record<AccessibilityRequest['status'], number> = {
  Pending: 0,
  'In Progress': 1,
  Resolved: 2,
};

const getStatusClassName = (status: AccessibilityRequest['status']) => (
  `staff-command__request-status staff-command__request-status--${status.toLowerCase().replace(' ', '-')}`
);

export const StaffAccessibilityRequests: React.FC<StaffAccessibilityRequestsProps> = ({
  venueName,
  requests,
}) => {
  const orderedRequests = [...requests].sort((first, second) => (
    STATUS_ORDER[first.status] - STATUS_ORDER[second.status]
  ));

  return (
    <section className="card staff-command__card" aria-labelledby="staff-accessibility-requests-heading">
      <div className="staff-command__card-heading">
        <h3 id="staff-accessibility-requests-heading">Simulated Accessibility Support Requests</h3>
        <span className="staff-command__request-count">
          {requests.length} {requests.length === 1 ? 'record' : 'records'}
        </span>
      </div>
      <p className="staff-command__supporting-copy">
        Local request context for {venueName}, ordered with unresolved records first.
      </p>

      {orderedRequests.length > 0 ? (
        <ul className="staff-command__request-list">
          {orderedRequests.map(request => (
            <li key={request.id} className="staff-command__request-item">
              <div className="staff-command__request-heading">
                <strong>{request.type}</strong>
                <span className={getStatusClassName(request.status)}>{request.status}</span>
              </div>
              <dl className="staff-command__request-details">
                <div><dt>Location</dt><dd>{request.location}</dd></div>
                <div><dt>Logged</dt><dd>{request.timestamp}</dd></div>
              </dl>
            </li>
          ))}
        </ul>
      ) : (
        <p className="staff-command__success-copy">No accessibility support requests in this simulated snapshot.</p>
      )}

      <p className="staff-command__request-boundary" role="note" aria-label="Accessibility request boundary">
        These local records do not confirm assistance, contact staff, or trigger dispatch. Qualified onsite review is required.
      </p>
    </section>
  );
};

export default StaffAccessibilityRequests;
