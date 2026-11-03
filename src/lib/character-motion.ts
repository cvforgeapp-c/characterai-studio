export type CharacterAction =
  | "idle"
  | "talk"
  | "walk"
  | "jump"
  | "laugh"
  | "cry"
  | "angry"
  | "surprised"
  | "blink"
  | "wave"
  | "dance";

export interface CharacterMotionState {
  bodyY: number;
  bodyRotationX: number;
  bodyRotationZ: number;
  headRotationX: number;
  headRotationY: number;
  headRotationZ: number;
  leftArmRotationZ: number;
  rightArmRotationZ: number;
  mouthOpen: number;
  eyeScale: number;
  blink: number;
}

export interface MotionOptions {
  action: CharacterAction;
  time: number;
  intensity?: number;
  speechLevel?: number;
  characterOffset?: number;
}

const clamp = (
  value: number,
  minimum: number,
  maximum: number
) => Math.max(minimum, Math.min(maximum, value));

const wave = (time: number, speed: number, offset = 0) =>
  Math.sin(time * speed + offset);

export function createCharacterMotion({
  action,
  time,
  intensity = 1,
  speechLevel = 0,
  characterOffset = 0
}: MotionOptions): CharacterMotionState {
  const t = time + characterOffset;
  const power = clamp(intensity, 0, 2);
  const speech = clamp(speechLevel, 0, 1);

  const state: CharacterMotionState = {
    bodyY: 0,
    bodyRotationX: 0,
    bodyRotationZ: 0,
    headRotationX: 0,
    headRotationY: 0,
    headRotationZ: 0,
    leftArmRotationZ: 0,
    rightArmRotationZ: 0,
    mouthOpen: 0,
    eyeScale: 1,
    blink: 0
  };

  switch (action) {
    case "idle":
      state.bodyY = wave(t, 2) * 0.035;
      state.headRotationY = wave(t, 0.8) * 0.08;
      state.bodyRotationZ = wave(t, 1.2) * 0.025;
      break;

    case "talk":
      state.bodyY = wave(t, 3) * 0.025;
      state.headRotationY = wave(t, 2) * 0.08;
      state.mouthOpen =
        Math.abs(wave(t, 10)) * 0.55 * speech;
      state.rightArmRotationZ = wave(t, 3) * 0.12;
      break;

    case "walk":
      state.bodyY = Math.abs(wave(t, 7)) * 0.12 * power;
      state.bodyRotationX = wave(t, 7) * 0.08;
      state.leftArmRotationZ = wave(t, 7) * 0.45;
      state.rightArmRotationZ = -wave(t, 7) * 0.45;
      state.headRotationY = wave(t, 3.5) * 0.06;
      break;

    case "jump":
      state.bodyY =
        Math.max(0, wave(t, 4)) * 0.8 * power;
      state.bodyRotationZ = wave(t, 4) * 0.08;
      state.leftArmRotationZ = -0.8 * power;
      state.rightArmRotationZ = 0.8 * power;
      break;

    case "laugh":
      state.bodyY =
        Math.abs(wave(t, 9)) * 0.13 * power;
      state.bodyRotationX = wave(t, 9) * 0.12;
      state.headRotationX = -0.12;
      state.headRotationZ = wave(t, 9) * 0.1;
      state.mouthOpen = 0.75;
      state.leftArmRotationZ = -0.3;
      state.rightArmRotationZ = 0.3;
      break;

    case "cry":
      state.headRotationX = 0.3;
      state.headRotationZ = wave(t, 3) * 0.05;
      state.bodyY = wave(t, 3) * 0.025;
      state.mouthOpen = 0.18;
      state.leftArmRotationZ = -0.12;
      state.rightArmRotationZ = 0.12;
      break;

    case "angry":
      state.headRotationX = -0.08;
      state.headRotationZ = wave(t, 8) * 0.025;
      state.bodyRotationX = -0.06;
      state.bodyY = wave(t, 8) * 0.025;
      state.mouthOpen = 0.12;
      state.leftArmRotationZ = -0.25;
      state.rightArmRotationZ = 0.25;
      break;

    case "surprised":
      state.bodyY = 0.12;
      state.headRotationX = -0.15;
      state.eyeScale = 1.35;
      state.mouthOpen = 0.85;
      state.leftArmRotationZ = -0.65;
      state.rightArmRotationZ = 0.65;
      break;

    case "blink":
      state.blink = Math.max(
        0,
        Math.cos(t * 5)
      );
      state.eyeScale = 1 - state.blink * 0.9;
      break;

    case "wave":
      state.bodyY = wave(t, 2) * 0.025;
      state.rightArmRotationZ =
        -1.1 + wave(t, 7) * 0.35;
      state.leftArmRotationZ = 0.08;
      state.headRotationY = wave(t, 2) * 0.12;
      break;

    case "dance":
      state.bodyY =
        Math.abs(wave(t, 5)) * 0.18 * power;
      state.bodyRotationZ = wave(t, 5) * 0.35;
      state.headRotationZ = wave(t, 5) * 0.2;
      state.leftArmRotationZ = wave(t, 5) * 0.8;
      state.rightArmRotationZ = -wave(t, 5) * 0.8;
      break;
  }

  return state;
}
