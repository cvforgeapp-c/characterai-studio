import { useEffect } from "react";

import type {
DialoguePlaybackLine,
} from "./CinematicDialoguePlayback";

import {
clearCharacterInteraction,
setCharacterInteraction,
} from "../lib/cinematic-interaction-store";

interface Props {
lines: DialoguePlaybackLine[];
activeLineId: string | null;
enabled: boolean;
}

export default function CinematicCharacterInteractionDirector({
lines,
activeLineId,
enabled,
}: Props) {
useEffect(() => {
if (!enabled || !activeLineId) {
clearCharacterInteraction();
return;
}

const activeIndex = lines.findIndex(
  (line) => line.id === activeLineId
);

if (activeIndex < 0) {
  clearCharacterInteraction();
  return;
}

const activeLine = lines[activeIndex];

const speakerId = String(activeLine.characterId);

/*
 * Prefer the next different speaker.
 * Otherwise use the previous different speaker.
 */

const nextListener = lines
  .slice(activeIndex + 1)
  .find(
    (line) =>
      String(line.characterId) !== speakerId
  );

const previousListener = [...lines]
  .slice(0, activeIndex)
  .reverse()
  .find(
    (line) =>
      String(line.characterId) !== speakerId
  );

const listener =
  nextListener ?? previousListener ?? lines.find(
    (line) =>
      String(line.characterId) !== speakerId
  );

const listenerId = listener
  ? String(listener.characterId)
  : null;

setCharacterInteraction(
  speakerId,
  listenerId,
  true
);

return () => {
  clearCharacterInteraction();
};

}, [lines, activeLineId, enabled]);

return null;
}
