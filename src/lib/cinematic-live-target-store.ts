import * as THREE from "three";

export interface LiveCharacterCameraState {
target: THREE.Vector3;
center: THREE.Vector3;
size: THREE.Vector3;
characterCount: number;
framingDistance: number;
updatedAt: number;
}

const characterObjects = new Map<string, THREE.Object3D>();

const liveState: LiveCharacterCameraState = {
target: new THREE.Vector3(0, 1, 0),
center: new THREE.Vector3(0, 1, 0),
size: new THREE.Vector3(0, 2, 0),
characterCount: 0,
framingDistance: 5,
updatedAt: 0,
};

const combinedBounds = new THREE.Box3();
const objectBounds = new THREE.Box3();

const center = new THREE.Vector3();
const size = new THREE.Vector3();

export function registerLiveCharacter(
id: string,
object: THREE.Object3D
): void {
characterObjects.set(id, object);
}

export function unregisterLiveCharacter(
id: string,
object?: THREE.Object3D
): void {
const registered = characterObjects.get(id);

if (!registered) return;

if (object && registered !== object) return;

characterObjects.delete(id);
}

export function updateLiveCharacterCameraTarget(): void {
combinedBounds.makeEmpty();

let validCount = 0;

for (const object of characterObjects.values()) {
if (!object.parent) continue;

object.updateWorldMatrix(true, true);

objectBounds.setFromObject(object);

if (objectBounds.isEmpty()) continue;

combinedBounds.union(objectBounds);

validCount += 1;

}

if (validCount === 0 || combinedBounds.isEmpty()) {
liveState.characterCount = 0;
return;
}

combinedBounds.getCenter(center);
combinedBounds.getSize(size);

liveState.center.copy(center);

liveState.target.set(
center.x,
Math.max(0.8, center.y),
center.z
);

liveState.size.copy(size);

liveState.characterCount = validCount;

const width = Math.max(0, size.x);
const height = Math.max(0, size.y);
const depth = Math.max(0, size.z);

liveState.framingDistance = Math.max(
4.5,
4.5 +
width * 1.35 +
depth * 1.5 +
height * 1.15 +
Math.max(0, validCount - 1) * 0.55
);

liveState.updatedAt = performance.now();
}

export function getLiveCharacterCameraState():
LiveCharacterCameraState {
return liveState;
}

export function getRegisteredCharacterCount(): number {
return characterObjects.size;
}
