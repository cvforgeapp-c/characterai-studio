import {
shouldUpdateCharacterAnimation,
registerAnimationCharacter,
unregisterAnimationCharacter,
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

export type CharacterAnimationTaskCallback = (
delta: number,
elapsedTime: number
) => void;

interface CharacterAnimationTask {
characterId: string;
taskId: string;
callback: CharacterAnimationTaskCallback;
priority: AnimationPriority;
enabled: boolean;
}

const animationTasks = new Map<
string,
Map<string, CharacterAnimationTask>

«();»

function getCharacterTasks(
characterId: string
): Map<string, CharacterAnimationTask> {
let tasks = animationTasks.get(characterId);

if (!tasks) {
tasks = new Map();
animationTasks.set(characterId, tasks);
}

return tasks;
}

export function getCharacterAnimationRuntime(
options: AnimationRuntimeOptions,
delta: number
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

return {
shouldUpdate: shouldUpdateCharacterAnimation(characterId),
priority,
frameTime: delta,
};
}

export function registerCharacterAnimationTask(
characterId: string,
taskId: string,
callback: CharacterAnimationTaskCallback,
priority: AnimationPriority = "background"
): void {
if (!characterId || !taskId) return;

const tasks = getCharacterTasks(characterId);
const existingTask = tasks.get(taskId);

if (existingTask) {
existingTask.callback = callback;
existingTask.priority = priority;
existingTask.enabled = true;
return;
}

tasks.set(taskId, {
characterId,
taskId,
callback,
priority,
enabled: true,
});

// Register the character without overriding priorities
// subsequently assigned by the dialogue or visibility directors.
registerAnimationCharacter(characterId, "background");
}

export function setCharacterAnimationTaskEnabled(
characterId: string,
taskId: string,
enabled: boolean
): void {
const task = animationTasks
.get(characterId)
?.get(taskId);

if (!task) return;

task.enabled = enabled;
}

export function setCharacterAnimationTaskPriority(
characterId: string,
taskId: string,
priority: AnimationPriority
): void {
const task = animationTasks
.get(characterId)
?.get(taskId);

if (!task) return;

// This changes the task's metadata only.
// Scheduler priority remains owned by the directors.
task.priority = priority;
}

export function unregisterCharacterAnimationTasks(
characterId: string,
taskId?: string
): void {
const tasks = animationTasks.get(characterId);

if (!tasks) return;

if (taskId) {
if (!tasks.has(taskId)) return;

tasks.delete(taskId);
unregisterAnimationCharacter(characterId);

if (tasks.size === 0) {
  animationTasks.delete(characterId);
}

return;

}

const registrationCount = tasks.size;

tasks.clear();
animationTasks.delete(characterId);

for (let index = 0; index < registrationCount; index += 1) {
unregisterAnimationCharacter(characterId);
}
}

export function executeCharacterAnimationTasks(
delta: number,
elapsedTime: number
): void {
for (const [characterId, tasks] of animationTasks) {
const enabledTasks = Array.from(tasks.values()).filter(
(task) => task.enabled
);

if (enabledTasks.length === 0) continue;

// The scheduler checks the priority assigned by the
// dialogue and visibility directors.
if (!shouldUpdateCharacterAnimation(characterId)) {
  continue;
}

for (const task of enabledTasks) {
  try {
    task.callback(delta, elapsedTime);
  } catch (error) {
    console.error(
      `[CharacterAI Studio] Animation task failed: ${characterId}/${task.taskId}`,
      error
    );
  }
}

}
}

export function getCharacterAnimationTaskCount(
characterId?: string
): number {
if (characterId) {
return animationTasks.get(characterId)?.size ?? 0;
}

let total = 0;

for (const tasks of animationTasks.values()) {
total += tasks.size;
}

return total;
}

export function clearCharacterAnimationTasks(): void {
for (const [characterId, tasks] of animationTasks) {
const registrationCount = tasks.size;

for (let index = 0; index < registrationCount; index += 1) {
  unregisterAnimationCharacter(characterId);
}

}

animationTasks.clear();
}
