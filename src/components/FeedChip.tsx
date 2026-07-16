import React from 'react';
import Icon, { type IconName } from './Icon';

interface FeedChipProps {
  children: React.ReactNode;
  tone?: 'cyan' | 'green' | 'amber' | 'red' | 'neutral';
  icon?: IconName;
}

export const FeedChip: React.FC<FeedChipProps> = ({ children, tone = 'neutral', icon }) => (
  <span className={`feed-chip feed-chip--${tone}`}>
    {icon && <Icon name={icon} size={14} />}
    {children}
  </span>
);

export default FeedChip;
