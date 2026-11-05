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
center: [number, number, number];
cameraTarget: [number, number, number];
cameraDistance: number;
}

interface CompositionOptions {
characterIds: string[];
mode?: CompositionMode;
spacing?: number;
depth?: number;
}

const clamp = (
value: number,
min: number,
max: number
) => Math.max(min, Math.min(max, value));

const uniqueIds = (ids: string[]) =>
[...new Set(ids.filter(Boolean))];

function facePosition(
position: [number, number, number],
target: [number, number, number]
): [number, number, number] {
const dx = target[0] - position[0];
const dz = target[2] - position[2];

return [
0,
Math.atan2(dx, dz),
0,
];
}

function createPlacement(
id: string,
position: [number, number, number],
rotation: [number, number, number],
scale = 1
): CharacterPlacement {
return {
id,
position,
rotation,
scale,
};
}

/* ---------------------------------------
SINGLE CHARACTER
--------------------------------------- */

function createSingle(
ids: string[]
): CharacterPlacement[] {
return ids.map((id, index) =>
createPlacement(
id,
[0, 0, index * 0.05],
[0, 0, 0],
1
)
);
}

/* ---------------------------------------
NATURAL TWO-PERSON DIALOGUE
--------------------------------------- */

function createDialogue(
ids: string[],
spacing: number,
depth: number
): CharacterPlacement[] {
if (ids.length === 1) {
return createSingle(ids);
}

const positions: Array<
[number, number, number]

«= [];»

if (ids.length === 2) {
positions.push(
[-spacing / 2, 0, depth * 0.12],
[spacing / 2, 0, -depth * 0.12]
);
} else {
positions.push(
[-spacing / 2, 0, depth * 0.2],
[spacing / 2, 0, -depth * 0.2]
);

for (let i = 2; i < ids.length; i++) {
  const row = Math.floor((i - 2) / 3);
  const column = (i - 2) % 3;

  positions.push([
    (column - 1) * spacing * 0.8,
    0,
    -depth * (0.8 + row * 0.65),
  ]);
}

}

const center: [number, number, number] = [
0,
0,
-depth * 0.05,
];

return ids.map((id, index) => {
const position = positions[index];

return createPlacement(
  id,
  position,
  facePosition(position, center)
);

});
}

/* ---------------------------------------
TRIANGLE CINEMATIC COMPOSITION
--------------------------------------- */

function createTriangle(
ids: string[],
spacing: number,
depth: number
): CharacterPlacement[] {
if (ids.length <= 2) {
return createDialogue(ids, spacing, depth);
}

const radius = spacing * 0.72;

return ids.map((id, index) => {
const angle =
-Math.PI / 2 +
(index * Math.PI * 2) / ids.length;

const position: [number, number, number] = [
  Math.cos(angle) * radius,
  0,
  Math.sin(angle) * radius * 0.65,
];

return createPlacement(
  id,
  position,
  facePosition(position, [0, 0, 0])
);

});
}

/* ---------------------------------------
GROUP CINEMATIC COMPOSITION
--------------------------------------- */

function createGroup(
ids: string[],
spacing: number,
depth: number
): CharacterPlacement[] {
const columns = Math.min(
4,
Math.ceil(Math.sqrt(ids.length))
);

const rows = Math.ceil(ids.length / columns);

return ids.map((id, index) => {
const row = Math.floor(index / columns);
const column = index % columns;

const rowCount = Math.min(
  columns,
  ids.length - row * columns
);

const x =
  (column - (rowCount - 1) / 2) *
  spacing;

const z =
  (row - (rows - 1) / 2) *
  depth;

const position: [number, number, number] = [
  x,
  0,
  z,
];

return createPlacement(
  id,
  position,
  facePosition(position, [0, 0, 0])
);

});
}

/* ---------------------------------------
DRAMATIC HERO COMPOSITION
--------------------------------------- */

