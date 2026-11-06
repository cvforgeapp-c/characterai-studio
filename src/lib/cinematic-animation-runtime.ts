import {
getAnimationFrame,
shouldUpdateCharacterAnimation,
type AnimationPriority,
} from "./cinematic-animation-scheduler";

export interface AnimationRuntimeOptions {
characterId: string;
enabled?: boolean;
priority?: AnimationPriority;
}

export interface AnimationRuntimeResult {
shouldUpdate: boolean;
priority: AnimationPriority;
frameTime: number;
}

export type CharacterAnimationTask = (
delta: number,
elapsedTime: number,
) => void;

interface RegisteredTask {
characterId: string;
taskId: string;
callback: CharacterAnimationTask;
enabled: boolean;
}

const animationTasks = new Map<string, RegisteredTask>();

const frameDecisions = new Map<string, number>();

let cachedFrame = -1;

function getTaskKey(
characterId: string,
taskId: string,
): string {
return "${characterId}:${taskId}";
}

/**

* Register an animation task for a character.
* The task is executed only when the scheduler allows
* that character to update.
  */
  export function registerCharacterAnimationTask(
  characterId: string,
  taskId: string,
  callback: CharacterAnimationTask,
  ): () => void {
  if (!characterId || !taskId) {
  return () => undefined;
  }

const key = getTaskKey(characterId, taskId);

animationTasks.set(key, {
characterId,
taskId,
callback,
enabled: true,
});

return () => {
const current = animationTasks.get(key);

if (current?.callback === callback) {
  animationTasks.delete(key);
}

};
}

/**

* Enable or disable a registered task.
  */
  export function setCharacterAnimationTaskEnabled(
  characterId: string,
  taskId: string,
  enabled: boolean,
  ): void {
  const task = animationTasks.get(
  getTaskKey(characterId, taskId),
  );

if (task) {
task.enabled = enabled;
}
}

/**

* Remove every registered task belonging to a character.
  */
  export function unregisterCharacterAnimationTasks(
  characterId: string,
  ): void {
  for (const [key, task] of animationTasks) {
  if (task.characterId === characterId) {
  animationTasks.delete(key);
  }
  }
  }

/**

* Get one character's scheduler decision.
* Multiple tasks belonging to the same character share
* the same decision during a frame.
  */
  export function getCharacterAnimationRuntime(
  options: AnimationRuntimeOptions,
  delta: number,
  ): AnimationRuntimeResult {
  const {
  characterId,
  enabled = true,
  priority = "background",
  } = options;

if (!enabled || !characterId) {
return {
shouldUpdate: false,
priority,
frameTime: delta,
};
}

const frame = getAnimationFrame();

if (cachedFrame !== frame) {
cachedFrame = frame;
frameDecisions.clear();
}

let shouldUpdate = frameDecisions.get(characterId);

if (shouldUpdate === undefined) {
shouldUpdate = shouldUpdateCharacterAnimation(characterId);
frameDecisions.set(characterId, shouldUpdate);
}

return {
shouldUpdate,
priority,
frameTime: delta,
};
}

/**

* Execute all registered animation tasks.

* Each character receives one shared scheduler decision

* per frame, regardless of how many tasks it owns.
  */
  export function runCinematicAnimationTasks(
  delta: number,
  elapsedTime: number,
  ): void {
  for (const task of animationTasks.values()) {
  if (!task.enabled) continue;
  
  const runtime = getCharacterAnimationRuntime(
  {
  characterId: task.characterId,
  enabled: true,
  },
  delta,
  );
  
  if (!runtime.shouldUpdate) continue;
  
  try {
  task.callback(delta, elapsedTime);
  } catch (error) {
  console.error(
  "Animation task failed: ${task.taskId}",
  error,
  );
  }
  }
  }

/**

* Runtime diagnostics.
  */
  export function getAnimationRuntimeStats() {
  const characters = new Set<string>();

let enabledTasks = 0;

for (const task of animationTasks.values()) {
characters.add(task.characterId);

if (task.enabled) {
  enabledTasks += 1;
}

}

return {
registeredTasks: animationTasks.size,
enabledTasks,
registeredCharacters: characters.size,
currentFrame: getAnimationFrame(),
};
}

/**

* Clear runtime registrations.
  */
  export function clearCinematicAnimationRuntime(): void {
  animationTasks.clear();
  frameDecisions.clear();
  cachedFrame = -1;
  }
