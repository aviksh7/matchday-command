export type PageId = 
  | 'home' 
  | 'fan-assistant' 
  | 'staff-command' 
  | 'crowd-map' 
  | 'incident-support' 
  | 'project-details';

export interface IncidentData {
  id: string;
  type: string;
  location: string;
  severity: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'Dispatched' | 'Resolved';
  timestamp: string;
  actionPlanText?: string;
}

// Keep Incident interface for compatibility
export interface Incident extends IncidentData {
  actionPlan?: string;
}

export interface GateData {
  id: string;
  name: string;
  pressure: 'Low' | 'Medium' | 'High';
  percentage: number;
  isOpen: boolean;
  accessibleReady: boolean;
}

// Keep GatePressure interface for compatibility
export interface GatePressure {
  gate: string;
  pressure: 'Low' | 'Medium' | 'High';
  percentage: number;
}

export interface ZoneData {
  id: string;
  name: string;
  density: 'Low' | 'Medium' | 'High' | 'Critical';
  occupancyPercentage: number;
  volunteerCount: number;
}

export interface ConcessionData {
  id: string;
  name: string;
  type: 'Food' | 'Merchandise' | 'Restroom';
  waitTimeMinutes: number;
  isAccessible: boolean;
}

export interface AccessibilityRequest {
  id: string;
  type: 'Wheelchair Assistance' | 'Sign Language' | 'Sensory Room Request' | 'Stroller Storage';
  location: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  timestamp: string;
}

export interface SimulatedTransitStatus {
  id: string;
  type: 'Train Terminal' | 'Bus Shuttle' | 'Rideshare Zone' | 'Park & Ride';
  status: 'Normal Operations' | 'High Concourse Pressure' | 'Delayed Dispatch' | 'Suspended';
  crowdPressurePercentage: number;
  loadLevel: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface SustainabilityMetrics {
  waterRefillStationLoadPercentage: number;
  wasteSortingCompliancePercentage: number;
  greenTransitEncouragementPercentage: number;
}

export interface VenueData {
  id: string;
  name: string;
  locationName: string;
  simulatedCapacity: number;
  isSimulatedPrototype: boolean;
  simulationDisclaimer: string;
  gates: GateData[];
  zones: ZoneData[];
  concessions: ConcessionData[];
  accessibilityRequests: AccessibilityRequest[];
  transitStatus: SimulatedTransitStatus[];
  sustainability: SustainabilityMetrics;
  incidents: IncidentData[];
}
