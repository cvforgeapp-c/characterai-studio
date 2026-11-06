import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

import {
registerAnimationCharacter,
unregisterAnimationCharacter,
setAnimationPriority,
shouldUpdateCharacterAnimation,
type AnimationPriority,
} from "./cinematic-animation-scheduler";

interface CinematicAnimationScheduleOptions {
enabled?: boolean;
priority?: AnimationPriority;
onUpdate?: (delta: number, elapsedTime: number) => void;
}

export function useCinematicAnimationSchedule(
characterId: string,
options: CinematicAnimationScheduleOptions = {}
): void {
const {
enabled = true,
priority = "background",
onUpdate,
} = options;

const callbackRef = useRef(onUpdate);

// Keep the latest callback without repeatedly registering the character.
callbackRef.current = onUpdate;

// Register this animation consumer.
useEffect(() => {
if (!enabled || !characterId) return;

registerAnimationCharacter(characterId, priority);

return () => {
  unregisterAnimationCharacter(characterId);
};

}, [characterId, enabled]);

// Update priority independently when it changes.
useEffect(() => {
if (!enabled || !characterId) return;

setAnimationPriority(characterId, priority);

}, [characterId, enabled, priority]);

// Run the character's animation update only when scheduled.
useFrame((state, delta) => {
if (!enabled || !characterId) return;

if (!shouldUpdateCharacterAnimation(characterId)) {
  return;
}

callbackRef.current?.(
  delta,
  state.clock.elapsedTime
);

});
}

export default useCinematicAnimationSchedule;
