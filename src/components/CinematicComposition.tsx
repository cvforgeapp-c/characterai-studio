import { useMemo } from "react";
import * as THREE from "three";

export type CompositionMode =
| "auto"
| "single"
| "dialogue"
| "triangle"
| "group"
| "dramatic";

export interface CharacterPlacement {
id: string;
position: [number, number, number];
rotation: [number, number, number];
scale: number;
}

export interface CompositionResult {
placements: CharacterPlacement[];
cameraTarget: [number, number, number];
cameraDistance: number;
}

interface Props {
characterIds: string[];
mode?: CompositionMode;
spacing?: number;
depth?: number;
}

export function calculateComposition({
characterIds,
mode = "auto",
spacing = 2.3,
depth = 1.5,
}: Props): CompositionResult {
const count = characterIds.length;

if (count === 0) {
return {
placements: [],
cameraTarget: [0, 1, 0],
cameraDistance: 7,
};
}

const selectedMode =
mode === "auto"
? count === 1
? "single"
: count === 2
? "dialogue"
: count === 3
? "triangle"
: "group"
: mode;

const placements: CharacterPlacement[] =
characterIds.map((id, index) => {
let x = 0;
let y = 0;
let z = 0;
let rotationY = 0;
let scale = 1;

  if (selectedMode === "single") {
    x = 0;
  }

  if (selectedMode === "dialogue") {
    x = index === 0 ? -spacing / 2 : spacing / 2;
    rotationY = index === 0 ? 0.15 : -0.15;
  }

  if (selectedMode === "triangle") {
    const positions: [number, number, number][] = [
      [-spacing, 0, 0],
      [spacing, 0, 0],
      [0, 0, -depth],
    ];

    [x, y, z] = positions[index % 3];
    rotationY = index === 0 ? 0.18 : index === 1 ? -0.18 : 0;
  }

  if (selectedMode === "group") {
    const columns = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / columns);

    const column = index % columns;
    const row = Math.floor(index / columns);

    x = (column - (columns - 1) / 2) * spacing;
    z = -row * depth;

    scale = count > 5 ? 0.85 : 1;
  }

  if (selectedMode === "dramatic") {
    const center = (count - 1) / 2;

    x = (index - center) * spacing * 0.85;
    z = index === Math.floor(center) ? 0.5 : -depth * 0.35;
    scale = index === Math.floor(center) ? 1.12 : 0.92;
    rotationY = (center - index) * 0.12;
  }

  return {
    id,
    position: [x, y, z],
    rotation: [0, rotationY, 0],
    scale,
  };
});

const minX = Math.min(...placements.map((p) => p.position[0]));
const maxX = Math.max(...placements.map((p) => p.position[0]));

const minZ = Math.min(...placements.map((p) => p.position[2]));
const maxZ = Math.max(...placements.map((p) => p.position[2]));

const centerX = (minX + maxX) / 2;
const centerZ = (minZ + maxZ) / 2;

const width = maxX - minX;
const depthSize = maxZ - minZ;

return {
placements,
cameraTarget: [centerX, 1.1, centerZ],
cameraDistance: Math.max(5, 4.5 + width * 0.75 + depthSize * 0.4),
};
}

export default function CinematicCompositionPreview({
characterIds,
mode = "auto",
spacing = 2.3,
depth = 1.5,
}: Props) {
const result = useMemo(
() =>
calculateComposition({
characterIds,
mode,
spacing,
depth,
}),
[characterIds, mode, spacing, depth]
);

return null;
}

export function getCompositionTarget(
result: CompositionResult
): THREE.Vector3 {
return new THREE.Vector3(...result.cameraTarget);
}
