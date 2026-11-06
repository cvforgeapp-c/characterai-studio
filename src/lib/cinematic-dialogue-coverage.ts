import type { DialoguePlaybackLine } from "../components/CinematicDialoguePlayback";

export type DialogueShot =
| "closeup"
| "reverse"
| "twoshot"
| "overtheshoulder"
| "wide"
| "reaction";

export interface DialogueCoverageDecision {
shot: DialogueShot;
characterId: string | null;
focusCharacterId: string | null;
reason: string;
intensity: number;
}

export interface DialogueCoverageOptions {
lines: DialoguePlaybackLine[];
activeLineId: string | null;
characterCount: number;
previousCharacterId?: string | null;
sceneEnding?: boolean;
}

const emotionalWords = [
"love", "hate", "afraid", "scared", "angry",
"sad", "happy", "sorry", "hurt", "lonely",
"terrified", "furious", "heartbroken",
];

const dramaticWords = [
"secret", "truth", "betray", "danger", "never",
"promise", "impossible", "believe", "revenge",
"murder", "disaster", "emergency",
];

const reactionPhrases = [
"really", "no way", "seriously", "wow",
"wait", "what", "are you kidding", "you did",
"i can't believe", "i cannot believe",
"oh my god", "tell me", "why would you",
];

function normalize(value: string): string {
return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function containsAny(text: string, words: string[]): boolean {
return words.some((word) => text.includes(word));
}

function findListener(
lines: DialoguePlaybackLine[],
activeIndex: number,
speakerId: string,
previousCharacterId?: string | null,
): string | null {
if (
previousCharacterId &&
previousCharacterId !== speakerId
) {
return previousCharacterId;
}

for (let i = activeIndex - 1; i >= 0; i--) {
const id = lines[i]?.characterId;

if (id && id !== speakerId) {
  return id;
}

}

for (let i = activeIndex + 1; i < lines.length; i++) {
const id = lines[i]?.characterId;

if (id && id !== speakerId) {
  return id;
}

}

return lines.find(
(line) => line.characterId !== speakerId,
)?.characterId ?? null;
}

export function directDialogueCoverage(
options: DialogueCoverageOptions,
): DialogueCoverageDecision {
const {
lines,
activeLineId,
characterCount,
previousCharacterId,
sceneEnding,
} = options;

const activeIndex = lines.findIndex(
(line) => line.id === activeLineId,
);

const activeLine =
activeIndex >= 0 ? lines[activeIndex] : null;

const speakerId = activeLine?.characterId ?? null;

if (sceneEnding) {
return {
shot: "wide",
characterId: speakerId,
focusCharacterId: null,
reason: "Return to a wide shot at the end of the scene.",
intensity: 0.5,
};
}

if (!activeLine || !speakerId) {
return {
shot: characterCount > 1 ? "twoshot" : "wide",
characterId: null,
focusCharacterId: null,
reason: "Establish the scene while waiting for dialogue.",
intensity: 0.45,
};
}

if (characterCount <= 1) {
const emotional = containsAny(
normalize(activeLine.text),
emotionalWords,
);

return {
  shot: emotional ? "closeup" : "wide",
  characterId: speakerId,
  focusCharacterId: speakerId,
  reason: emotional
    ? "Emphasize the character's emotional delivery."
    : "Keep the single character clearly framed.",
  intensity: emotional ? 0.85 : 0.5,
};

}

const text = normalize(activeLine.text);

const listenerId = findListener(
lines,
activeIndex,
speakerId,
previousCharacterId,
);

const emotional = containsAny(text, emotionalWords);
const dramatic = containsAny(text, dramaticWords);

const reactionCue =
containsAny(text, reactionPhrases) ||
/[!?]{1,}/.test(activeLine.text);

if (listenerId && (reactionCue || (emotional && dramatic))) {
return {
shot: "reaction",
characterId: speakerId,
focusCharacterId: listenerId,
reason: "Cut to the listener to capture their reaction.",
intensity: 0.9,
};
}

if (emotional || dramatic) {
return {
shot: "closeup",
characterId: speakerId,
focusCharacterId: speakerId,
reason: "Use a close-up to emphasize the speaker's delivery.",
intensity: 0.9,
};
}

const previousLine =
activeIndex > 0 ? lines[activeIndex - 1] : null;

if (
previousLine &&
previousLine.characterId !== speakerId
) {
return {
shot: "overtheshoulder",
characterId: speakerId,
focusCharacterId: speakerId,
reason: "Show the new speaker from the conversation partner's perspective.",
intensity: 0.7,
};
}

return {
shot: "twoshot",
characterId: speakerId,
focusCharacterId: speakerId,
reason: "Keep both characters visible during the exchange.",
intensity: 0.6,
};
}
