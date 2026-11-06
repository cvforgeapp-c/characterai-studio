import * as THREE from "three";

export interface LiveCharacterCameraState {
target: THREE.Vector3;
center: THREE.Vector3;
size: THREE.Vector3;
characterCount: number;
framingDistance: number;
updatedAt: number;
focusedCharacterId: string | null;
isFocused: boolean;
}

interface CharacterBounds {
id: string;
object: THREE.Object3D;
center: THREE.Vector3;
size: THREE.Vector3;
target: THREE.Vector3;
framingDistance: number;
}

const characterObjects = new Map<string, THREE.Object3D>();

const characterBounds = new Map<string, CharacterBounds>();

const combinedBox = new THREE.Box3();
const objectBox = new THREE.Box3();
const temporarySize = new THREE.Vector3();
const temporaryCenter = new THREE.Vector3();

const liveState: LiveCharacterCameraState = {
target: new THREE.Vector3(0, 1, 0),
center: new THREE.Vector3(0, 1, 0),
size: new THREE.Vector3(1, 2, 1),
characterCount: 0,
framingDistance: 5,
updatedAt: 0,
focusedCharacterId: null,
isFocused: false,
};

let focusedCharacterId: string | null = null;

export function registerLiveCharacter(
id: string,
object: THREE.Object3D
): void {
if (!id || !object) return;

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
characterBounds.delete(id);

if (focusedCharacterId === id) {
focusedCharacterId = null;
}
}

export function setLiveCameraFocusCharacter(
characterId: string | null
): void {
focusedCharacterId = characterId;

liveState.focusedCharacterId = characterId;
liveState.isFocused = Boolean(characterId);
}

export function getLiveCameraFocusCharacter(): string | null {
return focusedCharacterId;
}

export function updateLiveCharacterCameraTarget(): void {
combinedBox.makeEmpty();
characterBounds.clear();

let validCount = 0;

for (const [id, object] of characterObjects.entries()) {
if (!object.parent) continue;

object.updateWorldMatrix(true, true);

objectBox.setFromObject(object);

if (objectBox.isEmpty()) continue;

objectBox.getSize(temporarySize);
objectBox.getCenter(temporaryCenter);

const center = temporaryCenter.clone();
const size = temporarySize.clone();

const target = center.clone();
target.y = Math.max(0.8, center.y);

const framingDistance = Math.max(
  3.5,
  3.8 +
    size.x * 1.15 +
    size.z * 1.3 +
    size.y * 0.8
);

characterBounds.set(id, {
  id,
  object,
  center,
  size,
  target,
  framingDistance,
});

combinedBox.union(objectBox);

validCount += 1;

}

liveState.characterCount = validCount;
liveState.updatedAt = performance.now();

if (validCount === 0) {
liveState.isFocused = false;
return;
}

// Prefer the active speaker when their character is registered.
const focusedBounds = focusedCharacterId
? characterBounds.get(focusedCharacterId)
: undefined;

if (focusedBounds) {
liveState.target.copy(focusedBounds.target);
liveState.center.copy(focusedBounds.center);
liveState.size.copy(focusedBounds.size);
liveState.framingDistance =
focusedBounds.framingDistance;

liveState.focusedCharacterId = focusedCharacterId;
liveState.isFocused = true;

return;

}

// Otherwise, frame the entire cast.
combinedBox.getCenter(liveState.center);
combinedBox.getSize(liveState.size);

liveState.target.copy(liveState.center);
liveState.target.y = Math.max(0.8, liveState.center.y);

liveState.framingDistance = Math.max(
4.5,
4.5 +
liveState.size.x * 1.35 +
liveState.size.z * 1.5 +
liveState.size.y * 1.15 +
(validCount - 1) * 0.55
);

liveState.focusedCharacterId = null;
liveState.isFocused = false;
}

export function getLiveCharacterCameraState(): LiveCharacterCameraState {
return liveState;
}

export function getLiveCharacterBounds(
characterId: string
): CharacterBounds | undefined {
return characterBounds.get(characterId);
}

export function getRegisteredCharacterCount(): number {
return characterObjects.size;
}

export function getRegisteredCharacterIds(): string[] {
return Array.from(characterObjects.keys());
}
