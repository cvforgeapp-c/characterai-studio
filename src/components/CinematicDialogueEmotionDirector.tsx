import { useEffect } from "react";

import type {
  DialoguePlaybackLine,
} from "./CinematicDialoguePlayback";

import {
  publishEmotionalActingCue,
  clearEmotionalActingCue,
} from "../lib/cinematic-emotional-acting-store";

interface Props {
  lines: DialoguePlaybackLine[];
  activeLineId: string | null;
  enabled: boolean;
}

interface EmotionResult {
  emotion:
    | "happy"
    | "sad"
    | "angry"
    | "surprised"
    | "fearful"
    | "confused"
    | "amused"
    | "concerned"
    | "neutral";

  gesture:
    | "nod"
    | "shake"
    | "lean"
    | "flinch"
    | "listen"
    | "celebrate"
    | "none";

  intensity: number;
}

function detectEmotion(text: string): EmotionResult {
  const value = text.toLowerCase();

  if (
    /hilarious|laugh|funny|joke|haha|lol|amazing|wonderful|fantastic/.test(
      value
    )
  ) {
    return {
      emotion: "amused",
      gesture: "celebrate",
      intensity: 0.9,
    };
  }

  if (
    /angry|furious|hate|fight|argument|ridiculous|annoying|shut up/.test(
      value
    )
  ) {
    return {
      emotion: "angry",
      gesture: "shake",
      intensity: 0.9,
    };
  }

  if (
    /surprised|shocked|unbelievable|really\?|what happened|oh no|wow/.test(
      value
    )
  ) {
    return {
      emotion: "surprised",
      gesture: "flinch",
      intensity: 0.85,
    };
  }

  if (
    /scared|afraid|terrified|danger|fear|help me/.test(value)
  ) {
    return {
      emotion: "fearful",
      gesture: "flinch",
      intensity: 0.85,
    };
  }

  if (
    /sad|sorry|cry|miss you|heartbroken|unhappy|lonely/.test(value)
  ) {
    return {
      emotion: "sad",
      gesture: "lean",
      intensity: 0.8,
    };
  }

  if (
    /worried|concerned|problem|trouble|serious|careful/.test(value)
  ) {
    return {
      emotion: "concerned",
      gesture: "listen",
      intensity: 0.7,
    };
  }

  if (
    /confused|why|how|what do you mean|i don't understand/.test(
      value
    )
  ) {
    return {
      emotion: "confused",
      gesture: "shake",
      intensity: 0.75,
    };
  }

  if (
    /happy|excited|great|love|awesome|excellent|congratulations/.test(
      value
    )
  ) {
    return {
      emotion: "happy",
      gesture: "celebrate",
      intensity: 0.8,
    };
  }

  return {
    emotion: "neutral",
    gesture: "nod",
    intensity: 0.5,
  };
}

export default function CinematicDialogueEmotionDirector({
  lines,
  activeLineId,
  enabled,
}: Props) {
  useEffect(() => {
    if (!enabled || !activeLineId) {
      return;
    }

    const activeLine = lines.find(
      (line) => line.id === activeLineId
    );

    if (!activeLine) {
      return;
    }

    const characterId = String(activeLine.characterId);

    const emotion = detectEmotion(
      `${activeLine.text} ${activeLine.action ?? ""}`
    );

    publishEmotionalActingCue({
      characterId,
      emotion: emotion.emotion,
      gesture: emotion.gesture,
      intensity: emotion.intensity,
      updatedAt: Date.now(),
      duration: Math.max(
        1500,
        (activeLine.duration ?? 2.5) * 1000
      ),
    });

    return () => {
      clearEmotionalActingCue(characterId);
    };
  }, [lines, activeLineId, enabled]);

  return null;
}
