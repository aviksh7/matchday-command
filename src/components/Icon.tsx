import React from 'react';

export type IconName =
  | 'accessibility'
  | 'arrow-right'
  | 'assistant'
  | 'bus'
  | 'check'
  | 'cloud'
  | 'fallback'
  | 'incident'
  | 'info'
  | 'map'
  | 'menu'
  | 'operations'
  | 'route'
  | 'spark'
  | 'train'
  | 'venue'
  | 'warning'
  | 'water';

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  title?: string;
}

const paths: Record<IconName, React.ReactNode> = {
  accessibility: <><circle cx="12" cy="4.5" r="2" /><path d="M10 8h4l2 4.2h-4.5l-1.7 4.3" /><path d="M9.4 10.5a5 5 0 1 0 6.6 5.7" /><path d="M16 12.2 18.5 18H21" /></>,
  'arrow-right': <><path d="M5 12h14" /><path d="m14 7 5 5-5 5" /></>,
  assistant: <><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-5 4v-4.5A2.5 2.5 0 0 1 4 13.5Z" /><path d="M8 8.5h8M8 12h5" /></>,
  bus: <><rect x="5" y="3" width="14" height="15" rx="3" /><path d="M5 12h14M8 7h8M8 18v2M16 18v2" /><circle cx="8.5" cy="15" r="1" /><circle cx="15.5" cy="15" r="1" /></>,
  check: <path d="m5 12.5 4 4L19 6.5" />,
  cloud: <path d="M7 18h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.1 8.2 4.9 4.9 0 0 0 7 18Z" />,
  fallback: <><path d="M20 7v5h-5" /><path d="M18.6 16A8 8 0 1 1 20 10.5" /></>,
  incident: <><path d="M12 3 2.8 20h18.4Z" /><path d="M12 9v4.5M12 17h.01" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></>,
  map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z" /><path d="M9 3v15M15 6v15" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  operations: <><path d="M4 18V9M10 18V5M16 18v-7M22 18H2" /><path d="M2 18h20" /></>,
  route: <><circle cx="6" cy="18" r="2" /><circle cx="18" cy="6" r="2" /><path d="M8 18h3a3 3 0 0 0 3-3v-6a3 3 0 0 1 3-3" /></>,
  spark: <><path d="m12 2 1.4 5.1L18 9l-4.6 1.9L12 16l-1.4-5.1L6 9l4.6-1.9Z" /><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7Z" /></>,
  train: <><rect x="6" y="3" width="12" height="15" rx="3" /><path d="M6 12h12M9 7h6M8 21l3-3M16 21l-3-3" /><circle cx="9" cy="15" r="1" /><circle cx="15" cy="15" r="1" /></>,
  venue: <><path d="M4 8c2.3-4 13.7-4 16 0v8c-2.3 4-13.7 4-16 0Z" /><rect x="8" y="9" width="8" height="6" rx="1" /></>,
  warning: <><path d="M12 3 2.8 20h18.4Z" /><path d="M12 9v4.5M12 17h.01" /></>,
  water: <path d="M12 3c3.5 4.2 6 7.2 6 10.2A6 6 0 0 1 6 13.2C6 10.2 8.5 7.2 12 3Z" />,
};

export const Icon: React.FC<IconProps> = ({ name, size = 18, className, title }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden={title ? undefined : true}
    role={title ? 'img' : undefined}
  >
    {title && <title>{title}</title>}
    {paths[name]}
  </svg>
);

export default Icon;
