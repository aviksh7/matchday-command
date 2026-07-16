import React from 'react';
import type { IconName } from './Icon';
import Icon from './Icon';

export interface TelemetryItem {
  label: string;
  value: string;
  detail: string;
  icon: IconName;
  tone?: 'cyan' | 'green' | 'amber' | 'red';
}

interface TelemetryRibbonProps {
  items: TelemetryItem[];
}

export const TelemetryRibbon: React.FC<TelemetryRibbonProps> = ({ items }) => (
  <section className="telemetry-ribbon" aria-label="Selected venue simulated telemetry">
    <div className="telemetry-ribbon__label">
      <span className="telemetry-ribbon__pulse" aria-hidden="true" />
      Simulated telemetry
    </div>
    <div className="telemetry-ribbon__items">
      {items.map(item => (
        <div key={item.label} className={`telemetry-ribbon__item telemetry-ribbon__item--${item.tone ?? 'cyan'}`}>
          <Icon name={item.icon} size={18} />
          <div>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.detail}</small>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default TelemetryRibbon;
