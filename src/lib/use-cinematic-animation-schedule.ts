import { useEffect, useRef } from "react";

import { useFrame } from "@react-three/fiber";

import {
registerAnimationCharacter,
unregisterAnimationCharacter,
shouldUpdateCharacterAnimation,
setAnimationPriority,
type AnimationPriority,
} from "./cinematic-animation-scheduler";

interface ScheduledAnimationOptions {
enabled?: boolean;
priority?: AnimationPriority;
onUpdate: (delta: number) => void;
}

/**

* Runs a character animation callback only when the
* shared animation scheduler permits an update.
* 
* The scheduler controller is responsible for advancing
* the global animation frame.
  */
  export function useCinematicAnimationSchedule(
  characterId: string,
  {
  enabled = true,
  priority = "background",
  onUpdate,
  }: ScheduledAnimationOptions,
  ): void {
  const callbackRef = useRef(onUpdate);

useEffect(() => {
callbackRef.current = onUpdate;
}, [onUpdate]);

useEffect(() => {
if (!enabled || !characterId) return;

registerAnimationCharacter(characterId, priority);

return () => {
  unregisterAnimationCharacter(characterId);
};

}, [characterId, enabled]);

useEffect(() => {
if (!enabled || !characterId) return;

setAnimationPriority(characterId, priority);

}, [characterId, enabled, priority]);

useFrame((_, delta) => {
if (!enabled || !characterId) return;

if (!shouldUpdateCharacterAnimation(characterId)) {
  return;
}

callbackRef.current(delta);

});
  }
