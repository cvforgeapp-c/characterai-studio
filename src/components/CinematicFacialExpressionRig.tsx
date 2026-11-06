import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import {
  getLiveCharacterObject,
  getRegisteredCharacterIds,
} from "../lib/cinematic-live-target-store";

import {
  getEmotionalActingCue,
  type CinematicEmotion,
} from "../lib/cinematic-emotional-acting-store";

import {
  subscribeToSpeechPerformance,
} from "../lib/synchronized-speech";

type FacialChannel =
  | "smile"
  | "frown"
  | "angry"
  | "surprised"
  | "fearful"
  | "confused"
  | "concerned"
  | "jaw"
  | "mouth"
  | "blink"
  | "browUp"
  | "browDown"
  | "cheek"
  | "wideEyes";

interface MorphTargetEntry {
  influences: number[];
  index: number;
  base: number;
  channel: FacialChannel;
}

interface CharacterFaceState {
  root: THREE.Object3D;
  targets: MorphTargetEntry[];
  speaking: boolean;
  speechStartedAt: number;
  speechPulse: number;
  lastBoundaryAt: number;
  speechProgress: number;
}

const characterFaces = new Map<string, CharacterFaceState>();

const SMOOTHING = 9;

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function detectFacialChannel(
  originalName: string,
): FacialChannel | null {
  const name = normalizeName(originalName);

  if (
    name.includes("jawopen") ||
    name.includes("jawdrop") ||
    name === "jaw"
  ) {
    return "jaw";
  }

  if (
    name.includes("mouthopen") ||
    name.includes("mouthwide") ||
    name.includes("visemeaa") ||
    name.includes("visemeoh") ||
    name.includes("visemeah")
  ) {
    return "mouth";
  }

  if (
    name.includes("smile") ||
    name.includes("happy")
  ) {
    return "smile";
  }

  if (
    name.includes("frown") ||
    name.includes("sad")
  ) {
    return "frown";
  }

  if (
    name.includes("browdown") ||
    name.includes("browlower") ||
    name.includes("angry")
  ) {
    return "angry";
  }

  if (
    name.includes("browinnerup") ||
    name.includes("browraise") ||
    name.includes("browup")
  ) {
    return "browUp";
  }

  if (
    name.includes("browouterdown") ||
    name.includes("browlower")
  ) {
    return "browDown";
  }

  if (
    name.includes("surprise") ||
    name.includes("astonish")
  ) {
    return "surprised";
  }

  if (
    name.includes("fear") ||
    name.includes("scared")
  ) {
    return "fearful";
  }

  if (
    name.includes("confus")
  ) {
    return "confused";
  }

  if (
    name.includes("concern") ||
    name.includes("worried")
  ) {
    return "concerned";
  }

  if (
    name.includes("squint") ||
    name.includes("cheek")
  ) {
    return "cheek";
  }

  if (
    name.includes("eyewide") ||
    name.includes("eyeopen")
  ) {
    return "wideEyes";
  }

  if (
    name.includes("blink") ||
    name.includes("eyeblink")
  ) {
    return "blink";
  }

  return null;
}

function buildCharacterFace(
  characterId: string,
  root: THREE.Object3D,
): CharacterFaceState {
  const targets: MorphTargetEntry[] = [];

  root.traverse((object) => {
    const mesh = object as THREE.Mesh & {
      morphTargetDictionary?: Record<string, number>;
      morphTargetInfluences?: number[];
    };

    const dictionary = mesh.morphTargetDictionary;
    const influences = mesh.morphTargetInfluences;

    if (!dictionary || !influences) return;

    for (const [name, index] of Object.entries(dictionary)) {
      if (typeof index !== "number") continue;
      if (index < 0 || index >= influences.length) continue;

      const channel = detectFacialChannel(name);

      if (!channel) continue;

      targets.push({
        influences,
        index,
        base: influences[index] ?? 0,
        channel,
      });
    }
  });

  const state: CharacterFaceState = {
    root,
    targets,
    speaking: false,
    speechStartedAt: 0,
    speechPulse: 0,
    lastBoundaryAt: 0,
    speechProgress: 0,
  };

  characterFaces.set(characterId, state);

  return state;
}

function getEmotionWeights(
  emotion: CinematicEmotion | undefined,
  intensity: number,
): Partial<Record<FacialChannel, number>> {
  const amount = THREE.MathUtils.clamp(intensity, 0, 1);

  switch (emotion) {
    case "happy":
    case "amused":
      return {
        smile: 0.8 * amount,
        cheek: 0.45 * amount,
        browUp: 0.12 * amount,
      };

    case "sad":
      return {
        frown: 0.75 * amount,
        browUp: 0.35 * amount,
        browDown: 0.2 * amount,
      };

    case "angry":
      return {
        angry: 0.85 * amount,
        browDown: 0.7 * amount,
        frown: 0.35 * amount,
      };

    case "surprised":
      return {
        surprised: 0.8 * amount,
        wideEyes: 0.85 * amount,
        browUp: 0.75 * amount,
        jaw: 0.35 * amount,
      };

    case "fearful":
      return {
        fearful: 0.7 * amount,
        wideEyes: 0.75 * amount,
        browUp: 0.45 * amount,
        jaw: 0.15 * amount,
      };

    case "confused":
      return {
        confused: 0.6 * amount,
        browUp: 0.35 * amount,
        browDown: 0.15 * amount,
      };

    case "concerned":
      return {
        concerned: 0.65 * amount,
        frown: 0.35 * amount,
        browUp: 0.25 * amount,
      };

    default:
      return {};
  }
}

