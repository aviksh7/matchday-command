# Matchday Command — design direction

This document preserves the original design intent and records how it was implemented.

## Original concept

The project began as a “living matchday operations map”: an immersive stadium surface supported by contextual panels instead of a generic administrative dashboard.

The intended qualities were:

- modern structure with high visual clarity;
- friendly energy suitable for fans and professional restraint suitable for operations;
- strong typography and a memorable stadium-map centerpiece;
- contextual information panels and meaningful motion;
- deep navy, warm paper, cyan navigation/AI accents, green normal states, and restrained amber/red warnings;
- no official tournament branding, generic purple AI gradients, excessive glass effects, random animation, or schedule-risking 3D complexity.

## Implemented Floodlit result

The delivered system is called **Floodlit** and is summarized as:

> **Operate on Night. Read on Paper.**

- **Night** surfaces use deep stadium tones, floodlight cyan, spatial context, and higher visual energy for the home experience, schematic map, and fan guidance workspace.
- **Paper** surfaces use warm off-white, ink-like text, clear rules, and restrained density for operational tables, incident drafts, project details, and information that benefits from careful reading.
- Both surfaces share Archivo display/body typography, IBM Plex Mono metadata, semantic color tokens, visible focus treatment, responsive spacing, and reduced-motion behavior.

The phrase describes the visual rhythm rather than a rigid mapping between user roles and colors: operational context can appear on Night, while dense operational detail is intentionally presented on Paper.

## Implemented map direction

- A custom schematic stadium/city map is the primary visual anchor.
- Districts, gates, simulated transit nodes, accessibility routes, and incidents share a consistent geometry and legend.
- Pointer and keyboard selection opens a focused context panel.
- The map is explicitly labeled simulated and geographically inaccurate.

## Scope changes preserved from the original plan

- The original deadline sequence drove the order of implementation: design system and map first, supporting pages next, then responsive/accessibility and documentation work.
- Continuously changing telemetry was postponed. The implemented product uses a selected simulated venue snapshot to keep behavior deterministic and claims honest.
- Supporting Staff Command and Incident Support pages retain some denser legacy layout patterns while inheriting the Floodlit tokens. A wholesale redesign is outside Milestone 1B.
- Motion remains restrained and respects `prefers-reduced-motion`.

## Continuing rule

Future visual work should strengthen the Night/Paper relationship, protect readability under pressure, preserve visible simulation warnings, and avoid implying official or externally connected systems.
