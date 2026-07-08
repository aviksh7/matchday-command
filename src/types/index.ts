export type PageId = 
  | 'home' 
  | 'fan-assistant' 
  | 'staff-command' 
  | 'crowd-map' 
  | 'incident-support' 
  | 'project-details';

export interface Incident {
  id: string;
  type: string;
  location: string;
  severity: 'Low' | 'Medium' | 'High';
  status: string;
  actionPlan?: string;
}

export interface GatePressure {
  gate: string;
  pressure: 'Low' | 'Medium' | 'High';
  percentage: number;
}