function getChannelValue(
  channel: FacialChannel,
  weights: Partial<Record<FacialChannel, number>>,
): number {
  return weights[channel] ?? 0;
}

function getSpeechMouthValue(
  state: CharacterFaceState,
  now: number,
): number {
  if (!state.speaking) return 0;

  const elapsed = (now - state.speechStartedAt) / 1000;

  // Natural fallback mouth movement when browser speech
  // does not provide word-boundary events.
  const basePulse =
    Math.abs(Math.sin(elapsed * 8.5)) * 0.42 +
    Math.abs(Math.sin(elapsed * 4.2)) * 0.2;

  const boundaryAge = now - state.lastBoundaryAt;

  const boundaryPulse =
    boundaryAge < 180
      ? (1 - boundaryAge / 180) * 0.45
      : 0;

  return THREE.MathUtils.clamp(
    Math.max(basePulse, boundaryPulse),
    0,
    0.75,
  );
}

function getCombinedWeights(
  emotion: CinematicEmotion | undefined,
  intensity: number,
  speech: number,
): Partial<Record<FacialChannel, number>> {
  const emotionWeights = getEmotionWeights(
    emotion,
    intensity,
  );

  return {
    ...emotionWeights,

    // Speech affects mouth and jaw independently
    // so the emotion remains visible while speaking.
    mouth: speech * 0.85,
    jaw: Math.max(
      emotionWeights.jaw ?? 0,
      speech * 0.55,
    ),
  };
}

export default function CinematicFacialExpressionRig() {
  const lastFrameTime = useRef(0);

  useEffect(() => {
    const unsubscribe = subscribeToSpeechPerformance(
      (event) => {
        const characterId = event.characterId;

        if (!characterId) return;

        const root = getLiveCharacterObject(characterId);

        if (!root) return;

        let state = characterFaces.get(characterId);

        if (!state || state.root !== root) {
          state = buildCharacterFace(characterId, root);
        }

        const now = performance.now();

        if (event.type === "start") {
          state.speaking = true;
          state.speechStartedAt = now;
          state.speechProgress = 0;
          state.lastBoundaryAt = now;
        }

        if (event.type === "boundary") {
          state.speaking = true;
          state.lastBoundaryAt = now;

          if (typeof event.charIndex === "number") {
            state.speechProgress = event.charIndex;
          }
        }

        if (
          event.type === "end" ||
          event.type === "error" ||
          event.type === "cancel"
        ) {
          state.speaking = false;
          state.speechPulse = 0;
        }
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

  useFrame((_, delta) => {
    const now = performance.now();

    const safeDelta = Math.min(delta, 0.05);

    const smoothing =
      1 - Math.exp(-SMOOTHING * safeDelta);

    const registeredIds = getRegisteredCharacterIds();

    const registeredSet = new Set(registeredIds);

    for (const characterId of registeredIds) {
      const root = getLiveCharacterObject(characterId);

      if (!root) continue;

      let state = characterFaces.get(characterId);

      if (!state || state.root !== root) {
        state = buildCharacterFace(characterId, root);
      }

      const cue = getEmotionalActingCue(characterId);

      const cueIsActive =
        !!cue &&
        now - cue.updatedAt < cue.duration;

      const emotion = cueIsActive
        ? cue?.emotion
        : undefined;

      const intensity = cueIsActive
        ? cue?.intensity ?? 0
        : 0;

      const speech = getSpeechMouthValue(state, now);

      state.speechPulse = speech;

      const weights = getCombinedWeights(
        emotion,
        intensity,
        speech,
      );

      for (const target of state.targets) {
        const desired =
          target.base +
          getChannelValue(target.channel, weights);

        const clamped = THREE.MathUtils.clamp(
          desired,
          0,
          1,
        );

        const current =
          target.influences[target.index] ?? target.base;

        target.influences[target.index] =
          THREE.MathUtils.lerp(
            current,
            clamped,
            smoothing,
          );
      }
    }

    // Remove states for characters no longer registered.
    for (const characterId of characterFaces.keys()) {
      if (!registeredSet.has(characterId)) {
        characterFaces.delete(characterId);
      }
    }

    lastFrameTime.current = now;
  });

  return null;
  }
