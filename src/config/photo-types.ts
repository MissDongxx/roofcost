/**
 * Photo types for roof inspection checklist
 * 12 types covering all essential roof components
 */

export interface PhotoType {
  id: string;
  name: string;
  description: string;
  instructions: string;
  order: number;
}

export const PHOTO_TYPES: readonly PhotoType[] = [
  {
    id: 'north_elevation',
    name: 'North Elevation',
    description: 'Full north side view of the roof',
    instructions: 'Stand back to capture the entire north face of the roof. Include the roof-to-wall intersection.',
    order: 1,
  },
  {
    id: 'south_elevation',
    name: 'South Elevation',
    description: 'Full south side view of the roof',
    instructions: 'Stand back to capture the entire south face of the roof. Include the roof-to-wall intersection.',
    order: 2,
  },
  {
    id: 'east_elevation',
    name: 'East Elevation',
    description: 'Full east side view of the roof',
    instructions: 'Stand back to capture the entire east face of the roof. Include the roof-to-wall intersection.',
    order: 3,
  },
  {
    id: 'west_elevation',
    name: 'West Elevation',
    description: 'Full west side view of the roof',
    instructions: 'Stand back to capture the entire west face of the roof. Include the roof-to-wall intersection.',
    order: 4,
  },
  {
    id: 'roof_plane_north',
    name: 'North Roof Plane',
    description: 'Close-up of north-facing roof surface',
    instructions: 'Get a closer view of the north roof surface. Focus on shingles, tiles, or metal panels.',
    order: 5,
  },
  {
    id: 'roof_plane_south',
    name: 'South Roof Plane',
    description: 'Close-up of south-facing roof surface',
    instructions: 'Get a closer view of the south roof surface. Focus on shingles, tiles, or metal panels.',
    order: 6,
  },
  {
    id: 'roof_plane_east',
    name: 'East Roof Plane',
    description: 'Close-up of east-facing roof surface',
    instructions: 'Get a closer view of the east roof surface. Focus on shingles, tiles, or metal panels.',
    order: 7,
  },
  {
    id: 'roof_plane_west',
    name: 'West Roof Plane',
    description: 'Close-up of west-facing roof surface',
    instructions: 'Get a closer view of the west roof surface. Focus on shingles, tiles, or metal panels.',
    order: 8,
  },
  {
    id: 'flashing_chimney',
    name: 'Chimney Flashing',
    description: 'Flashing around chimney penetrations',
    instructions: 'Capture the metal flashing where the chimney meets the roof. Look for rust, gaps, or damage.',
    order: 9,
  },
  {
    id: 'flashing_valley',
    name: 'Valley Flashing',
    description: 'Flashing in roof valleys',
    instructions: 'Photograph the valley where two roof planes meet. Check for proper flashing and damage.',
    order: 10,
  },
  {
    id: 'flashing_wall',
    name: 'Wall/Ridge Flashing',
    description: 'Flashing at wall or roof intersections',
    instructions: 'Capture areas where the roof meets a vertical wall or ridge. Look for proper sealing.',
    order: 11,
  },
  {
    id: 'penetration_vents',
    name: 'Vent Penetrations',
    description: 'Roof vents and pipe penetrations',
    instructions: 'Photograph all vents, pipes, and other penetrations. Check the flashing around each.',
    order: 12,
  },
] as const;

export type PhotoTypeId = typeof PHOTO_TYPES[number]['id'];

export function getPhotoTypeById(id: string): PhotoType | undefined {
  return PHOTO_TYPES.find((type) => type.id === id);
}

export function getPhotoTypesOrdered(): PhotoType[] {
  return [...PHOTO_TYPES].sort((a, b) => a.order - b.order);
}
