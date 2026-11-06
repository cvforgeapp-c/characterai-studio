import {
useEffect,
useRef,
} from "react";

import {
registerCharacterAnimationTask,
setCharacterAnimationTaskEnabled,
type CharacterAnimationTask,
} from "./cinematic-animation-runtime";

import type {
AnimationPriority,
} from "./cinematic-animation-scheduler";

export interface CinematicScheduledFrameOptions {
enabled?: boolean;
priority?: AnimationPriority;
}

export function useCinematicScheduledFrame(
characterId: string,
taskId: string,
callback: CharacterAnimationTask,
options: CinematicScheduledFrameOptions = {},
): void {
const {
enabled = true,
priority = "background",
} = options;

const callbackRef = useRef(callback);

callbackRef.current = callback;

useEffect(() => {
if (!enabled || !characterId || !taskId) {
return;
}

const stableCallback: CharacterAnimationTask = (
  delta,
  elapsedTime,
) => {
  callbackRef.current(delta, elapsedTime);
};

const unregister = registerCharacterAnimationTask(
  characterId,
  taskId,
  stableCallback,
);

return unregister;

}, [
characterId,
taskId,
enabled,
]);

useEffect(() => {
if (!characterId || !taskId) return;

setCharacterAnimationTaskEnabled(
  characterId,
  taskId,
  enabled,
);

}, [
characterId,
taskId,
enabled,
]);

// Priority is managed by the centralized animation
// priority directors, not by individual animation tasks.
void priority;
}

export default useCinematicScheduledFrame;
