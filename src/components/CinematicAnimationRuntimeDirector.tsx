import { useFrame } from "@react-three/fiber";

import {
executeCharacterAnimationTasks,
} from "../lib/cinematic-animation-runtime";

import {
getCharacterInteraction,
} from "../lib/cinematic-interaction-store";

import {
getRegisteredCharacterIds,
} from "../lib/cinematic-live-target-store";

import {
setAnimationPriority,
type AnimationPriority,
} from "../lib/cinematic-animation-scheduler";

interface CinematicAnimationRuntimeDirectorProps {
enabled?: boolean;
}

const PRIORITY_RANK: Record<AnimationPriority, number> = {
speaking: 4,
listening: 3,
foreground: 2,
background: 1,
};

export default function CinematicAnimationRuntimeDirector({
enabled = true,
}: CinematicAnimationRuntimeDirectorProps) {
useFrame((state, delta) => {
if (!enabled) return;

const interaction = getCharacterInteraction();

if (interaction.enabled) {
  if (interaction.speakerId) {
    setAnimationPriority(
      interaction.speakerId,
      "speaking"
    );
  }

  if (interaction.listenerId) {
    setAnimationPriority(
      interaction.listenerId,
      "listening"
    );
  }
}

const registeredIds = getRegisteredCharacterIds();

for (const characterId of registeredIds) {
  if (
    interaction.enabled &&
    characterId === interaction.speakerId
  ) {
    continue;
  }

  if (
    interaction.enabled &&
    characterId === interaction.listenerId
  ) {
    continue;
  }

  // Preserve priorities assigned by the visibility director.
  // Do not reset foreground/background priorities here.
}

executeCharacterAnimationTasks(
  delta,
  state.clock.elapsedTime
);

});

return null;
}
