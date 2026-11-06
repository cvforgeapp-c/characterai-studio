import { useFrame } from "@react-three/fiber";

import {
getRegisteredCharacterIds,
} from "../lib/cinematic-live-target-store";

import {
setAnimationPriority,
} from "../lib/cinematic-animation-scheduler";

import {
getCharacterInteraction,
} from "../lib/cinematic-interaction-store";

interface Props {
enabled?: boolean;
}

export default function CinematicAnimationRuntimeDirector({
enabled = true,
}: Props) {
useFrame(() => {
if (!enabled) return;

const interaction = getCharacterInteraction();

if (!interaction.enabled) return;

const registeredIds = getRegisteredCharacterIds();

for (const characterId of registeredIds) {
  if (characterId === interaction.speakerId) {
    setAnimationPriority(characterId, "speaking");
  } else if (
    characterId === interaction.listenerId
  ) {
    setAnimationPriority(characterId, "listening");
  }
}

});

return null;
}
