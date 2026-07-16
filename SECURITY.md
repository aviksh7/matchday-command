# Security and privacy

This document describes the implemented security and privacy boundaries of Matchday Command. For the complete product and architecture overview, see [README.md](README.md).

## Server-side Vertex AI authentication

- The React frontend contains no AI credential, Google Cloud runtime credential, or secret.
- The Cloud Run Node.js API authenticates to Vertex AI through its attached dedicated runtime service account and Application Default Credentials (ADC).
- The runtime service account has the Vertex AI permissions required by the deployed service. No downloadable runtime service-account key is used.
- `GOOGLE_CLOUD_PROJECT` is explicitly supplied through deployment configuration. ADC provides authentication credentials; it does not populate that environment variable.
- The former Gemini API-key integration and its legacy Secret Manager secret were deleted. Production does not use either path.

## Request boundary and safeguards

Firebase Hosting serves the browser application and routes same-origin `/api/**` requests to Cloud Run. For direct browser requests, the API uses an exact origin allowlist for local development and the two Firebase Hosting domains. CORS is a browser-origin policy, not user authentication.

The API implements:

- a 10 KB JSON request-body limit;
- maximum lengths for user query, incident, venue, and simulated-context fields;
- rejection of a small set of obvious prompt-injection patterns;
- a basic in-memory rate limit of 30 non-health requests per minute per observed client address and container instance;
- structured response-schema checks on the server and again in the browser;
- generic JSON error responses that do not expose model errors, credentials, stack traces, or internal configuration.

The in-memory rate limiter is basic abuse and cost protection. It is not distributed across Cloud Run instances and should not be described as a complete abuse-prevention system.

## Data handling and user responsibility

- The application has no user authentication or application database.
- The application does not intentionally write user queries or generated responses to an application database.
- Queries submitted to cloud AI features are processed by Cloud Run and Vertex AI.
- Google Cloud services may create operational logs according to the project's service and logging configuration. This project does not claim guaranteed zero retention or zero logging outside its own application storage behavior.
- Users must not submit personal, confidential, medical, or emergency information.
- A failed, timed-out, rejected, or invalid cloud response causes the browser to use deterministic local fallback logic. That fallback runs in the browser and does not create a second cloud processing path.

## Prototype and operational boundary

All venue, crowd, incident, accessibility, transit, route, and queue inputs are simulated. The application has no access to official FIFA, tournament, venue, ticketing, public-address, transit, municipal, medical, security, or emergency systems. Matchday Command is an independent prototype and is not affiliated with FIFA or venue operators.

Generated incident actions, volunteer briefings, and announcement text are prototype drafts requiring qualified human review. They must not replace trained venue, security, medical, or emergency personnel.
