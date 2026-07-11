# Security Policy & Safeguards

This document explains the security architecture of **Matchday Command**, addressing the **Security (MEDIUM impact)** evaluation priority.

---

## 1. Cloud Authentication & API Access

- **Zero Client-Side Secrets:** No Google Gemini API keys, Google Cloud credentials, or development secrets are exposed or hardcoded in the frontend React application.
- **Server-Side Mediation:** The backend API is hosted in a protected Google Cloud Run microservice environment.
- **Vertex AI IAM Authentication:** In production, the Cloud Run backend uses Application Default Credentials (ADC) to authenticate with the Vertex AI API. No static API keys or Secret Manager secrets are required or delivered to the container.
- **Least Privilege Service Account:** The Cloud Run service runs under a dedicated service account identity:
  `matchday-command-api@matchday-command-2026.iam.gserviceaccount.com`
  which has been granted the `roles/aiplatform.user` IAM role. The old `GEMINI_API_KEY` Secret Manager secret is no longer used by this service and will be permanently deleted after validation of the Vertex AI deployment.

---

## 2. Authentication & Data Protection

- **No Auth / No Database for MVP:** To reduce attack surface and keep the codebase lightweight under the 10 MB limit, this prototype uses local, read-only simulated venue data.
- **Data Privacy:** Because there are no database reads/writes and no user login portals, user metadata is never captured, stored, or transmitted.
- **Simulated Context:** All maps, incidents, routes, and queue data are simulated prototype representations. No real-world fan names, PII (Personally Identifiable Information), or emergency dispatch vectors are integrated.
- **Abuse & Rate Limiting:** A lightweight, in-memory rate limiter is configured per-container instance. This provides basic request rate throttling for development and cost control, but does not use a distributed store (e.g. Redis) and is limited to per-instance container memory.

---

## 3. Brand Protection & Intellectual Property

To comply with tournament guidelines and prevent trademark infringements:
- **No Official Brand Assets:** No official tournament logos, trophies, official mascots, emblems, or trademarked visual assets are hosted in this repository.
- **Clear Demarcation:** The user interface features a persistent notice labeling the application as a simulated prototype.
- **Asset Weight:** All custom vector icons and styling variables are local and lightweight.
