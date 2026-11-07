import type { CinematicShot } from "../components/CinematicCameraRig";

export interface SceneDirectionInput {
  title?: string;
  action?: string;
  dialogue?: string;
  sceneIndex?: number;
  characterCount?: number;
}

export interface SceneDirection {
  shot: CinematicShot;
  reason: string;
  intensity: number;
  movement: "static" | "push-in" | "pull-out" | "tracking" | "orbit";
}

export function directCinematicScene(
  scene: SceneDirectionInput
): SceneDirection {
  const title = (scene.title || "").toLowerCase();
  const action = (scene.action || "").toLowerCase();
  const dialogue = (scene.dialogue || "").toLowerCase();

  const text = `${title} ${action} ${dialogue}`;
  const characterCount = scene.characterCount ?? 1;

  if (
    /surprise|shocked|unbelievable|what happened|oh no|really/.test(text)
  ) {
    return {
      shot: "closeup",
      reason: "Emotional reaction",
      intensity: 0.9,
      movement: "push-in",
    };
  }

  if (
    /secret|whisper|suspicious|quietly|mysterious/.test(text)
  ) {
    return {
      shot: "over-shoulder",
      reason: "Suspense and mystery",
      intensity: 0.7,
      movement: "tracking",
    };
  }

  if (
    /fight|angry|argument|shout|furious|conflict/.test(text)
  ) {
    return {
      shot: "low-angle",
      reason: "Dramatic confrontation",
      intensity: 0.95,
      movement: "orbit",
    };
  }

  if (
    /laugh|funny|joke|dance|celebration|party/.test(text)
  ) {
    return {
      shot: characterCount > 1 ? "two-shot" : "medium",
      reason: "Comedy performance",
      intensity: 0.85,
      movement: "tracking",
    };
  }

  if (
    /walking|running|chasing|moving|traveling/.test(text)
  ) {
    return {
      shot: "tracking",
      reason: "Character movement",
      intensity: 0.75,
      movement: "tracking",
    };
  }

  if (
    /ending|final|goodbye|conclusion|last scene/.test(text)
  ) {
    return {
      shot: "wide",
      reason: "Closing cinematic composition",
      intensity: 0.5,
      movement: "pull-out",
    };
  }

  if (characterCount > 1) {
    return {
      shot: "two-shot",
      reason: "Multiple character composition",
      intensity: 0.6,
      movement: "static",
    };
  }

  if ((scene.sceneIndex ?? 0) === 0) {
    return {
      shot: "wide",
      reason: "Establishing shot",
      intensity: 0.5,
      movement: "push-in",
    };
  }

  return {
    shot: "medium",
    reason: "Standard dialogue composition",
    intensity: 0.55,
    movement: "static",
  };
}
