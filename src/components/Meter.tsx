import React from 'react';

interface MeterProps {
  value: number;
  label: string;
  tone?: 'cyan' | 'green' | 'amber' | 'red';
  showValue?: boolean;
}

export const Meter: React.FC<MeterProps> = ({ value, label, tone = 'cyan', showValue = true }) => {
  const safeValue = Math.min(100, Math.max(0, value));
  return (
    <div className="meter">
      <div className="meter__label">
        <span>{label}</span>
        {showValue && <strong>{safeValue}%</strong>}
      </div>
      <div
        className="meter__track"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safeValue}
      >
        <span className={`meter__fill meter__fill--${tone}`} style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
};

export default Meter;
