import {
getCinematicPerformanceState,
type CinematicQualityLevel,
} from "./cinematic-performance-store";

export type AnimationPriority =
| "speaking"
| "listening"
| "foreground"
| "background";

interface SchedulerEntry {
characterId: string;
priority: AnimationPriority;
lastUpdatedFrame: number;
}

const entries = new Map<string, SchedulerEntry>();

let currentFrame = 0;

const UPDATE_INTERVALS: Record<
CinematicQualityLevel,
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

export function advanceAnimationFrame(): number {
currentFrame += 1;
return currentFrame;
}

export function getAnimationFrame(): number {
return currentFrame;
}

export function registerAnimationCharacter(
characterId: string,
priority: AnimationPriority = "background",
): void {
const existing = entries.get(characterId);

entries.set(characterId, {
characterId,
priority,
lastUpdatedFrame: existing?.lastUpdatedFrame ?? -1,
});
}

export function unregisterAnimationCharacter(
characterId: string,
): void {
entries.delete(characterId);
}

export function setAnimationPriority(
characterId: string,
priority: AnimationPriority,
): void {
const existing = entries.get(characterId);

entries.set(characterId, {
characterId,
priority,
lastUpdatedFrame: existing?.lastUpdatedFrame ?? -1,
});
}

export function shouldUpdateCharacterAnimation(
characterId: string,
frame: number = currentFrame,
): boolean {
const entry = entries.get(characterId);

if (!entry) {
registerAnimationCharacter(characterId);
return true;
}

const performance = getCinematicPerformanceState();

const intervals = UPDATE_INTERVALS[performance.quality];

const interval = intervals[entry.priority];

if (
entry.lastUpdatedFrame >= 0 &&
frame - entry.lastUpdatedFrame < interval
) {
return false;
}

entry.lastUpdatedFrame = frame;

return true;
}

export function getAnimationSchedulerStats(): {
registeredCharacters: number;
speakingCharacters: number;
listeningCharacters: number;
foregroundCharacters: number;
backgroundCharacters: number;
currentFrame: number;
} {
let speakingCharacters = 0;
let listeningCharacters = 0;
let foregroundCharacters = 0;
let backgroundCharacters = 0;

entries.forEach((entry) => {
switch (entry.priority) {
case "speaking":
speakingCharacters += 1;
break;

  case "listening":
    listeningCharacters += 1;
    break;

  case "foreground":
    foregroundCharacters += 1;
    break;

  case "background":
    backgroundCharacters += 1;
    break;
}

});

return {
registeredCharacters: entries.size,
speakingCharacters,
listeningCharacters,
foregroundCharacters,
backgroundCharacters,
currentFrame,
};
}

export function clearAnimationScheduler(): void {
entries.clear();
currentFrame = 0;
  }
