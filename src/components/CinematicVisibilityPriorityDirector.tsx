import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import {
getLiveCharacterObject,
getRegisteredCharacterIds,
} from "../lib/cinematic-live-target-store";

import {
getCharacterInteraction,
} from "../lib/cinematic-interaction-store";

import {
setAnimationPriority,
type AnimationPriority,
} from "../lib/cinematic-animation-scheduler";

const FOREGROUND_DISTANCE = 12;
const CHECK_INTERVAL = 6;

export default function CinematicVisibilityPriorityDirector({
enabled = true,
}: {
enabled?: boolean;
}) {
const frameCounter = useRef(0);

const frustum = useRef(new THREE.Frustum());
const projectionView = useRef(new THREE.Matrix4());
const bounds = useRef(new THREE.Box3());
const sphere = useRef(new THREE.Sphere());

const cameraPosition = useRef(new THREE.Vector3());
const characterPosition = useRef(new THREE.Vector3());

const previousPriorities = useRef(
new Map<string, AnimationPriority>(),
);

useFrame(({ camera }) => {
if (!enabled) return;

frameCounter.current += 1;

// Check visibility every six frames to reduce overhead.
if (frameCounter.current % CHECK_INTERVAL !== 0) {
  return;
}

camera.updateMatrixWorld();

cameraPosition.current.setFromMatrixPosition(
  camera.matrixWorld,
);

projectionView.current.multiplyMatrices(
  camera.projectionMatrix,
  camera.matrixWorldInverse,
);

frustum.current.setFromProjectionMatrix(
  projectionView.current,
);

const interaction = getCharacterInteraction();
const registeredIds = getRegisteredCharacterIds();
const activeIds = new Set(registeredIds);

// Clean up removed characters.
for (const id of previousPriorities.current.keys()) {
  if (!activeIds.has(id)) {
    previousPriorities.current.delete(id);
  }
}

for (const characterId of registeredIds) {
  let priority: AnimationPriority = "background";

  // Dialogue participants keep their priority.
  if (
    interaction.enabled &&
    characterId === interaction.speakerId
  ) {
    priority = "speaking";
  } else if (
    interaction.enabled &&
    characterId === interaction.listenerId
  ) {
    priority = "listening";
  } else {
    const character =
      getLiveCharacterObject(characterId);

    if (character) {
      character.updateWorldMatrix(true, true);

      bounds.current.setFromObject(character);

      if (!bounds.current.isEmpty()) {
        bounds.current.getBoundingSphere(
          sphere.current,
        );

        const visible = frustum.current.intersectsSphere(
          sphere.current,
        );

        if (visible) {
          character.getWorldPosition(
            characterPosition.current,
          );

          const distance =
            cameraPosition.current.distanceTo(
              characterPosition.current,
            );

          priority =
            distance <= FOREGROUND_DISTANCE
              ? "foreground"
              : "background";
        }
      }
    }
  }

  if (
    previousPriorities.current.get(characterId) !==
    priority
  ) {
    setAnimationPriority(characterId, priority);

    previousPriorities.current.set(
      characterId,
      priority,
    );
  }
}

});

return null;
}
