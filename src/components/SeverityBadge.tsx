import React from 'react';

interface SeverityBadgeProps {
  severity: 'Low' | 'Medium' | 'High';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => (
  <span className={`severity-badge severity-badge--${severity.toLowerCase()}`}>{severity}</span>
);

export default SeverityBadge;
