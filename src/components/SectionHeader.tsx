import React from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  level?: 2 | 3;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  description,
  action,
  level = 2,
}) => {
  const Heading = `h${level}` as 'h2' | 'h3';
  return (
    <div className="section-header">
      <div className="section-header__copy">
        {eyebrow && <span className="section-header__eyebrow">{eyebrow}</span>}
        <Heading>{title}</Heading>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="section-header__action">{action}</div>}
    </div>
  );
};

export default SectionHeader;
