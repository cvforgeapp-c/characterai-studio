import type { CinematicActingSettings } from "../components/CinematicActingPanel";

type Emotion = CinematicActingSettings["emotion"];
type Gesture = CinematicActingSettings["gesture"];
type EyeFocus = CinematicActingSettings["eyeFocus"];

interface DialoguePerformance {
emotion: Emotion;
gesture: Gesture;
eyeFocus: EyeFocus;
intensity: number;
}

const rules: Array<{
keywords: string[];
emotion: Emotion;
gesture: Gesture;
eyeFocus: EyeFocus;
intensity: number;
}> = [
{
keywords: [
"what?!",
"what happened",
"no way",
"unbelievable",
"seriously?!",
"oh my god",
"surprise",
"shocked",
],
emotion: "surprised" as Emotion,
gesture: "hands-up" as Gesture,
eyeFocus: "camera" as EyeFocus,
intensity: 0.95,
},
{
keywords: [
"angry",
"furious",
"hate",
"stop it",
"enough",
"shut up",
"ridiculous",
],
emotion: "angry" as Emotion,
gesture: "point" as Gesture,
eyeFocus: "character" as EyeFocus,
intensity: 0.9,
},
{
keywords: [
"haha",
"hahaha",
"funny",
"laugh",
"joke",
" hilarious",
"lol",
],
emotion: "happy" as Emotion,
gesture: "laugh" as Gesture,
eyeFocus: "camera" as EyeFocus,
intensity: 0.9,
},
{
keywords: [
"sad",
"sorry",
"miss you",
"heartbroken",
"lonely",
"cry",
"terrible",
],
emotion: "sad" as Emotion,
gesture: "head-down" as Gesture,
eyeFocus: "down" as EyeFocus,
intensity: 0.8,
},
{
keywords: [
"suspicious",
"really?",
"are you sure",
"i don't trust",
"something is wrong",
"secret",
"lying",
],
emotion: "suspicious" as Emotion,
gesture: "thinking" as Gesture,
eyeFocus: "character" as EyeFocus,
intensity: 0.8,
},
{
keywords: [
"i can do it",
"trust me",
"i am the best",
"confident",
"definitely",
"no problem",
],
emotion: "confident" as Emotion,
gesture: "hands-on-hips" as Gesture,
eyeFocus: "camera" as EyeFocus,
intensity: 0.85,
},
{
keywords: [
"amazing",
"wonderful",
"fantastic",
"great news",
"excellent",
"celebrate",
"we did it",
],
emotion: "excited" as Emotion,
gesture: "celebration" as Gesture,
eyeFocus: "camera" as EyeFocus,
intensity: 0.95,
},
{
keywords: [
"hmm",
"let me think",
"i wonder",
"maybe",
"perhaps",
"interesting",
],
emotion: "thinking" as Emotion,
gesture: "thinking" as Gesture,
eyeFocus: "up" as EyeFocus,
intensity: 0.55,
},
];

function containsKeyword(text: string, keyword: string): boolean {
return text.includes(keyword.trim());
}

export function detectDialoguePerformance(
dialogue: string
): Partial<CinematicActingSettings> {
const text = dialogue.toLowerCase().trim();

if (!text) {
return {
emotion: "neutral" as Emotion,
gesture: "idle" as Gesture,
eyeFocus: "camera" as EyeFocus,
intensity: 0.35,
isSpeaking: false,
};
}

const matchedRule = rules.find((rule) =>
rule.keywords.some((keyword) => containsKeyword(text, keyword))
);

let result: DialoguePerformance = matchedRule
? {
emotion: matchedRule.emotion,
gesture: matchedRule.gesture,
eyeFocus: matchedRule.eyeFocus,
intensity: matchedRule.intensity,
}
: {
emotion: "neutral" as Emotion,
gesture: "idle" as Gesture,
eyeFocus: "camera" as EyeFocus,
intensity: 0.5,
};

// Punctuation adds subtle performance emphasis.
if (text.includes("!!!")) {
result = {
...result,
intensity: Math.min(1, result.intensity + 0.12),
};
} else if (text.includes("!")) {
result = {
...result,
intensity: Math.min(1, result.intensity + 0.06),
};
}

if (text.includes("...")) {
result = {
...result,
intensity: Math.max(0.25, result.intensity - 0.12),
};
}

return {
emotion: result.emotion,
gesture: result.gesture,
eyeFocus: result.eyeFocus,
intensity: result.intensity,
isSpeaking: true,
};
}

export function getDialogueEmotion(dialogue: string): Emotion {
return (
detectDialoguePerformance(dialogue).emotion ??
("neutral" as Emotion)
);
}

export function getDialogueGesture(dialogue: string): Gesture {
return (
detectDialoguePerformance(dialogue).gesture ??
("idle" as Gesture)
);
}

export function getDialogueEyeFocus(dialogue: string): EyeFocus {
return (
detectDialoguePerformance(dialogue).eyeFocus ??
("camera" as EyeFocus)
);
  }
