import type { VenueData, IncidentData } from '../types';

export type FallbackReason = 'timeout' | 'network' | 'server' | 'invalid-response' | 'payload-too-large';
export type ResponseSource = 'Vertex AI via Cloud Run' | 'Local deterministic fallback';

export interface FanAssistantRequestPayload {
  userQuery: string;
  venue: Record<string, unknown>;
  simulatedVenueContext: Record<string, unknown>;
}

export interface FanAssistantApiResponse {
  summary: string;
  recommendedAction: string;
  simulatedDataUsed: string[];
  limitations: string;
}

export interface IncidentSupportRequestPayload {
  incident: Record<string, unknown>;
  venue: Record<string, unknown>;
  simulatedVenueContext: Record<string, unknown>;
}

export interface IncidentSupportApiResponse {
  situationSummary: string;
  priorityLevel: 'Low' | 'Medium' | 'High';
  recommendedActions: string[];
  volunteerBriefing: string;
  fanAnnouncementDraft: string;
  accessibilityNote: string;
  crowdTransitNote: string;
  simulatedDataUsed: string[];
  limitations: string;
}

export type ApiClientResult<T> =
  | { success: true; data: T; source: 'Vertex AI via Cloud Run' }
  | { success: false; reason: FallbackReason; message: string; source: 'Local deterministic fallback' };

/**
 * Returns the base URL for API requests. In production, requests use same-origin relative URLs (/api/...).
 * In local Vite development, optional VITE_API_BASE_URL can be set, or local dev uses relative URLs / fallback.
 */
export const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_BASE_URL || '';
};

const isNonEmptyStringArray = (value: unknown): value is string[] =>
  Array.isArray(value)
  && value.length > 0
  && value.every(item => typeof item === 'string' && item.trim().length > 0);

/**
 * Validates whether the given data conforms strictly to the FanAssistantApiResponse schema.
 */
export const isValidFanAssistantResponse = (data: unknown): data is FanAssistantApiResponse => {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;

  if (typeof obj.summary !== 'string' || obj.summary.trim().length === 0) return false;
  if (typeof obj.recommendedAction !== 'string' || obj.recommendedAction.trim().length === 0) return false;
  if (!isNonEmptyStringArray(obj.simulatedDataUsed)) return false;
  if (typeof obj.limitations !== 'string' || obj.limitations.trim().length === 0) return false;

  return true;
};

/**
 * Validates whether the given data conforms strictly to the IncidentSupportApiResponse schema.
 */
export const isValidIncidentSupportResponse = (data: unknown): data is IncidentSupportApiResponse => {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;

  const priorityLevels = ['Low', 'Medium', 'High'];
  if (typeof obj.situationSummary !== 'string' || obj.situationSummary.trim().length === 0) return false;
  if (typeof obj.priorityLevel !== 'string' || !priorityLevels.includes(obj.priorityLevel)) return false;
  if (!isNonEmptyStringArray(obj.recommendedActions)) return false;
  if (typeof obj.volunteerBriefing !== 'string' || obj.volunteerBriefing.trim().length === 0) return false;
  if (typeof obj.fanAnnouncementDraft !== 'string' || obj.fanAnnouncementDraft.trim().length === 0) return false;
  if (typeof obj.accessibilityNote !== 'string' || obj.accessibilityNote.trim().length === 0) return false;
  if (typeof obj.crowdTransitNote !== 'string' || obj.crowdTransitNote.trim().length === 0) return false;
  if (!isNonEmptyStringArray(obj.simulatedDataUsed)) return false;
  if (typeof obj.limitations !== 'string' || obj.limitations.trim().length === 0) return false;

  return true;
};

/**
 * Builds a compact serializable venue object to pass into the `venue` field (< 1,000 chars).
 */
export const buildCompactVenue = (venue: VenueData): Record<string, unknown> => ({
  id: venue.id,
  name: venue.name,
  locationName: venue.locationName,
  simulatedCapacity: venue.simulatedCapacity
});

/**
 * Builds a compact serializable incident object to pass into the `incident` field (< 1,000 chars).
 */
