import { useEffect, useRef } from "react";

import { useFrame } from "@react-three/fiber";

import {
advanceAnimationFrame,
registerAnimationCharacter,
unregisterAnimationCharacter,
setAnimationPriority,
type AnimationPriority,
} from "../lib/cinematic-animation-scheduler";

import {
getRegisteredCharacterIds,
} from "../lib/cinematic-live-target-store";

import {
getCharacterInteraction,
} from "../lib/cinematic-interaction-store";

interface CinematicAnimationSchedulerRigProps {
enabled?: boolean;
}

export default function CinematicAnimationSchedulerRig({
enabled = true,
}: CinematicAnimationSchedulerRigProps) {
const registeredIds = useRef<Set<string>>(new Set());

const lastUpdate = useRef(0);

useEffect(() => {
if (!enabled) return;

const syncCharacters = () => {
  const currentIds = new Set(
    getRegisteredCharacterIds(),
  );

  registeredIds.current.forEach((id) => {
    if (!currentIds.has(id)) {
      unregisterAnimationCharacter(id);
      registeredIds.current.delete(id);
    }
  });

  currentIds.forEach((id) => {
    if (!registeredIds.current.has(id)) {
      registerAnimationCharacter(id, "background");
      registeredIds.current.add(id);
    }
  });
};

syncCharacters();

const interval = window.setInterval(
  syncCharacters,
  1000,
);

return () => {
  window.clearInterval(interval);

  registeredIds.current.forEach((id) => {
    unregisterAnimationCharacter(id);
  });

  registeredIds.current.clear();
};

}, [enabled]);

useFrame((_, delta) => {
if (!enabled) return;

advanceAnimationFrame();

lastUpdate.current += delta;

// Dialogue priorities only need refreshing several times per second.
if (lastUpdate.current < 0.15) return;

lastUpdate.current = 0;

const interaction = getCharacterInteraction();

const ids = getRegisteredCharacterIds();

ids.forEach((id) => {
  let priority: AnimationPriority = "background";

  if (
    interaction.enabled &&
    interaction.speakerId === id
  ) {
    priority = "speaking";
  } else if (
    interaction.enabled &&
    interaction.listenerId === id
  ) {
    priority = "listening";
  } else {
    priority = "foreground";
  }

  setAnimationPriority(id, priority);
});

});

return null;
}
