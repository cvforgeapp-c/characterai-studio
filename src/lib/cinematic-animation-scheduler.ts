export type AnimationPriority =
| "speaking"
| "listening"
| "foreground"
| "background";

interface AnimationCharacterEntry {
characterId: string;
priority: AnimationPriority;
lastUpdatedFrame: number;
registrationCount: number;
}

export interface AnimationSchedulerStats {
totalCharacters: number;
speaking: number;
listening: number;
foreground: number;
background: number;
currentFrame: number;
}

const animationCharacters = new Map<
string,
AnimationCharacterEntry

«();»

let currentFrame = 0;

const QUALITY_INTERVALS = {
high: {
speaking: 1,
listening: 1,
foreground: 1,
background: 2,
},
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
} as const;

type SchedulerQuality = keyof typeof QUALITY_INTERVALS;

let currentQuality: SchedulerQuality = "high";

/**

* Advances the global animation frame.
* Call this once per rendered frame from the scheduler controller.
  */
  export function advanceAnimationFrame(): number {
  currentFrame += 1;
  return currentFrame;
  }

/**

* Returns the current global animation frame.
  */
  export function getAnimationFrame(): number {
  return currentFrame;
  }

/**

* Registers a character.
* 
* Multiple components can register the same character safely.
* Each registration must have a matching unregister call.
  */
  export function registerAnimationCharacter(
  characterId: string,
  priority: AnimationPriority = "background"
  ): void {
  if (!characterId) return;

const existing = animationCharacters.get(characterId);

if (existing) {
existing.registrationCount += 1;
existing.priority = priority;
return;
}

animationCharacters.set(characterId, {
characterId,
priority,
lastUpdatedFrame: -Infinity,
registrationCount: 1,
});
}

/**

* Unregisters one registration.
* 
* The character is removed only after all components
* that registered it have unregistered.
  */
  export function unregisterAnimationCharacter(
  characterId: string
  ): void {
  const existing = animationCharacters.get(characterId);

if (!existing) return;

existing.registrationCount -= 1;

if (existing.registrationCount <= 0) {
animationCharacters.delete(characterId);
}
}

/**

* Checks whether a character is currently registered.
  */
  export function isAnimationCharacterRegistered(
  characterId: string
  ): boolean {
  return animationCharacters.has(characterId);
  }

/**

* Returns the number of active registrations for a character.
  */
  export function getAnimationRegistrationCount(
  characterId: string
  ): number {
  return animationCharacters.get(characterId)?.registrationCount ?? 0;
  }

/**

* Changes the animation priority of a registered character.
  */
  export function setAnimationPriority(
  characterId: string,
  priority: AnimationPriority
  ): void {
  const entry = animationCharacters.get(characterId);

if (!entry) return;

entry.priority = priority;
}

/**

* Changes the global scheduler quality.
  */
  export function setAnimationSchedulerQuality(
  quality: SchedulerQuality
  ): void {
  currentQuality = quality;
  }

/**

* Returns the current scheduler quality.
  */
  export function getAnimationSchedulerQuality(): SchedulerQuality {
  return currentQuality;
  }

/**

* Determines whether a character should update on this frame.
  */
  export function shouldUpdateCharacterAnimation(
  characterId: string,
  frame: number = currentFrame
  ): boolean {
  const entry = animationCharacters.get(characterId);

// Unregistered characters are not throttled.
if (!entry) return true;

const interval =
QUALITY_INTERVALS[currentQuality][entry.priority];

if (frame - entry.lastUpdatedFrame < interval) {
return false;
}

entry.lastUpdatedFrame = frame;

return true;
}

/**

* Returns scheduler statistics for monitoring.
  */
  export function getAnimationSchedulerStats(): AnimationSchedulerStats {
  const stats: AnimationSchedulerStats = {
  totalCharacters: animationCharacters.size,
  speaking: 0,
  listening: 0,
  foreground: 0,
  background: 0,
  currentFrame,
  };

animationCharacters.forEach((entry) => {
stats[entry.priority] += 1;
});

return stats;
}

/**

* Clears all registrations and resets the frame counter.
  */
  export function clearAnimationScheduler(): void {
  animationCharacters.clear();
  currentFrame = 0;
  currentQuality = "high";
    }
