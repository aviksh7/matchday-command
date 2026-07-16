import React from 'react';

interface StatusChipProps {
  status: 'Normal' | 'Elevated' | 'Critical';
  label?: string;
  theme?: 'night' | 'paper';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, label, theme = 'night' }) => (
  <span className={`status-chip status-chip--${status.toLowerCase()} status-chip--${theme}`}>
    <span className="status-chip__dot" aria-hidden="true" />
    {label ?? status}
  </span>
);

export default StatusChip;
