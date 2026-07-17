import React from 'react';
import type { KeyboardEvent } from 'react';
import type { VenueData } from '../types';
import {
  ACCESSIBILITY_ROUTES,
  DISTRICT_GEOMETRY,
  GATE_GEOMETRY,
  INCIDENT_GEOMETRY,
  STADIUM_VIEWBOX,
  TRANSIT_GEOMETRY,
} from '../data/stadiumGeometry';
import { PRESSURE_THRESHOLDS } from '../logic/operations';
import Icon from './Icon';

export type MapFeatureKind = 'district' | 'gate' | 'transit' | 'incident';

export interface MapSelection {
  kind: MapFeatureKind;
  id: string;
}

interface StadiumMapProps {
  venue: VenueData;
  selection: MapSelection | null;
  onSelect: (selection: MapSelection | null) => void;
}

const isSelected = (selection: MapSelection | null, kind: MapFeatureKind, id: string) => (
  selection?.kind === kind && selection.id === id
);

const transitIconLabel = (type: string) => {
  if (type.includes('Train')) return 'TRN';
  if (type.includes('Bus')) return 'BUS';
  if (type.includes('Ride')) return 'CAR';
  return 'P+R';
};

export const StadiumMap: React.FC<StadiumMapProps> = ({ venue, selection, onSelect }) => {
  const accessibleGateIndex = venue.gates.findIndex(gate => gate.isOpen && gate.accessibleReady);

  const selectWithKeyboard = (event: KeyboardEvent<SVGGElement>, feature: MapSelection) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(feature);
    }
  };

  return (
    <figure className="stadium-map">
      <div
        className="stadium-map__canvas"
        onKeyDown={(event) => {
          if (event.key === 'Escape' && selection) {
            event.preventDefault();
            onSelect(null);
          }
        }}
      >
        <svg
          viewBox={STADIUM_VIEWBOX}
          role="img"
          aria-labelledby="map-title map-desc"
          preserveAspectRatio="xMidYMid meet"
        >
          <title id="map-title">Simulated Stadium Crowd Density Map</title>
          <desc id="map-desc">Interactive prototype map with four crowd districts, gates, transit nodes, accessible routing and incident markers. Use Tab to move between features, Enter or Space to select, and Escape to clear.</desc>

          <g className="map-base" aria-hidden="true">
            <path className="map-road map-road--outer" d="M150 90 C305 22 655 22 810 90 C910 135 930 545 810 600 C655 668 305 668 150 600 C30 545 50 135 150 90Z" />
            <path className="map-road" d="M205 130 C330 72 630 72 755 130 C845 172 860 508 755 550 C630 608 330 608 205 550 C100 508 115 172 205 130Z" />
            <path className="map-bowl-outline" d="M285 170 C380 112 580 112 675 170 C755 240 755 440 675 510 C580 568 380 568 285 510 C205 440 205 240 285 170Z" />

            {venue.transitStatus.map((transit, index) => {
              const point = TRANSIT_GEOMETRY[index % TRANSIT_GEOMETRY.length];
              const gatePoint = GATE_GEOMETRY[index % GATE_GEOMETRY.length];
              return (
                <path
                  key={`route-${transit.id}`}
                  className="map-transit-route"
                  d={`M${point.x} ${point.y} Q${(point.x + gatePoint.x) / 2} ${(point.y + gatePoint.y) / 2 - 24} ${gatePoint.x} ${gatePoint.y}`}
                />
              );
            })}

            {accessibleGateIndex >= 0 && (
              <>
                <path className="map-accessibility-route map-accessibility-route--underlay" d={ACCESSIBILITY_ROUTES[accessibleGateIndex] ?? ACCESSIBILITY_ROUTES[0]} />
                <path className="map-accessibility-route" d={ACCESSIBILITY_ROUTES[accessibleGateIndex] ?? ACCESSIBILITY_ROUTES[0]} />
              </>
            )}
          </g>

          <g className={`map-districts ${selection ? 'map-districts--has-selection' : ''}`}>
            {DISTRICT_GEOMETRY.map((geometry) => {
              const zone = venue.zones[geometry.dataIndex];
              if (!zone) return null;
              const feature: MapSelection = { kind: 'district', id: zone.id };
              const selected = isSelected(selection, feature.kind, feature.id);
              return (
                <g
                  key={zone.id}
                  className={`map-feature map-district map-density--${zone.density.toLowerCase()} ${selected ? 'map-feature--selected' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${zone.name} district, ${zone.density} density, ${zone.occupancyPercentage}% simulated occupancy`}
                  aria-pressed={selected}
                  onClick={() => onSelect(feature)}
                  onKeyDown={(event) => selectWithKeyboard(event, feature)}
                >
                  <path className="map-district__shape" d={geometry.path} />
                  <path className="map-district__focus" d={geometry.path} />
                  <text className="map-district__label" x={geometry.labelX} y={geometry.labelY} textAnchor="middle">
                    <tspan>{zone.name}</tspan>
                    <tspan x={geometry.labelX} dy="17">{zone.occupancyPercentage}% · {zone.density}</tspan>
                  </text>
                </g>
              );
            })}
          </g>

          <g className="map-pitch" aria-hidden="true">
            <rect x="390" y="275" width="180" height="130" rx="4" />
            <line x1="480" y1="275" x2="480" y2="405" />
            <circle cx="480" cy="340" r="22" />
            <rect x="390" y="310" width="28" height="60" />
            <rect x="542" y="310" width="28" height="60" />
            <text x="480" y="425" textAnchor="middle">SIMULATED PITCH</text>
          </g>

          <g className="map-gates">
            {venue.gates.map((gate, index) => {
              const point = GATE_GEOMETRY[index % GATE_GEOMETRY.length];
              const feature: MapSelection = { kind: 'gate', id: gate.id };
              const selected = isSelected(selection, feature.kind, feature.id);
              const pressureClass = !gate.isOpen
                ? 'closed'
                : gate.percentage >= PRESSURE_THRESHOLDS.CRITICAL
                  ? 'high'
                  : gate.percentage >= PRESSURE_THRESHOLDS.ELEVATED
                    ? 'medium'
                    : 'low';
              return (
                <g
                  key={gate.id}
                  className={`map-feature map-node map-gate map-gate--${pressureClass} ${selected ? 'map-feature--selected' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${gate.name} gate, ${gate.isOpen ? 'open' : 'closed'}, ${gate.percentage}% simulated pressure${gate.accessibleReady ? ', accessibility ready' : ''}`}
                  aria-pressed={selected}
                  onClick={() => onSelect(feature)}
                  onKeyDown={(event) => selectWithKeyboard(event, feature)}
                >
                  <circle className="map-hit-target" cx={point.x} cy={point.y} r="58" />
                  <circle className="map-node__focus" cx={point.x} cy={point.y} r="23" />
                  <rect className="map-gate__marker" x={point.x - 15} y={point.y - 15} width="30" height="30" rx="7" />
                  <text className="map-gate__letter" x={point.x} y={point.y + 4} textAnchor="middle">{String.fromCharCode(65 + index)}</text>
                  {gate.accessibleReady && <circle className="map-gate__accessible" cx={point.x + 13} cy={point.y - 13} r="5" />}
                  <text className="map-node__label" x={point.labelX} y={point.labelY} textAnchor={point.anchor}>
                    <tspan>{gate.name}</tspan>
                    <tspan x={point.labelX} dy="15">{gate.isOpen ? `${gate.percentage}% pressure` : 'Closed'}</tspan>
                  </text>
                </g>
              );
            })}
          </g>

          <g className="map-transit-nodes">
            {venue.transitStatus.map((transit, index) => {
              const point = TRANSIT_GEOMETRY[index % TRANSIT_GEOMETRY.length];
              const feature: MapSelection = { kind: 'transit', id: transit.id };
              const selected = isSelected(selection, feature.kind, feature.id);
              return (
                <g
                  key={transit.id}
                  className={`map-feature map-node map-transit map-load--${transit.loadLevel.toLowerCase()} ${selected ? 'map-feature--selected' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${transit.type} transit node, ${transit.loadLevel} simulated load, ${transit.crowdPressurePercentage}% pressure`}
                  aria-pressed={selected}
                  onClick={() => onSelect(feature)}
                  onKeyDown={(event) => selectWithKeyboard(event, feature)}
                >
                  <circle className="map-hit-target" cx={point.x} cy={point.y} r="58" />
                  <circle className="map-node__focus" cx={point.x} cy={point.y} r="23" />
                  <circle className="map-transit__marker" cx={point.x} cy={point.y} r="16" />
                  <text className="map-transit__code" x={point.x} y={point.y + 4} textAnchor="middle">{transitIconLabel(transit.type)}</text>
                  <text className="map-node__label" x={point.labelX} y={point.labelY} textAnchor={point.anchor}>
                    <tspan>{transit.type}</tspan>
                    <tspan x={point.labelX} dy="15">{transit.loadLevel} · {transit.crowdPressurePercentage}%</tspan>
                  </text>
                </g>
              );
            })}
          </g>

          <g className="map-incidents">
            {venue.incidents.map((incident, index) => {
              const point = INCIDENT_GEOMETRY[index % INCIDENT_GEOMETRY.length];
              const feature: MapSelection = { kind: 'incident', id: incident.id };
              const selected = isSelected(selection, feature.kind, feature.id);
              return (
                <g
                  key={incident.id}
                  className={`map-feature map-node map-incident map-incident--${incident.severity.toLowerCase()} ${incident.status !== 'Resolved' ? 'map-incident--alert' : ''} ${selected ? 'map-feature--selected' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Incident ${incident.id}, ${incident.type}, ${incident.severity} severity, ${incident.status}`}
                  aria-pressed={selected}
                  onClick={() => onSelect(feature)}
                  onKeyDown={(event) => selectWithKeyboard(event, feature)}
                >
                  <circle className="map-hit-target" cx={point.x} cy={point.y} r="58" />
                  <circle className="map-node__focus" cx={point.x} cy={point.y} r="23" />
                  {incident.status !== 'Resolved' && <circle className="map-incident__pulse" cx={point.x} cy={point.y} r="20" />}
                  <path className="map-incident__marker" d={`M${point.x} ${point.y - 16} L${point.x + 16} ${point.y + 14} L${point.x - 16} ${point.y + 14} Z`} />
                  <text className="map-incident__symbol" x={point.x} y={point.y + 7} textAnchor="middle">!</text>
                  <text className="map-node__label" x={point.labelX} y={point.labelY} textAnchor={point.anchor}>
                    <tspan>{incident.id}</tspan>
                    <tspan x={point.labelX} dy="15">{incident.type}</tspan>
                  </text>
                </g>
              );
            })}
          </g>

          <g className="map-orientation" aria-hidden="true">
            <path d="M905 190v-42" />
            <path d="m897 158 8-10 8 10" />
            <text x="905" y="135" textAnchor="middle">N</text>
          </g>
        </svg>
      </div>

      <figcaption className="map-legend">
        <span className="map-legend__title">Map legend</span>
        <span><i className="legend-swatch legend-swatch--low" />Low Occupancy (Normal)</span>
        <span><i className="legend-swatch legend-swatch--medium" />Medium Occupancy</span>
        <span><i className="legend-swatch legend-swatch--high" />High Occupancy</span>
        <span><i className="legend-swatch legend-swatch--critical" />Critical Occupancy</span>
        <span><i className="legend-line legend-line--accessible" />Accessible route</span>
        <span><Icon name="incident" size={14} />Incident</span>
      </figcaption>
    </figure>
  );
};

export default StadiumMap;
