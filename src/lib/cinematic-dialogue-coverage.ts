import type { DialoguePlaybackLine } from "../components/CinematicDialoguePlayback";

export type DialogueShot =
| "closeup"
| "reverse"
| "twoshot"
| "overtheshoulder"
| "wide";

export interface DialogueCoverageDecision {
shot: DialogueShot;
characterId: string | null;
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

const EMOTIONAL_WORDS = [
"shocked",
"surprised",
"angry",
"furious",
"afraid",
"scared",
"terrified",
"cry",
"sad",
"serious",
"unbelievable",
"really",
"what",
"why",
"never",
"secret",
"wait",
"stop",
];

const DRAMATIC_WORDS = [
"listen",
"impossible",
"danger",
"truth",
"betray",
"love",
"hate",
"sorry",
"goodbye",
"finally",
];

function containsAny(
text: string,
words: string[]
): boolean {
const normalized = text.toLowerCase();

return words.some((word) =>
normalized.includes(word)
);
}

export function directDialogueCoverage({
lines,
activeLineId,
characterCount,
previousCharacterId = null,
sceneEnding = false,
}: DialogueCoverageOptions): DialogueCoverageDecision {
const activeIndex = lines.findIndex(
(line) => line.id === activeLineId
);

const activeLine =
activeIndex >= 0 ? lines[activeIndex] : null;

if (sceneEnding) {
return {
shot: "wide",
characterId: null,
reason: "Scene-ending establishing shot.",
intensity: 0.3,
};
}

if (!activeLine) {
return {
shot: characterCount > 1 ? "twoshot" : "wide",
characterId: null,
reason: "No active dialogue. Establish the scene.",
intensity: 0.25,
};
}

const text = activeLine.text.trim();

const speakerId = activeLine.characterId;

const previousLine =
activeIndex > 0
? lines[activeIndex - 1]
: null;

const previousSpeaker =
previousLine?.characterId ??
previousCharacterId;

const isNewSpeaker =
previousSpeaker !== null &&
previousSpeaker !== speakerId;

const emotional =
containsAny(text, EMOTIONAL_WORDS);

const dramatic =
containsAny(text, DRAMATIC_WORDS);

const isShortReaction =
text.length > 0 &&
text.length < 48 &&
/[!?]/.test(text);

if (characterCount <= 1) {
return {
shot: emotional || dramatic
? "closeup"
: "wide",
characterId: speakerId,
reason: emotional
? "Emotional dialogue close-up."
: "Single-character dialogue coverage.",
intensity: emotional ? 0.9 : 0.45,
};
}

if (emotional || dramatic) {
return {
shot: "closeup",
characterId: speakerId,
reason: "Emotional or dramatic dialogue emphasis.",
intensity: emotional ? 0.95 : 0.8,
};
}

if (isShortReaction && isNewSpeaker) {
return {
shot: "reverse",
characterId: speakerId,
reason: "Reaction shot for the new speaker.",
intensity: 0.8,
};
}

if (isNewSpeaker) {
return {
shot: "overtheshoulder",
characterId: speakerId,
reason: "Conversational reverse coverage.",
intensity: 0.65,
};
}

return {
shot: "closeup",
characterId: speakerId,
reason: "Maintain focus on the active speaker.",
intensity: 0.55,
};
  }
