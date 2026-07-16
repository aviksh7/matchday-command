# Accessibility implementation and limitations

This document records accessibility measures currently implemented in Matchday Command. It is not a formal WCAG certification. See [README.md](README.md) for product scope and evaluator evidence.

## Semantic structure and navigation

- The application shell uses semantic `header`, labeled `nav`, `main`, and `footer` landmarks.
- Pages use headings, sections, articles, asides, labels, lists, tables, and native form controls to communicate structure.
- The active primary-navigation item uses `aria-current="page"`, and the mobile menu exposes its expanded state and controlled navigation region.
- Simulation notices use status or alert semantics where immediate context is important.

## Keyboard operation and focus

- Buttons, links, inputs, and selects retain native keyboard behavior.
- A global `:focus-visible` rule provides a high-visibility outline without removing browser focus behavior.
- The schematic stadium map exposes districts, gates, transit nodes, and incidents as focusable controls.
- Map features support Enter and Space selection. Escape clears the current selection.
- The map includes an accessible title, description, feature labels, pressed state, and on-page keyboard instructions.

## Dynamic and request states

- Fan Assistant and Incident Support expose loading messages through polite status announcements.
- The map context panel uses a polite live region when the selected feature changes.
- Inputs and relevant actions use native `disabled` states while an AI request is pending, preventing duplicate requests and communicating temporary unavailability.
- AI result cards show their source and retain a visible limitations notice.

## Contrast, status, and motion

- The Floodlit design system defines separate Night and Paper palettes with semantic cyan, green, amber, and red tokens.
- Status information is presented with text, percentages, labels, icons, or shapes in addition to color.
- Visible focus uses a dedicated cyan outline with offset.
- `prefers-reduced-motion: reduce` shortens animations and transitions and disables smooth scrolling behavior.

## Responsive behavior

- The application supports a 320 px minimum viewport, fluid content padding, responsive grids, and a collapsible primary navigation.
- Dense layouts collapse to a single column on smaller screens.
- Tables can scroll horizontally within their own content area rather than forcing page-level overflow.
- Project Details uses the same responsive Floodlit tokens and preserves descriptive link text and keyboard focus at narrow widths.

## Current limitations

- No independent accessibility audit or formal WCAG conformance assessment has been completed.
- Automated tests cover selected semantic, keyboard, loading, disabled-state, and content behaviors; they do not reproduce every screen reader, browser, zoom, contrast, or input-device combination.
- The stadium map is a schematic prototype, not an accessible real-world navigation service.
- Accessibility-ready gate and route information is simulated and must not be treated as verified venue information.
- The limited translation demonstration is not a substitute for professional translation or localized emergency communication.
