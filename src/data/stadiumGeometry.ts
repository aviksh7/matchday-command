export interface DistrictGeometry {
  position: 'north' | 'south' | 'east' | 'west';
  dataIndex: number;
  path: string;
  labelX: number;
  labelY: number;
}

export interface PointGeometry {
  x: number;
  y: number;
  labelX: number;
  labelY: number;
  anchor: 'start' | 'middle' | 'end';
}

export const STADIUM_VIEWBOX = '0 0 960 680';

export const DISTRICT_GEOMETRY: DistrictGeometry[] = [
  { position: 'north', dataIndex: 0, path: 'M285 170 C380 120 580 120 675 170 L610 245 C540 210 420 210 350 245 Z', labelX: 480, labelY: 176 },
  { position: 'south', dataIndex: 1, path: 'M675 510 C580 560 380 560 285 510 L350 435 C420 470 540 470 610 435 Z', labelX: 480, labelY: 515 },
  { position: 'east', dataIndex: 2, path: 'M675 170 C745 235 745 445 675 510 L610 435 C645 385 645 295 610 245 Z', labelX: 686, labelY: 338 },
  { position: 'west', dataIndex: 3, path: 'M285 510 C215 445 215 235 285 170 L350 245 C315 295 315 385 350 435 Z', labelX: 274, labelY: 338 },
];

export const GATE_GEOMETRY: PointGeometry[] = [
  { x: 480, y: 88, labelX: 480, labelY: 55, anchor: 'middle' },
  { x: 480, y: 592, labelX: 480, labelY: 632, anchor: 'middle' },
  { x: 807, y: 340, labelX: 850, labelY: 344, anchor: 'start' },
  { x: 153, y: 340, labelX: 110, labelY: 344, anchor: 'end' },
];

export const TRANSIT_GEOMETRY: PointGeometry[] = [
  { x: 105, y: 120, labelX: 105, labelY: 84, anchor: 'middle' },
  { x: 855, y: 120, labelX: 855, labelY: 84, anchor: 'middle' },
  { x: 855, y: 560, labelX: 855, labelY: 606, anchor: 'middle' },
  { x: 105, y: 560, labelX: 105, labelY: 606, anchor: 'middle' },
];

export const INCIDENT_GEOMETRY: PointGeometry[] = [
  { x: 372, y: 224, labelX: 372, labelY: 190, anchor: 'middle' },
  { x: 624, y: 416, labelX: 658, labelY: 420, anchor: 'start' },
  { x: 340, y: 452, labelX: 306, labelY: 456, anchor: 'end' },
];

export const ACCESSIBILITY_ROUTES = [
  'M480 88 L480 215 L390 275',
  'M480 592 L480 465 L570 405',
  'M807 340 L645 340 L570 340',
  'M153 340 L315 340 L390 340',
];
