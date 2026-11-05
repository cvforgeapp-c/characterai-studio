import React, {
useCallback,
useEffect,
} from "react";

import CinematicDialoguePlayback, {
type DialoguePlaybackLine,
} from "./CinematicDialoguePlayback";

import type {
CinematicActingSettings,
} from "./CinematicActingPanel";

import {
useCinematicPerformance,
} from "./CinematicPerformanceContext";

interface Props {
lines: DialoguePlaybackLine[];

onLineChange?: (
line: DialoguePlaybackLine | null
) => void;

onPlaybackChange?: (
playing: boolean
) => void;

onSpeak?: (
line: DialoguePlaybackLine
) => void;

onStopSpeaking?: () => void;
}

export default function CinematicPerformanceConsole({
lines,
onLineChange,
onPlaybackChange,
onSpeak,
onStopSpeaking,
}: Props) {
const performance = useCinematicPerformance();

// Register every character used in the dialogue.
useEffect(() => {
const characterIds = Array.from(
new Set(lines.map((line) => line.characterId))
);

if (characterIds.length > 0) {
  performance.registerCharacters(characterIds);
}

}, [lines, performance.registerCharacters]);

// Send individual acting instructions to the 3D actors.
const handleActingChange = useCallback(
(
characterId: string,
settings: CinematicActingSettings
) => {
performance.updatePerformance(
characterId,
settings
);
},
[performance.updatePerformance]
);

return (
<div
style={{
width: "100%",
display: "flex",
flexDirection: "column",
gap: 16,
}}
>
<div
style={{
display: "flex",
alignItems: "center",
justifyContent: "space-between",
gap: 12,
flexWrap: "wrap",
}}
>
<div>
<h2
style={{
margin: 0,
color: "#ffffff",
fontSize: 19,
fontWeight: 800,
}}
>
Character Performance Director
</h2>

      <p
        style={{
          margin: "5px 0 0",
          color: "#929bad",
          fontSize: 12,
        }}
      >
        Live dialogue-driven character acting
      </p>
    </div>

    <div
      style={{
        padding: "8px 12px",
        borderRadius: 20,
        background: "#18352e",
        color: "#66e6ae",
        fontSize: 11,
        fontWeight: 800,
      }}
    >
      {new Set(
        lines.map((line) => line.characterId)
      ).size}{" "}
      CHARACTERS CONNECTED
    </div>
  </div>

  <CinematicDialoguePlayback
    lines={lines}
    onActingChange={handleActingChange}
    onLineChange={onLineChange}
    onPlaybackChange={onPlaybackChange}
    onSpeak={onSpeak}
    onStopSpeaking={onStopSpeaking}
  />
</div>

);
}
