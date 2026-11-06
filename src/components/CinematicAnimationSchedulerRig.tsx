import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";

import {
advanceAnimationFrame,
registerAnimationCharacter,
unregisterAnimationCharacter,
setAnimationPriority,
} from "../lib/cinematic-animation-scheduler";

import {
getRegisteredCharacterIds,
} from "../lib/cinematic-live-target-store";

import {
getCharacterInteraction,
} from "../lib/cinematic-interaction-store";

interface Props {
enabled?: boolean;
}

export default function CinematicAnimationSchedulerRig({
enabled = true,
}: Props) {
useEffect(() => {
if (!enabled) return;

const registered = new Set<string>();

const syncCharacters = () => {
  const currentIds = new Set(
    getRegisteredCharacterIds(),
  );

  // Register newly available characters.
  for (const id of currentIds) {
    if (!registered.has(id)) {
      registerAnimationCharacter(id, "background");
      registered.add(id);
    }
  }

  // Unregister characters that have disappeared.
  for (const id of registered) {
    if (!currentIds.has(id)) {
      unregisterAnimationCharacter(id);
      registered.delete(id);
    }
  }
};

syncCharacters();

const interval = window.setInterval(
  syncCharacters,
  1000,
);

return () => {
  window.clearInterval(interval);

  for (const id of registered) {
    unregisterAnimationCharacter(id);
  }

  registered.clear();
};

}, [enabled]);

useFrame(() => {
if (!enabled) return;

// Advance the shared animation scheduler.
advanceAnimationFrame();

});

useEffect(() => {
if (!enabled) return;

const updateDialoguePriorities = () => {
  const interaction = getCharacterInteraction();

  if (!interaction.enabled) return;

  if (interaction.speakerId) {
    setAnimationPriority(
      interaction.speakerId,
      "speaking",
    );
  }

  if (interaction.listenerId) {
    setAnimationPriority(
      interaction.listenerId,
      "listening",
    );
  }
};

updateDialoguePriorities();

const interval = window.setInterval(
  updateDialoguePriorities,
  150,
);

return () => window.clearInterval(interval);

}, [enabled]);

return null;
}