function createDramatic(
ids: string[],
spacing: number,
depth: number
): CharacterPlacement[] {
if (ids.length === 1) {
return createSingle(ids);
}

const hero = ids[0];

const placements: CharacterPlacement[] = [
createPlacement(
hero,
[0, 0, depth * 0.65],
[0, 0, 0],
1.12
),
];

const supportingIds = ids.slice(1);
const count = supportingIds.length;

supportingIds.forEach((id, index) => {
const angle =
-Math.PI / 2 +
(index * Math.PI) / Math.max(1, count - 1);

const position: [number, number, number] = [
  Math.cos(angle) * spacing * 0.85,
  0,
  -depth * 0.7 +
    Math.sin(angle) * spacing * 0.35,
];

placements.push(
  createPlacement(
    id,
    position,
    facePosition(position, [0, 0, depth * 0.4]),
    0.92
  )
);

});

return placements;
}

/* ---------------------------------------
AUTOMATIC COMPOSITION SELECTION
--------------------------------------- */

function resolveMode(
requested: CompositionMode,
characterCount: number
): CompositionMode {
if (requested !== "auto") {
return requested;
}

if (characterCount <= 1) {
return "single";
}

if (characterCount === 2) {
return "dialogue";
}

if (characterCount <= 4) {
return "triangle";
}

return "group";
}

/* ---------------------------------------
CAMERA FRAMING
--------------------------------------- */

function calculateCameraDistance(
placements: CharacterPlacement[],
spacing: number
): number {
if (placements.length <= 1) {
return 6.5;
}

const xs = placements.map(
(item) => item.position[0]
);

const zs = placements.map(
(item) => item.position[2]
);

const width =
Math.max(...xs) - Math.min(...xs);

const depth =
Math.max(...zs) - Math.min(...zs);

const largestDimension = Math.max(
width,
depth,
spacing
);

return clamp(
5.5 + largestDimension * 0.9,
6.5,
18
);
}

/* ---------------------------------------
MAIN COMPOSITION ENGINE
--------------------------------------- */

export function calculateComposition({
characterIds,
mode = "auto",
spacing = 2.3,
depth = 1.5,
}: CompositionOptions): CompositionResult {
const ids = uniqueIds(characterIds);

const safeSpacing = clamp(
spacing,
1.2,
5
);

const safeDepth = clamp(
depth,
0.5,
5
);

if (ids.length === 0) {
return {
placements: [],
center: [0, 0, 0],
cameraTarget: [0, 1.15, 0],
cameraDistance: 9,
};
}

const selectedMode = resolveMode(
mode,
ids.length
);

let placements: CharacterPlacement[];

switch (selectedMode) {
case "single":
placements = createSingle(ids);
break;

case "dialogue":
  placements = createDialogue(
    ids,
    safeSpacing,
    safeDepth
  );
  break;

case "triangle":
  placements = createTriangle(
    ids,
    safeSpacing,
    safeDepth
  );
  break;

case "group":
  placements = createGroup(
    ids,
    safeSpacing,
    safeDepth
  );
  break;

case "dramatic":
  placements = createDramatic(
    ids,
    safeSpacing,
    safeDepth
  );
  break;

default:
  placements = createSingle(ids);

}

const centerX =
placements.reduce(
(sum, item) => sum + item.position[0],
0
) / placements.length;

const centerZ =
placements.reduce(
(sum, item) => sum + item.position[2],
0
) / placements.length;

const center: [number, number, number] = [
centerX,
0,
centerZ,
];

const cameraTarget: [number, number, number] = [
centerX,
1.15,
centerZ,
];

return {
placements,
center,
cameraTarget,
cameraDistance: calculateCameraDistance(
placements,
safeSpacing
),
};
}

/* ---------------------------------------
CAMERA TARGET HELPER
--------------------------------------- */

export function getCompositionTarget(
result: CompositionResult
): [number, number, number] {
return [...result.cameraTarget];
}

export default function CinematicComposition() {
return null;
}
