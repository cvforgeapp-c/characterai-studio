import { useFrame } from "@react-three/fiber";

import {
runCinematicAnimationTasks,
} from "../lib/cinematic-animation-runtime";

import {
getCharacterInteraction,
} from "../lib/cinematic-interaction-store";

import {
setAnimationPriority,
} from "../lib/cinematic-animation-scheduler";

interface Props {
enabled?: boolean;
}

export default function CinematicAnimationRuntimeDirector({
enabled = true,
}: Props) {
useFrame((state, delta) => {
if (!enabled) return;

const interaction = getCharacterInteraction();

if (interaction.enabled) {
  if (interaction.speakerId) {
    setAnimationPriority(
      interaction.speakerId,
      "speaking",
    );
  }

  if (
    interaction.listenerId &&
    interaction.listenerId !== interaction.speakerId
  ) {
    setAnimationPriority(
      interaction.listenerId,
      "listening",
    );
  }
}

runCinematicAnimationTasks(
  delta,
  state.clock.elapsedTime,
);

});

return null;
}
