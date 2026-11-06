import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import {
getLiveCharacterObject,
getRegisteredCharacterIds,
} from "../lib/cinematic-live-target-store";

interface ProceduralCharacterState {
root: THREE.Object3D;
basePosition: THREE.Vector3;
baseRotation: THREE.Euler;
phase: number;
currentBreathing: number;
currentSway: number;
}

const characterStates = new Map<
string,
ProceduralCharacterState

«();»

function hasUsableSkeleton(root: THREE.Object3D): boolean {
let foundSkeleton = false;

root.traverse((object) => {
if (
object instanceof THREE.SkinnedMesh &&
object.skeleton &&
object.skeleton.bones.length > 0
) {
foundSkeleton = true;
}
});

return foundSkeleton;
}

function createCharacterState(
characterId: string,
root: THREE.Object3D,
): ProceduralCharacterState {
return {
root,
basePosition: root.position.clone(),
baseRotation: root.rotation.clone(),
phase: characterId
.split("")
.reduce((total, character) => total + character.charCodeAt(0), 0) % 100,
currentBreathing: 0,
currentSway: 0,
};
}

export default function CinematicProceduralMotionFallback({
enabled = true,
breathingIntensity = 0.012,
swayIntensity = 0.018,
}: {
enabled?: boolean;
breathingIntensity?: number;
swayIntensity?: number;
}) {
const activeIds = useRef<string[]>([]);

useEffect(() => {
if (!enabled) {
characterStates.clear();
}

return () => {
  characterStates.clear();
};

}, [enabled]);

useFrame((_, delta) => {
if (!enabled) return;

const ids = getRegisteredCharacterIds();

activeIds.current = ids;

const activeSet = new Set(ids);

// Remove characters no longer present.
for (const [id, state] of characterStates) {
  if (!activeSet.has(id)) {
    state.root.position.copy(state.basePosition);
    state.root.rotation.copy(state.baseRotation);
    characterStates.delete(id);
  }
}

const safeDelta = Math.min(delta, 0.05);

for (const characterId of ids) {
  const root = getLiveCharacterObject(characterId);

  if (!root) continue;

  // Never apply this fallback to properly rigged models.
  if (hasUsableSkeleton(root)) {
    const previous = characterStates.get(characterId);

    if (previous) {
      root.position.copy(previous.basePosition);
      root.rotation.copy(previous.baseRotation);
      characterStates.delete(characterId);
    }

    continue;
  }

  let state = characterStates.get(characterId);

  if (!state || state.root !== root) {
    state = createCharacterState(characterId, root);
    characterStates.set(characterId, state);
  }

  state.phase += safeDelta;

  const breathingWave = Math.sin(
    state.phase * 1.7,
  );

  const swayWave = Math.sin(
    state.phase * 0.8 + 0.7,
  );

  const targetBreathing =
    breathingWave * breathingIntensity;

  const targetSway =
    swayWave * swayIntensity;

  state.currentBreathing = THREE.MathUtils.damp(
    state.currentBreathing,
    targetBreathing,
    4,
    safeDelta,
  );

  state.currentSway = THREE.MathUtils.damp(
    state.currentSway,
    targetSway,
    3,
    safeDelta,
  );

  // Preserve the model's original placement.
  root.position.set(
    state.basePosition.x,
    state.basePosition.y + state.currentBreathing,
    state.basePosition.z,
  );

  root.rotation.set(
    state.baseRotation.x,
    state.baseRotation.y + state.currentSway,
    state.baseRotation.z,
  );
}

});

return null;
}
