import type { VenueData } from '../types';

export const SIMULATED_VENUES: VenueData[] = [
  {
    id: 'toronto-demo',
    name: 'Toronto Stadium Demo',
    locationName: 'Toronto, ON',
    simulatedCapacity: 45000,
    isSimulatedPrototype: true,
    simulationDisclaimer: 'Simulated venue data for prototype evaluation only. Does not reflect real event schedules, attendance, or municipal systems in Toronto.',
    gates: [
      { id: 'gate-a', name: 'Gate A (Main)', pressure: 'High', percentage: 82, isOpen: true, accessibleReady: true },
      { id: 'gate-b', name: 'Gate B', pressure: 'Medium', percentage: 48, isOpen: true, accessibleReady: false },
      { id: 'gate-c', name: 'Gate C (West)', pressure: 'Low', percentage: 18, isOpen: true, accessibleReady: true },
      { id: 'gate-d', name: 'Gate D (East)', pressure: 'Low', percentage: 22, isOpen: false, accessibleReady: false }
    ],
    zones: [
      { id: 'zone-1', name: 'North Concourse', density: 'Medium', occupancyPercentage: 55, volunteerCount: 8 },
      { id: 'zone-2', name: 'South Concourse', density: 'High', occupancyPercentage: 78, volunteerCount: 12 },
      { id: 'zone-3', name: 'East Concourse', density: 'Low', occupancyPercentage: 30, volunteerCount: 4 },
      { id: 'zone-4', name: 'West Concourse', density: 'Low', occupancyPercentage: 25, volunteerCount: 5 }
    ],
    concessions: [
      { id: 'con-1', name: 'Maple Grills Sec 102', type: 'Food', waitTimeMinutes: 12, isAccessible: true },
      { id: 'con-2', name: 'Restroom Block Sec 108', type: 'Restroom', waitTimeMinutes: 4, isAccessible: true },
      { id: 'con-3', name: 'Merch Stand North', type: 'Merchandise', waitTimeMinutes: 18, isAccessible: false }
    ],
    accessibilityRequests: [
      { id: 'acc-101', type: 'Wheelchair Assistance', location: 'Gate A Security', status: 'Pending', timestamp: '19:10' },
      { id: 'acc-102', type: 'Sensory Room Request', location: 'Section 114 Suite', status: 'In Progress', timestamp: '19:15' }
    ],
    transitStatus: [
      { id: 'transit-1', type: 'Train Terminal', status: 'Normal Operations', crowdPressurePercentage: 35, loadLevel: 'Low' },
      { id: 'transit-2', type: 'Bus Shuttle', status: 'Delayed Dispatch', crowdPressurePercentage: 70, loadLevel: 'High' },
      { id: 'transit-3', type: 'Rideshare Zone', status: 'High Concourse Pressure', crowdPressurePercentage: 85, loadLevel: 'Critical' }
    ],
    sustainability: {
      waterRefillStationLoadPercentage: 62,
      wasteSortingCompliancePercentage: 88,
      greenTransitEncouragementPercentage: 75
    },
    incidents: [
      { id: 'INC-201', type: 'Spill Hazard', location: 'Concourse Sec 108', severity: 'Medium', status: 'Open', timestamp: '19:05' }
    ]
  },
  {
    id: 'mexico-demo',
    name: 'Mexico City Stadium Demo',
    locationName: 'Mexico City, MX',
    simulatedCapacity: 87500,
    isSimulatedPrototype: true,
    simulationDisclaimer: 'Simulated venue data for prototype evaluation only. Does not reflect real event schedules, attendance, or municipal systems in Mexico City.',
    gates: [
      { id: 'gate-a', name: 'Gate A (North)', pressure: 'High', percentage: 90, isOpen: true, accessibleReady: true },
      { id: 'gate-b', name: 'Gate B (South)', pressure: 'High', percentage: 88, isOpen: true, accessibleReady: true },
      { id: 'gate-c', name: 'Gate C (East)', pressure: 'Medium', percentage: 55, isOpen: true, accessibleReady: false },
      { id: 'gate-d', name: 'Gate D (West)', pressure: 'Low', percentage: 32, isOpen: true, accessibleReady: true }
    ],
    zones: [
      { id: 'zone-1', name: 'Lower Ring', density: 'High', occupancyPercentage: 85, volunteerCount: 22 },
      { id: 'zone-2', name: 'Upper Ring', density: 'Medium', occupancyPercentage: 60, volunteerCount: 15 },
      { id: 'zone-3', name: 'Main Plaza Gate A', density: 'Critical', occupancyPercentage: 92, volunteerCount: 30 },
      { id: 'zone-4', name: 'East Promenade', density: 'Low', occupancyPercentage: 40, volunteerCount: 8 }
    ],
    concessions: [
      { id: 'con-1', name: 'Taco Plaza Sec 120', type: 'Food', waitTimeMinutes: 25, isAccessible: true },
      { id: 'con-2', name: 'Restroom Block Sec 134', type: 'Restroom', waitTimeMinutes: 15, isAccessible: true },
      { id: 'con-3', name: 'Souvenirs Plaza', type: 'Merchandise', waitTimeMinutes: 30, isAccessible: true }
    ],
    accessibilityRequests: [
      { id: 'acc-201', type: 'Sign Language', location: 'Information Booth 2', status: 'Pending', timestamp: '19:02' }
    ],
    transitStatus: [
      { id: 'transit-1', type: 'Train Terminal', status: 'High Concourse Pressure', crowdPressurePercentage: 92, loadLevel: 'Critical' },
      { id: 'transit-2', type: 'Bus Shuttle', status: 'Normal Operations', crowdPressurePercentage: 45, loadLevel: 'Medium' },
      { id: 'transit-3', type: 'Park & Ride', status: 'Normal Operations', crowdPressurePercentage: 20, loadLevel: 'Low' }
    ],
    sustainability: {
      waterRefillStationLoadPercentage: 84,
      wasteSortingCompliancePercentage: 92,
      greenTransitEncouragementPercentage: 68
    },
    incidents: [
      { id: 'INC-301', type: 'Crowd Bottleneck', location: 'Gate A Main Exit', severity: 'High', status: 'Open', timestamp: '18:55' },
      { id: 'INC-302', type: 'Lost Belongings', location: 'Concourse Sec 120', severity: 'Low', status: 'Open', timestamp: '19:12' }
    ]
  },
  {
    id: 'nynj-demo',
    name: 'New York/New Jersey Stadium Demo',
    locationName: 'East Rutherford, NJ',
    simulatedCapacity: 82500,
    isSimulatedPrototype: true,
    simulationDisclaimer: 'Simulated venue data for prototype evaluation only. Does not reflect real event schedules, attendance, or municipal systems in East Rutherford.',
    gates: [
      { id: 'gate-a', name: 'Gate A (Plaza)', pressure: 'Medium', percentage: 58, isOpen: true, accessibleReady: true },
      { id: 'gate-b', name: 'Gate B (Transit)', pressure: 'High', percentage: 86, isOpen: true, accessibleReady: true },
      { id: 'gate-c', name: 'Gate C', pressure: 'Medium', percentage: 44, isOpen: true, accessibleReady: true },
      { id: 'gate-d', name: 'Gate D', pressure: 'Low', percentage: 22, isOpen: true, accessibleReady: false }
    ],
    zones: [
      { id: 'zone-1', name: 'West Plaza Concourse', density: 'Medium', occupancyPercentage: 65, volunteerCount: 14 },
      { id: 'zone-2', name: 'East Plaza Concourse', density: 'Low', occupancyPercentage: 35, volunteerCount: 9 },
      { id: 'zone-3', name: 'Transit Plaza Gate B', density: 'High', occupancyPercentage: 82, volunteerCount: 20 },
      { id: 'zone-4', name: 'Upper Deck South', density: 'Low', occupancyPercentage: 28, volunteerCount: 6 }
    ],
    concessions: [
      { id: 'con-1', name: 'Empire Burgers Sec 114', type: 'Food', waitTimeMinutes: 15, isAccessible: true },
      { id: 'con-2', name: 'Restroom Block Sec 122', type: 'Restroom', waitTimeMinutes: 9, isAccessible: true },
      { id: 'con-3', name: 'Jersey Brews Sec 130', type: 'Food', waitTimeMinutes: 10, isAccessible: true }
    ],
    accessibilityRequests: [
      { id: 'acc-301', type: 'Wheelchair Assistance', location: 'Gate B Arrival Hub', status: 'Pending', timestamp: '19:08' },
      { id: 'acc-302', type: 'Stroller Storage', location: 'Gate C Guest Services', status: 'Resolved', timestamp: '18:40' },
      { id: 'acc-303', type: 'Wheelchair Assistance', location: 'Section 114 Row F', status: 'In Progress', timestamp: '19:14' }
    ],
    transitStatus: [
      { id: 'transit-1', type: 'Train Terminal', status: 'Normal Operations', crowdPressurePercentage: 50, loadLevel: 'Medium' },
      { id: 'transit-2', type: 'Bus Shuttle', status: 'Normal Operations', crowdPressurePercentage: 40, loadLevel: 'Medium' },
      { id: 'transit-3', type: 'Rideshare Zone', status: 'Delayed Dispatch', crowdPressurePercentage: 75, loadLevel: 'High' }
    ],
    sustainability: {
      waterRefillStationLoadPercentage: 50,
      wasteSortingCompliancePercentage: 80,
      greenTransitEncouragementPercentage: 82
    },
    incidents: [
      { id: 'INC-101', type: 'Elevator Malfunction', location: 'West Plaza Elevator 2', severity: 'Medium', status: 'Open', timestamp: '19:01' }
    ]
  }
];
