# Security Policy & Safeguards

This document explains the security architecture of **Matchday Command**, addressing the **Security (MEDIUM impact)** evaluation priority.

---

## 1. API Key & Secret Management

- **Zero Client-Side Secrets:** No Google Gemini API keys, Firebase configuration parameters, or development secrets are hardcoded in the frontend React application.
- **Server-Side Mediation:** To prevent exposure and abuse, the Gemini API is accessed *strictly server-side* within a protected Google Cloud Run microservice environment.
- **Secret Manager Integration:** API keys are stored and injected via Google Cloud Secret Manager at runtime, adhering to the principle of least privilege.

---

## 2. Authentication & Data Protection

- **No Auth / No Database for MVP:** To reduce attack surface and keep the codebase lightweight under the 10 MB limit, this prototype uses local, read-only simulated venue data.
- **Data Privacy:** Because there are no database reads/writes and no user login portals, user metadata is never captured, stored, or transmitted.
- **Simulated Context:** All maps, incidents, routes, and queue data are simulated prototype representations. No real-world fan names, PII (Personally Identifiable Information), or emergency dispatch vectors are integrated.

---

## 3. Brand Protection & Intellectual Property

To comply with tournament guidelines and prevent trademark infringements:
- **No Official Brand Assets:** No official tournament logos, trophies, official mascots, emblems, or trademarked visual assets are hosted in this repository.
- **Clear Demarcation:** The user interface features a persistent notice labeling the application as a simulated prototype.
- **Asset Weight:** All custom vector icons and styling variables are local and lightweight.
