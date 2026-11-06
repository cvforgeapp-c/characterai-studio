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
executionCount: number;
totalExecutionTime: number;
lastExecutionTime: number;
lastExecutedAt: number;
errorCount: number;
}

export interface CharacterAnimationTaskDiagnostic {
characterId: string;
taskId: string;
priority: AnimationPriority;
enabled: boolean;
executionCount: number;
averageExecutionTime: number;
lastExecutionTime: number;
lastExecutedAt: number;
errorCount: number;
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
executionCount: 0,
totalExecutionTime: 0,
lastExecutionTime: 0,
lastExecutedAt: 0,
errorCount: 0,
});

// Register without overriding priorities assigned by directors.
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

if (!shouldUpdateCharacterAnimation(characterId)) {
  continue;
}

for (const task of enabledTasks) {
  const startTime = performance.now();

  try {
    task.callback(delta, elapsedTime);

    const executionTime = performance.now() - startTime;

    task.executionCount += 1;
    task.totalExecutionTime += executionTime;
    task.lastExecutionTime = executionTime;
    task.lastExecutedAt = Date.now();
  } catch (error) {
    task.errorCount += 1;

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

export function getCharacterAnimationTaskDiagnostics(): CharacterAnimationTaskDiagnostic[] {
const diagnostics: CharacterAnimationTaskDiagnostic[] = [];

for (const tasks of animationTasks.values()) {
for (const task of tasks.values()) {
diagnostics.push({
characterId: task.characterId,
taskId: task.taskId,
priority: task.priority,
enabled: task.enabled,
executionCount: task.executionCount,
averageExecutionTime:
task.executionCount > 0
? task.totalExecutionTime / task.executionCount
: 0,
lastExecutionTime: task.lastExecutionTime,
lastExecutedAt: task.lastExecutedAt,
errorCount: task.errorCount,
});
}
}

return diagnostics;
}

export function getCharacterAnimationExecutionStats() {
const diagnostics = getCharacterAnimationTaskDiagnostics();

return {
registeredTasks: diagnostics.length,
enabledTasks: diagnostics.filter((task) => task.enabled).length,
executedTasks: diagnostics.filter(
(task) => task.executionCount > 0
).length,
totalExecutions: diagnostics.reduce(
(total, task) => total + task.executionCount,
0
),
totalErrors: diagnostics.reduce(
(total, task) => total + task.errorCount,
0
),
averageExecutionTime:
diagnostics.length > 0
? diagnostics.reduce(
(total, task) => total + task.averageExecutionTime,
0
) / diagnostics.length
: 0,
};
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
