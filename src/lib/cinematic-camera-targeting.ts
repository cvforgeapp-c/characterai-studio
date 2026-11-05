export interface CharacterCameraPlacement {
id: string;
position: [number, number, number];
scale?: number | [number, number, number];
}

export interface CharacterCameraTarget {
target: [number, number, number];
groupWidth: number;
groupHeight: number;
groupDepth: number;
characterCount: number;
}

interface CharacterBounds {
minX: number;
maxX: number;
minY: number;
maxY: number;
minZ: number;
maxZ: number;
}

function getScale(
scale?: number | [number, number, number]
): [number, number, number] {
if (typeof scale === "number") {
const safeScale = Math.max(0.01, Math.abs(scale));

return [safeScale, safeScale, safeScale];

}

if (Array.isArray(scale)) {
return [
Math.max(0.01, Math.abs(scale[0] ?? 1)),
Math.max(0.01, Math.abs(scale[1] ?? 1)),
Math.max(0.01, Math.abs(scale[2] ?? 1)),
];
}

return [1, 1, 1];
}

function getCharacterBounds(
placement: CharacterCameraPlacement
): CharacterBounds {
const [x, y, z] = placement.position;
const [scaleX, scaleY, scaleZ] = getScale(
placement.scale
);

/*

* Approximate character dimensions.
* These are framing estimates, not mesh measurements.
  */

const halfWidth = 0.65 * scaleX;
const halfHeight = 1.0 * scaleY;
const halfDepth = 0.5 * scaleZ;

return {
minX: x - halfWidth,
maxX: x + halfWidth,

minY: y,
maxY: y + halfHeight * 2,

minZ: z - halfDepth,
maxZ: z + halfDepth,

};
}

export function calculateCharacterCameraTarget(
placements: CharacterCameraPlacement[]
): CharacterCameraTarget {
if (placements.length === 0) {
return {
target: [0, 1, 0],
groupWidth: 0,
groupHeight: 0,
groupDepth: 0,
characterCount: 0,
};
}

const bounds = placements.map(getCharacterBounds);

const minX = Math.min(
...bounds.map((item) => item.minX)
);

const maxX = Math.max(
...bounds.map((item) => item.maxX)
);

const minY = Math.min(
...bounds.map((item) => item.minY)
);

const maxY = Math.max(
...bounds.map((item) => item.maxY)
);

const minZ = Math.min(
...bounds.map((item) => item.minZ)
);

const maxZ = Math.max(
...bounds.map((item) => item.maxZ)
);

const groupWidth = Math.max(0, maxX - minX);
const groupHeight = Math.max(0, maxY - minY);
const groupDepth = Math.max(0, maxZ - minZ);

return {
target: [
(minX + maxX) / 2,
Math.max(0.8, (minY + maxY) / 2),
(minZ + maxZ) / 2,
],

groupWidth,
groupHeight,
groupDepth,
characterCount: placements.length,

};
}

export function getCharacterCameraDistance(
groupWidth: number,
groupDepth: number,
characterCount: number,
groupHeight = 2
): number {
const width = Math.max(0, groupWidth);
const depth = Math.max(0, groupDepth);
const height = Math.max(0, groupHeight);
const count = Math.max(0, characterCount);

const widthDistance = width * 1.35;
const depthDistance = depth * 1.5;
const heightDistance = height * 1.15;
const groupSpacing = Math.max(0, count - 1) * 0.55;

return Math.max(
4.5,
4.5 +
widthDistance +
depthDistance +
heightDistance +
groupSpacing
);
 }
