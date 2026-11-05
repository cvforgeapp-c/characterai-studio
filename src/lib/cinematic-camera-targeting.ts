export interface CharacterCameraPlacement {
id: string;
position: [number, number, number];
scale?: number | [number, number, number];
}

export interface CharacterCameraTarget {
target: [number, number, number];
groupWidth: number;
groupDepth: number;
characterCount: number;
}

export function calculateCharacterCameraTarget(
placements: CharacterCameraPlacement[]
): CharacterCameraTarget {
if (!placements.length) {
return {
target: [0, 1, 0],
groupWidth: 0,
groupDepth: 0,
characterCount: 0,
};
}

const positions = placements.map((placement) => ({
x: placement.position[0],
y: placement.position[1],
z: placement.position[2],
}));

const minX = Math.min(...positions.map((p) => p.x));
const maxX = Math.max(...positions.map((p) => p.x));

const minY = Math.min(...positions.map((p) => p.y));
const maxY = Math.max(...positions.map((p) => p.y));

const minZ = Math.min(...positions.map((p) => p.z));
const maxZ = Math.max(...positions.map((p) => p.z));

const centerX = (minX + maxX) / 2;
const centerZ = (minZ + maxZ) / 2;

const groupWidth = maxX - minX;
const groupDepth = maxZ - minZ;

/*

* Aim around the upper-middle area of the group.
* The vertical offset avoids aiming at the floor.
  */

const targetY = Math.max(
0.8,
(minY + maxY) / 2 + 0.8
);

return {
target: [
centerX,
targetY,
centerZ,
],
groupWidth,
groupDepth,
characterCount: placements.length,
};
}

export function getCharacterCameraDistance(
groupWidth: number,
groupDepth: number,
characterCount: number
): number {
const widthDistance = groupWidth * 1.35;
const depthDistance = groupDepth * 1.5;
const groupAdjustment = Math.max(
0,
characterCount - 1
) * 0.55;

return Math.max(
3,
4.5 + widthDistance + depthDistance + groupAdjustment
);
}
