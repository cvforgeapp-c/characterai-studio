import {
  useEffect,
  useRef,
} from "react";

import {
  registerCharacterAnimationTask,
  setCharacterAnimationTaskEnabled,
  unregisterCharacterAnimationTasks,
  type CharacterAnimationTaskCallback,
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
  callback: CharacterAnimationTaskCallback,
  options: CinematicScheduledFrameOptions = {},
): void {
  const {
    enabled = true,
    priority = "background",
  } = options;

  const callbackRef = useRef<CharacterAnimationTaskCallback>(callback);

  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled || !characterId || !taskId) {
      return;
    }

    const stableCallback: CharacterAnimationTaskCallback = (
      delta: number,
      elapsedTime: number,
    ) => {
      callbackRef.current(delta, elapsedTime);
    };

    registerCharacterAnimationTask(
      characterId,
      taskId,
      stableCallback,
      priority,
    );

    return () => {
      unregisterCharacterAnimationTasks(
        characterId,
        taskId,
      );
    };
  }, [
    characterId,
    taskId,
    enabled,
    priority,
  ]);

  useEffect(() => {
    if (!characterId || !taskId) {
      return;
    }

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
}

export default useCinematicScheduledFrame;
