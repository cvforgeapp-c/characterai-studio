import {
  useMemo,
} from "react";

import CinematicDialogueCameraDirector from "./CinematicDialogueCameraDirector";

import type {
  DialoguePlaybackLine,
} from "./CinematicDialoguePlayback";

import type {
  SceneDirection,
} from "../lib/cinematic-scene-director";

interface Props {
  lines: DialoguePlaybackLine[];
  activeLineId: string | null;
  characterCount: number;
  enabled: boolean;

  onDirectionChange?: (
    shot: string,
    reason: string,
    line: DialoguePlaybackLine | null
  ) => void;
}

export default function CinematicIntelligentDialogueDirector({
  lines,
  activeLineId,
  characterCount,
  enabled,
  onDirectionChange,
}: Props) {
  const activeLine = useMemo(() => {
    if (!activeLineId) {
      return null;
    }

    return (
      lines.find((line) => line.id === activeLineId) ?? null
    );
  }, [lines, activeLineId]);

  const handleDirectionChange = (
    direction: SceneDirection,
    line: {
      id: string;
      characterId: string;
      characterName: string;
      text: string;
      action?: string;
      duration?: number;
    }
  ) => {
    onDirectionChange?.(
      direction.shot,
      direction.reason,
      line as DialoguePlaybackLine
    );
  };

  return (
    <CinematicDialogueCameraDirector
      activeLine={
        activeLine
          ? {
              id: activeLine.id,
              characterId: String(activeLine.characterId),
              characterName: activeLine.characterName,
              text: activeLine.text,
              action: activeLine.action,
              duration: activeLine.duration,
            }
          : null
      }
      characterCount={characterCount}
      enabled={enabled}
      onDirectionChange={handleDirectionChange}
    />
  );
}
