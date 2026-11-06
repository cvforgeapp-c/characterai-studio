export type Viseme =
  | "A"
  | "E"
  | "O"
  | "U"
  | "M"
  | "F"
  | "REST";

export interface VisemeFrame {
  viseme: Viseme;
  intensity: number;
  duration: number;
}

const VOWEL_MAP: Record<string, Viseme> = {
  a: "A",
  e: "E",
  i: "E",
  o: "O",
  u: "U",
  y: "E",
};

const CONSONANT_MAP: Record<string, Viseme> = {
  m: "M",
  b: "M",
  p: "M",
  f: "F",
  v: "F",
};

export function getViseme(character: string): Viseme {
  const letter = character.toLowerCase();

  if (VOWEL_MAP[letter]) {
    return VOWEL_MAP[letter];
  }

  if (CONSONANT_MAP[letter]) {
    return CONSONANT_MAP[letter];
  }

  if (letter === " " || /[.,!?;:]/.test(letter)) {
    return "REST";
  }

  return "A";
}

export function generateVisemeSequence(
  text: string,
  characterDuration = 75,
): VisemeFrame[] {
  const frames: VisemeFrame[] = [];

  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    const viseme = getViseme(character);

    const intensity =
      viseme === "REST"
        ? 0
        : viseme === "M"
          ? 0.12
          : viseme === "F"
            ? 0.3
            : 0.75;

    frames.push({
      viseme,
      intensity,
      duration:
        viseme === "REST"
          ? characterDuration * 1.4
          : characterDuration,
    });
  }

  return frames;
}

export function getVisemeAtTime(
  frames: VisemeFrame[],
  elapsedMilliseconds: number,
): VisemeFrame {
  let elapsed = 0;

  for (const frame of frames) {
    elapsed += frame.duration;

    if (elapsedMilliseconds <= elapsed) {
      return frame;
    }
  }

  return {
    viseme: "REST",
    intensity: 0,
    duration: 0,
  };
}

export function getVisemeWeights(
  viseme: Viseme,
  intensity: number,
): Record<Viseme, number> {
  const weights: Record<Viseme, number> = {
    A: 0,
    E: 0,
    O: 0,
    U: 0,
    M: 0,
    F: 0,
    REST: 0,
  };

  weights[viseme] = intensity;

  return weights;
}
