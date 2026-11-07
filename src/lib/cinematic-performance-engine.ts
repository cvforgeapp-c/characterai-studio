import {
  DEFAULT_ACTING_SETTINGS,
  type CinematicActingSettings,
} from "../components/CinematicActingPanel";

export interface CharacterPerformance {
  characterId: string;
  characterName: string;
  settings: CinematicActingSettings;
  isActive: boolean;
}

export interface PerformanceCue {
  id: string;
  characterId: string;
  characterName: string;
  dialogue: string;
  startTime: number;
  duration: number;
  settings: CinematicActingSettings;
}

export type PerformanceMap = Record<
  string,
  CharacterPerformance
>;

export function createPerformanceMap(
  characterIds: string[]
): PerformanceMap {
  const result: PerformanceMap = {};

  for (const id of characterIds) {
    result[id] = {
      characterId: id,
      characterName: id,
      settings: { ...DEFAULT_ACTING_SETTINGS },
      isActive: false,
    };
  }

  return result;
}

export function updateCharacterPerformance(
  current: PerformanceMap,
  characterId: string,
  settings: CinematicActingSettings
): PerformanceMap {
  return {
    ...current,
    [characterId]: {
      characterId,
      characterName:
        current[characterId]?.characterName ?? characterId,
      settings: { ...settings },
      isActive: true,
    },
  };
}

export function resetCharacterPerformance(
  current: PerformanceMap,
  characterId: string
): PerformanceMap {
  if (!current[characterId]) return current;

  return {
    ...current,
    [characterId]: {
      ...current[characterId],
      settings: { ...DEFAULT_ACTING_SETTINGS },
      isActive: false,
    },
  };
}

export function resetAllPerformances(
  current: PerformanceMap
): PerformanceMap {
  const result: PerformanceMap = {};

  for (const id of Object.keys(current)) {
    result[id] = {
      ...current[id],
      settings: { ...DEFAULT_ACTING_SETTINGS },
      isActive: false,
    };
  }

  return result;
}

export function getCharacterPerformance(
  performances: PerformanceMap,
  characterId: string
): CinematicActingSettings {
  return (
    performances[characterId]?.settings ??
    DEFAULT_ACTING_SETTINGS
  );
}

export function createPerformanceCues(
  lines: Array<{
    id: string;
    characterId: string;
    characterName: string;
    text: string;
    duration?: number;
  }>,
  secondsPerCharacter: number = 3
): PerformanceCue[] {
  let currentTime = 0;

  return lines.map((line) => {
    const duration = Math.max(
      1,
      line.duration ?? secondsPerCharacter
    );

    const cue: PerformanceCue = {
      id: line.id,
      characterId: line.characterId,
      characterName: line.characterName,
      dialogue: line.text,
      startTime: currentTime,
      duration,
      settings: { ...DEFAULT_ACTING_SETTINGS },
    };

    currentTime += duration;

    return cue;
  });
}

export function getActivePerformanceCue(
  cues: PerformanceCue[],
  playbackTime: number
): PerformanceCue | undefined {
  return cues.find(
    (cue) =>
      playbackTime >= cue.startTime &&
      playbackTime < cue.startTime + cue.duration
  );
}

export function getTotalPerformanceDuration(
  cues: PerformanceCue[]
): number {
  if (!cues.length) return 0;

  return Math.max(
    ...cues.map((cue) => cue.startTime + cue.duration)
  );
}