export const buildCompactIncident = (incident: IncidentData): Record<string, unknown> => ({
  id: incident.id,
  type: incident.type,
  location: incident.location,
  severity: incident.severity,
  status: incident.status
});

/**
 * Builds a compact serializable object containing only useful simulated telemetry (< 4,000 chars when stringified).
 */
export const buildCompactContext = (venue: VenueData): Record<string, unknown> => ({
  id: venue.id,
  name: venue.name,
  gates: venue.gates ? venue.gates.map(g => ({ name: g.name, pressure: g.pressure, percentage: g.percentage, isOpen: g.isOpen, accessibleReady: g.accessibleReady })) : [],
  zones: venue.zones ? venue.zones.map(z => ({ name: z.name, density: z.density, occupancyPercentage: z.occupancyPercentage, volunteerCount: z.volunteerCount })) : [],
  concessions: venue.concessions ? venue.concessions.map(c => ({ name: c.name, type: c.type, waitTimeMinutes: c.waitTimeMinutes, isAccessible: c.isAccessible })) : [],
  accessibilitySupportRequests: venue.accessibilityRequests
    ? venue.accessibilityRequests.map(request => ({ type: request.type, location: request.location, status: request.status }))
    : [],
  transitStatus: venue.transitStatus ? venue.transitStatus.map(t => ({ type: t.type, status: t.status, crowdPressurePercentage: t.crowdPressurePercentage, loadLevel: t.loadLevel })) : [],
  sustainability: venue.sustainability || {},
  unresolvedIncidentCount: venue.incidents ? venue.incidents.filter(incident => incident.status !== 'Resolved').length : 0
});

/**
 * Guards payload size against backend validation limits before sending over the network.
 */
export const validatePayloadLimits = (payload: {
  field1: unknown;
  field1MaxLen: number;
  venue: unknown;
  context: unknown;
}): { valid: boolean; reason?: FallbackReason; message?: string } => {
  const f1Str = typeof payload.field1 === 'object' ? JSON.stringify(payload.field1) : String(payload.field1 || '');
  const venueStr = typeof payload.venue === 'object' ? JSON.stringify(payload.venue) : String(payload.venue || '');
  const contextStr = typeof payload.context === 'object' ? JSON.stringify(payload.context) : String(payload.context || '');

  if (f1Str.length > payload.field1MaxLen || venueStr.length > 1000 || contextStr.length > 4000 || (f1Str.length + venueStr.length + contextStr.length) > 9000) {
    return {
      valid: false,
      reason: 'payload-too-large',
      message: 'Request payload exceeds server validation limits.'
    };
  }
  return { valid: true };
};

const REQUEST_TIMEOUT_MS = 20_000;

type ApiEndpoint = '/api/fan-assistant' | '/api/incident-support';
type ApiRequestPayload = FanAssistantRequestPayload | IncidentSupportRequestPayload;
type ResponseValidator<T> = (data: unknown) => data is T;
type ApiClientFailure = Extract<ApiClientResult<never>, { success: false }>;

interface ValidatedPostOptions<T> {
  endpoint: ApiEndpoint;
  payload: ApiRequestPayload;
  validateResponse: ResponseValidator<T>;
  abortSignal?: AbortSignal;
}

const createFailure = (reason: FallbackReason, message: string): ApiClientFailure => ({
  success: false,
  reason,
  message,
  source: 'Local deterministic fallback'
});

const isAbortError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object' || !('name' in error)) return false;
  return (error as { name: string }).name === 'AbortError';
};

