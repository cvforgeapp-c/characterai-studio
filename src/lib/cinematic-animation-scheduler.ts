export type AnimationPriority =
| "speaking"
| "listening"
| "foreground"
| "background";

export type SchedulerQuality =
| "high"
| "balanced"
| "performance";

interface AnimationEntry {
characterId: string;
priority: AnimationPriority;
lastUpdatedFrame: number;
registrationCount: number;
}

const entries = new Map<string, AnimationEntry>();

let currentFrame = 0;
let schedulerQuality: SchedulerQuality = "high";
let workloadFactor = 1;

export function advanceAnimationFrame(): void {
currentFrame += 1;
}

export function getAnimationFrame(): number {
return currentFrame;
}

export function registerAnimationCharacter(
characterId: string,
priority: AnimationPriority = "background",
): void {
const existing = entries.get(characterId);

if (existing) {
existing.registrationCount += 1;
return;
}

entries.set(characterId, {
characterId,
priority,
lastUpdatedFrame: -999999,
registrationCount: 1,
});
}

export function unregisterAnimationCharacter(
characterId: string,
): void {
const entry = entries.get(characterId);

if (!entry) return;

entry.registrationCount -= 1;

if (entry.registrationCount <= 0) {
entries.delete(characterId);
}
}

export function isAnimationCharacterRegistered(
characterId: string,
): boolean {
return entries.has(characterId);
}

export function getAnimationRegistrationCount(
characterId: string,
): number {
return entries.get(characterId)?.registrationCount ?? 0;
}

export function setAnimationPriority(
characterId: string,
priority: AnimationPriority,
): void {
const entry = entries.get(characterId);

if (entry) {
entry.priority = priority;
}
}

export function setAnimationSchedulerQuality(
quality: SchedulerQuality,
): void {
schedulerQuality = quality;
}

export function getAnimationSchedulerQuality(): SchedulerQuality {
return schedulerQuality;
}

export function setAnimationWorkloadFactor(
factor: number,
): void {
workloadFactor = Math.max(
1,
Math.min(3, factor),
);
}

export function getAnimationWorkloadFactor(): number {
return workloadFactor;
}

const QUALITY_INTERVALS: Record<
SchedulerQuality,
Record<AnimationPriority, number>

«= {
high: {
speaking: 1,
listening: 1,
foreground: 1,
background: 2,
},»

balanced: {
speaking: 1,
listening: 1,
foreground: 2,
background: 3,
},

performance: {
speaking: 1,
listening: 2,
foreground: 3,
background: 5,
},
};

export function shouldUpdateCharacterAnimation(
characterId: string,
frame: number = currentFrame,
): boolean {
const entry = entries.get(characterId);

if (!entry) return false;

const baseInterval =
QUALITY_INTERVALS[schedulerQuality][entry.priority];

const adaptiveInterval = Math.max(
1,
Math.ceil(baseInterval * workloadFactor),
);

if (
frame - entry.lastUpdatedFrame <
adaptiveInterval
) {
return false;
}

entry.lastUpdatedFrame = frame;

return true;
}

export function getAnimationSchedulerStats() {
const stats = {
totalCharacters: entries.size,
speaking: 0,
listening: 0,
foreground: 0,
background: 0,
currentFrame,
quality: schedulerQuality,
workloadFactor,
};

for (const entry of entries.values()) {
stats[entry.priority] += 1;
}

return stats;
}

export function clearAnimationScheduler(): void {
entries.clear();
currentFrame = 0;
workloadFactor = 1;
schedulerQuality = "high";
}
