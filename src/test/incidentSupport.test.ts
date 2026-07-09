import { describe, it, expect } from 'vitest';
import {
  getIncidentPriority,
  getRelatedVenueRisks,
  generateLocalActionPlan,
  generateVolunteerBriefing,
  generateFanAnnouncementDraft,
  getIncidentSupportSummary
} from '../logic/incidentSupport';
import type { VenueData, IncidentData } from '../types';

const mockTestVenue: VenueData = {
  id: 'test-stadium-inc',
  name: 'Test Inc Venue',
  locationName: 'Test City',
  simulatedCapacity: 80000,
  isSimulatedPrototype: true,
  simulationDisclaimer: 'Test disclaimer',
  gates: [
    { id: 'g1', name: 'Gate 1', pressure: 'High', percentage: 92, isOpen: true, accessibleReady: true }
  ],
  zones: [
    { id: 'z1', name: 'North concourse', density: 'Critical', occupancyPercentage: 88, volunteerCount: 3 }
  ],
  concessions: [],
  accessibilityRequests: [
    { id: 'a1', type: 'Wheelchair Assistance', location: 'Gate 1', status: 'Pending', timestamp: '12:00' }
  ],
  transitStatus: [
    { id: 't1', type: 'Train Terminal', status: 'Normal Operations', crowdPressurePercentage: 80, loadLevel: 'Critical' }
  ],
  sustainability: {
    waterRefillStationLoadPercentage: 50,
    wasteSortingCompliancePercentage: 80,
    greenTransitEncouragementPercentage: 75
  },
  incidents: []
};

describe('Incident Decision Support Helper Functions', () => {
  it('correctly maps severity to incident priority level', () => {
    const incHigh: IncidentData = {
      id: 'i1',
      type: 'Spill',
      location: 'Gate 1',
      severity: 'High',
      status: 'Open',
      timestamp: '12:00'
    };
    expect(getIncidentPriority(incHigh)).toBe('High');

    const incLow: IncidentData = {
      id: 'i2',
      type: 'Lost Item',
      location: 'Gate 1',
      severity: 'Low',
      status: 'Open',
      timestamp: '12:00'
    };
    expect(getIncidentPriority(incLow)).toBe('Low');
  });

  it('identifies risk factors near the incident location', () => {
    const inc: IncidentData = {
      id: 'i1',
      type: 'Spill',
      location: 'Gate 1 and North concourse',
      severity: 'Medium',
      status: 'Open',
      timestamp: '12:00'
    };
    const risks = getRelatedVenueRisks(inc, mockTestVenue);
    expect(risks.length).toBeGreaterThan(0);
    const joined = risks.join(' ');
    expect(joined).toContain('Gate 1');
    expect(joined).toContain('North concourse');
  });

  it('generates a local support action plan grounded in simulated telemetry', () => {
    const inc: IncidentData = {
      id: 'i1',
      type: 'Spill',
      location: 'Section 102',
      severity: 'High',
      status: 'Open',
      timestamp: '12:00'
    };
    const plan = generateLocalActionPlan(inc, mockTestVenue);
    expect(plan.length).toBeGreaterThan(0);
    const joined = plan.join(' ');
    expect(joined).toContain('Section 102');
    expect(joined).toContain('wheelchair lanes'); // accessibility grounding
    expect(joined).toContain('egress load'); // transit grounding
  });

  it('generates a volunteer briefing marked as prototype and volunteer-focused', () => {
    const inc: IncidentData = {
      id: 'i1',
      type: 'Spill',
      location: 'Gate 1',
      severity: 'High',
      status: 'Open',
      timestamp: '12:00'
    };
    const briefing = generateVolunteerBriefing(inc, mockTestVenue);
    expect(briefing).toContain('Prototype staff briefing');
    expect(briefing).toContain('Gate 1');
    expect(briefing).toContain('volunteer');
  });

  it('generates a fan announcement draft marked clearly as prototype draft', () => {
    const inc: IncidentData = {
      id: 'i1',
      type: 'Spill',
      location: 'Gate 1',
      severity: 'High',
      status: 'Open',
      timestamp: '12:00'
    };
    const announcement = generateFanAnnouncementDraft(inc, mockTestVenue);
    expect(announcement).toContain('Prototype announcement draft');
    expect(announcement).toContain('Not authorized for stadium broadcast');
  });

  it('includes safety disclaimers and avoids forbidden wording in helper outputs', () => {
    const inc: IncidentData = {
      id: 'i1',
      type: 'Spill',
      location: 'Gate 1',
      severity: 'High',
      status: 'Open',
      timestamp: '12:00'
    };
    const summary = getIncidentSupportSummary(inc, mockTestVenue);
    
    // Check safety disclaimers
    expect(summary.disclaimer).toContain('simulated prototype data');
    
    // Verify no forbidden words in the generated plan
    const allText = Object.values(summary).flat().join(' ').toLowerCase();
    expect(allText).not.toContain('real-time');
    expect(allText).not.toContain('live');
    expect(allText).not.toContain('official');
    expect(allText).not.toContain('dispatch system');
    expect(allText).not.toContain('emergency response');
    expect(allText).not.toContain('ticketing');
    expect(allText).not.toContain('api access');
    expect(allText).not.toContain('genai-generated');
  });
});
