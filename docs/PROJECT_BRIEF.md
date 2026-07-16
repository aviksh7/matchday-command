# Project brief: Matchday Command

## Overview

Matchday Command is an independent simulated stadium operations and fan-guidance prototype for high-pressure tournament match days. It explores how one selected simulated venue snapshot can support both readable fan guidance and prototype operations decision support.

- **Project name:** Matchday Command
- **Tagline:** GenAI stadium operations and fan guidance for high-pressure tournament match days.
- **Live application:** <https://matchday-command-2026.web.app>
- **Public repository:** <https://github.com/aviksh7/matchday-command>

## Product perspectives

### Fan Mode

Fan Mode provides guidance about simulated gate pressure, service wait times, accessibility-ready entrances, transit-node pressure/status, and sustainability. It also includes a limited translation demonstration. It does not provide real routing, official accessibility information, transit schedules, or guaranteed translation.

### Operations Mode

Operations Mode displays simulated gate, crowd, staffing, accessibility, incident, transit-pressure, and sustainability information. Incident Support produces structured prototype drafts through Vertex AI via Cloud Run or deterministic local fallback. Drafts require human review and do not dispatch staff or connect to operational systems.

## Implemented result

The React frontend is deployed on Firebase Hosting. Same-origin `/api/**` requests are routed to a Cloud Run Node.js API, which authenticates to Vertex AI with its attached service account and ADC. Both AI flows expose their response source and retain simulation limitations. Full architecture and evaluator evidence are maintained in [../README.md](../README.md).

## Prototype boundary

All map, venue, crowd, incident, route, transit, and wait-time inputs are local simulated data. No official FIFA, tournament, venue, ticketing, transit, municipal, public-address, medical, security, or emergency systems are connected. Matchday Command is not affiliated with FIFA or venue operators.
