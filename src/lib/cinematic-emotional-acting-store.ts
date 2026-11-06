export type CinematicEmotion =
| "happy"
| "sad"
| "angry"
| "surprised"
| "fearful"
| "confused"
| "amused"
| "concerned"
| "neutral";

export type CinematicGesture =
| "nod"
| "shake"
| "lean"
| "flinch"
| "listen"
| "celebrate"
| "none";

export interface EmotionalActingCue {
characterId: string;
emotion: CinematicEmotion;
gesture: CinematicGesture;
intensity: number;
updatedAt: number;
duration: number;
}

const cues = new Map<string, EmotionalActingCue>();

const listeners = new Set<() => void>();

function notify() {
listeners.forEach((listener) => listener());
}

export function publishEmotionalActingCue(
cue: EmotionalActingCue
) {
cues.set(cue.characterId, {
...cue,
intensity: Math.max(
0,
Math.min(1, cue.intensity)
),
updatedAt: Date.now(),
});

notify();
}

export function getEmotionalActingCue(
characterId: string
): EmotionalActingCue | undefined {
const cue = cues.get(characterId);

if (!cue) return undefined;

if (
Date.now() - cue.updatedAt >
cue.duration
) {
cues.delete(characterId);
notify();
return undefined;
}

return cue;
}

export function clearEmotionalActingCue(
characterId: string
) {
cues.delete(characterId);
notify();
}

export function clearAllEmotionalActingCues() {
cues.clear();
notify();
}

export function subscribeToEmotionalActing(
listener: () => void
) {
listeners.add(listener);

return () => {
listeners.delete(listener);
};
}
