import { useFrame } from "@react-three/fiber";

import {
executeCharacterAnimationTasks,
} from "../lib/cinematic-animation-runtime";

import {
getCharacterInteraction,
} from "../lib/cinematic-interaction-store";

import {
setAnimationPriority,
} from "../lib/cinematic-animation-scheduler";

interface CinematicAnimationRuntimeDirectorProps {
enabled?: boolean;
}

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

executeCharacterAnimationTasks(
  delta,
  state.clock.elapsedTime
);

});

return null;
}
