import type { Incident, GatePressure } from '../types';

export const SIMULATED_INCIDENTS: Incident[] = [
  {
    id: 'INC-001',
    type: 'Crowd Bottleneck',
    location: 'Gate A Exit Ramp',
    severity: 'High',
    status: 'Needs Action Plan',
  },
  {
    id: 'INC-002',
    type: 'Spill Hazard',
    location: 'Concourse Section 108',
    severity: 'Medium',
    status: 'Assigned to Volunteers',
  },
  {
    id: 'INC-003',
    type: 'Elevator Malfunction',
    location: 'West Plaza Elevator 2',
    severity: 'Medium',
    status: 'Maintenance Notified',
  }
];

export const SIMULATED_GATES: GatePressure[] = [
  { gate: 'Gate A', pressure: 'High', percentage: 85 },
  { gate: 'Gate B', pressure: 'Medium', percentage: 45 },
  { gate: 'Gate C', pressure: 'Low', percentage: 20 },
  { gate: 'Gate D', pressure: 'Medium', percentage: 55 }
];