const postValidatedJson = async <T>({
  endpoint,
  payload,
  validateResponse,
  abortSignal
}: ValidatedPostOptions<T>): Promise<ApiClientResult<T>> => {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let internalTimerCausedAbort = false;
  const onExternalAbort = () => controller.abort();
  let externalAbortListenerAttached = false;

  const createAbortFailure = () => createFailure(
    'timeout',
    internalTimerCausedAbort
      ? 'Request timed out after 20 seconds. Using local fallback.'
      : 'Request was cancelled. Using local fallback.'
  );

  try {
    if (abortSignal?.aborted) {
      return createAbortFailure();
    }

    if (abortSignal) {
      abortSignal.addEventListener('abort', onExternalAbort);
      externalAbortListenerAttached = true;

      if (abortSignal.aborted) {
        onExternalAbort();
        return createAbortFailure();
      }
    }

    timeoutId = setTimeout(() => {
      if (!controller.signal.aborted) {
        internalTimerCausedAbort = true;
        controller.abort();
      }
    }, REQUEST_TIMEOUT_MS);

    const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!response.ok) {
      if (response.status === 413 || response.status === 400) {
        return createFailure(
          'payload-too-large',
          'The request payload was rejected or exceeded size limits. Using local fallback.'
        );
      }
      return createFailure(
        'server',
        'Backend service returned a non-2xx response. Using local fallback.'
      );
    }

    let parsed: unknown;
    try {
      parsed = await response.json();
    } catch (error: unknown) {
      if (controller.signal.aborted || isAbortError(error)) throw error;
      return createFailure(
        'invalid-response',
        'Failed to parse JSON from response. Using local fallback.'
      );
    }

    if (controller.signal.aborted) {
      return createAbortFailure();
    }

    if (!validateResponse(parsed)) {
      return createFailure(
        'invalid-response',
        'Response did not match expected schema. Using local fallback.'
      );
    }

    return {
      success: true,
      data: parsed,
      source: 'Vertex AI via Cloud Run'
    };
  } catch (error: unknown) {
    if (controller.signal.aborted || isAbortError(error)) {
      return createAbortFailure();
    }

    return createFailure(
      'network',
      'Network error or connection failure. Using local fallback.'
    );
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    if (abortSignal && externalAbortListenerAttached) {
      abortSignal.removeEventListener('abort', onExternalAbort);
    }
  }
};

/**
 * Sends a query to the Fan Assistant endpoint with a 20s timeout and safe fallback handling.
 */
export const postFanAssistant = async (
  userQuery: string,
  venue: VenueData,
  abortSignal?: AbortSignal
): Promise<ApiClientResult<FanAssistantApiResponse>> => {
  const compactVenue = buildCompactVenue(venue);
  const compactContext = buildCompactContext(venue);

  const limitCheck = validatePayloadLimits({
    field1: userQuery,
    field1MaxLen: 500,
    venue: compactVenue,
    context: compactContext
  });

  if (!limitCheck.valid) {
    return {
      success: false,
      reason: limitCheck.reason || 'payload-too-large',
      message: limitCheck.message || 'Payload too large',
      source: 'Local deterministic fallback'
    };
  }

  const payload: FanAssistantRequestPayload = {
    userQuery,
    venue: compactVenue,
    simulatedVenueContext: compactContext
  };

  return postValidatedJson<FanAssistantApiResponse>({
    endpoint: '/api/fan-assistant',
    payload,
    validateResponse: isValidFanAssistantResponse,
    abortSignal
  });
};

/**
 * Sends an incident report to the Incident Support endpoint with a 20s timeout and safe fallback handling.
 */
export const postIncidentSupport = async (
  incident: IncidentData,
  venue: VenueData,
  abortSignal?: AbortSignal
): Promise<ApiClientResult<IncidentSupportApiResponse>> => {
  const compactIncident = buildCompactIncident(incident);
  const compactVenue = buildCompactVenue(venue);
  const compactContext = buildCompactContext(venue);

  const limitCheck = validatePayloadLimits({
    field1: compactIncident,
    field1MaxLen: 1000,
    venue: compactVenue,
    context: compactContext
  });

  if (!limitCheck.valid) {
    return {
      success: false,
      reason: limitCheck.reason || 'payload-too-large',
      message: limitCheck.message || 'Payload too large',
      source: 'Local deterministic fallback'
    };
  }

  const payload: IncidentSupportRequestPayload = {
    incident: compactIncident,
    venue: compactVenue,
    simulatedVenueContext: compactContext
  };

  return postValidatedJson<IncidentSupportApiResponse>({
    endpoint: '/api/incident-support',
    payload,
    validateResponse: isValidIncidentSupportResponse,
    abortSignal
  });
};
