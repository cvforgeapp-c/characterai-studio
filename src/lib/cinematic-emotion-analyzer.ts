import type {
CinematicEmotion,
CinematicGesture,
} from "./cinematic-emotional-acting-store";

export interface EmotionAnalysis {
emotion: CinematicEmotion;
gesture: CinematicGesture;
intensity: number;
}

const emotionWords: Record<
Exclude<CinematicEmotion, "neutral">,
string[]

«= {
happy: [
"happy", "wonderful", "great", "amazing",
"love", "fantastic", "excited", "awesome",
"congratulations", "beautiful",
],»

sad: [
"sad", "sorry", "cry", "lost", "miss",
"lonely", "heartbroken", "goodbye",
"disappointed", "pain",
],

angry: [
"angry", "furious", "hate", "stupid",
"annoyed", "enough", "unacceptable",
"ridiculous", "idiot", "stop",
],

surprised: [
"wow", "really", "seriously", "impossible",
"unbelievable", "what", "surprise",
"no way", "shocked",
],

fearful: [
"scared", "afraid", "terrified", "danger",
"help", "run", "monster", "emergency",
"worried", "panic",
],

confused: [
"confused", "why", "how", "what happened",
"understand", "explain", "strange",
"weird", "huh",
],

amused: [
"funny", "haha", "hahaha", "lol",
"joke", "laugh", "hilarious", "kidding",
],

concerned: [
"careful", "are you okay", "are you alright",
"problem", "worried", "serious", "hurt",
"what happened",
],
};

export function analyzeDialogueEmotion(
input: string
): EmotionAnalysis {
const text = input.toLowerCase();

let bestEmotion: CinematicEmotion = "neutral";
let bestScore = 0;

for (const [emotion, words] of Object.entries(
emotionWords
)) {
const score = words.reduce(
(total, word) =>
total + (text.includes(word) ? 1 : 0),
0
);

if (score > bestScore) {
  bestScore = score;
  bestEmotion = emotion as CinematicEmotion;
}

}

const punctuationIntensity =
/[!?]{2,}/.test(input) ? 0.2 :
/[!?]/.test(input) ? 0.1 : 0;

const intensity = Math.min(
1,
0.45 + bestScore * 0.12 + punctuationIntensity
);

let gesture: CinematicGesture = "none";

switch (bestEmotion) {
case "happy":
case "amused":
gesture = "celebrate";
break;

case "sad":
case "concerned":
  gesture = "lean";
  break;

case "angry":
  gesture = "shake";
  break;

case "surprised":
case "fearful":
  gesture = "flinch";
  break;

case "confused":
  gesture = "shake";
  break;

default:
  gesture = "none";

}

return {
emotion: bestEmotion,
gesture,
intensity,
};
}

export function analyzeListenerReaction(
speakerEmotion: CinematicEmotion
): EmotionAnalysis {
switch (speakerEmotion) {
case "happy":
case "amused":
return {
emotion: "happy",
gesture: "nod",
intensity: 0.65,
};

case "sad":
  return {
    emotion: "concerned",
    gesture: "lean",
    intensity: 0.75,
  };

case "angry":
  return {
    emotion: "fearful",
    gesture: "flinch",
    intensity: 0.8,
  };

case "surprised":
  return {
    emotion: "surprised",
    gesture: "flinch",
    intensity: 0.85,
  };

case "fearful":
  return {
    emotion: "concerned",
    gesture: "flinch",
    intensity: 0.8,
  };

case "confused":
  return {
    emotion: "confused",
    gesture: "shake",
    intensity: 0.65,
  };

default:
  return {
    emotion: "neutral",
    gesture: "listen",
    intensity: 0.4,
  };

}
  }
