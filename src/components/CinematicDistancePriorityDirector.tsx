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

export default function CinematicDistancePriorityDirector({
enabled = true,
}: {
enabled?: boolean;
}) {
const previousPriorities = useRef(
new Map<string, AnimationPriority>(),
);

const cameraPosition = useRef(new THREE.Vector3());
const characterPosition = useRef(new THREE.Vector3());

useFrame(({ camera }) => {
if (!enabled) return;

camera.getWorldPosition(cameraPosition.current);

const interaction = getCharacterInteraction();

const registeredIds = getRegisteredCharacterIds();
const activeIds = new Set(registeredIds);

// Remove cached priorities for characters no longer registered.
for (const id of previousPriorities.current.keys()) {
  if (!activeIds.has(id)) {
    previousPriorities.current.delete(id);
  }
}

for (const characterId of registeredIds) {
  let priority: AnimationPriority = "background";

  // Active dialogue always receives the highest priority.
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
    const character = getLiveCharacterObject(characterId);

    if (character) {
      character.getWorldPosition(characterPosition.current);

      const distance = cameraPosition.current.distanceTo(
        characterPosition.current,
      );

      priority =
        distance <= FOREGROUND_DISTANCE
          ? "foreground"
          : "background";
    }
  }

  // Avoid unnecessary scheduler updates.
  if (
    previousPriorities.current.get(characterId) !== priority
  ) {
    setAnimationPriority(characterId, priority);

    previousPriorities.current.set(characterId, priority);
  }
}

});

return null;
}
