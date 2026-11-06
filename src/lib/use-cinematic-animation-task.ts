import {
useEffect,
useRef,
} from "react";

import {
registerCharacterAnimationTask,
setCharacterAnimationTaskEnabled,
unregisterCharacterAnimationTasks,
} from "./cinematic-animation-runtime";

import type {
AnimationPriority,
} from "./cinematic-animation-scheduler";

export type CinematicAnimationTaskCallback = (
delta: number,
elapsedTime: number
) => void;

interface CinematicAnimationTaskOptions {
enabled?: boolean;
priority?: AnimationPriority;
onUpdate: CinematicAnimationTaskCallback;
}

/**

* Registers a character animation task with the centralized
* cinematic animation runtime.
* 
* The callback is executed by CinematicAnimationRuntimeDirector,
* not directly by an individual useFrame loop.
  */
  export function useCinematicAnimationTask(
  characterId: string,
  taskId: string,
  options: CinematicAnimationTaskOptions
  ): void {
  const {
  enabled = true,
  priority = "background",
  onUpdate,
  } = options;

const callbackRef = useRef(onUpdate);

callbackRef.current = onUpdate;

useEffect(() => {
if (!characterId || !taskId) return;

registerCharacterAnimationTask(
  characterId,
  taskId,
  (delta: number, elapsedTime: number) => {
    callbackRef.current?.(delta, elapsedTime);
  },
  priority
);

setCharacterAnimationTaskEnabled(
  characterId,
  taskId,
  enabled
);

return () => {
  unregisterCharacterAnimationTasks(
    characterId,
    taskId
  );
};

}, [
characterId,
taskId,
priority,
]);

useEffect(() => {
if (!characterId || !taskId) return;

setCharacterAnimationTaskEnabled(
  characterId,
  taskId,
  enabled
);

}, [
characterId,
taskId,
enabled,
]);
}

export default useCinematicAnimationTask;
