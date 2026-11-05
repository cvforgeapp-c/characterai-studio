import { useEffect, useState } from "react";

import CharacterCanvas from "./CharacterCanvas";
import CinematicCameraPanel from "./CinematicCameraPanel";
import CinematicScenePanel from "./CinematicScenePanel";

import type { CharacterAction } from "../lib/character-motion";
import type { CinematicCameraSettings } from "./CinematicCameraRig";
import type { CompositionMode } from "./CinematicComposition";

export interface CharacterAppearance {
style?: string;
color?: string;
secondaryColor?: string;
accessory?: string;
outfit?: string;
[key: string]: unknown;
}

interface CharacterStageProps {
selectedIds: string[];
height?: number;
showControls?: boolean;
environment?: string;
action?: CharacterAction;
appearances?: Record<string, CharacterAppearance>;

cameraSettings?: CinematicCameraSettings;
onCameraSettingsChange?: (
settings: CinematicCameraSettings
) => void;

compositionMode?: CompositionMode;
characterSpacing?: number;
characterDepth?: number;

onCompositionChange?: (
mode: CompositionMode,
spacing: number,
depth: number
) => void;
}

const DEFAULT_CAMERA: CinematicCameraSettings = {
shot: "medium",
target: [0, 1.2, 0],
characterPosition: [0, 1.2, 0],
secondaryCharacterPosition: [1.5, 1.2, 0],
transitionSpeed: 3,
movementSpeed: 0.35,
fieldOfView: 40,
orbitRadius: 5.5,
orbitHeight: 2.3,
enabled: true,
};

export default function CharacterStage({
selectedIds,
height = 480,
showControls = true,
environment = "studio",
action = "idle",
appearances = {},

cameraSettings,
onCameraSettingsChange,

compositionMode,
characterSpacing,
characterDepth,
onCompositionChange,
}: CharacterStageProps) {
const [localCamera, setLocalCamera] =
useState<CinematicCameraSettings>(
cameraSettings ?? DEFAULT_CAMERA
);

const [localComposition, setLocalComposition] =
useState<CompositionMode>(
compositionMode ?? "auto"
);

const [localSpacing, setLocalSpacing] =
useState(characterSpacing ?? 2.3);

const [localDepth, setLocalDepth] =
useState(characterDepth ?? 1.5);

useEffect(() => {
if (cameraSettings) {
setLocalCamera(cameraSettings);
}
}, [cameraSettings]);

useEffect(() => {
if (compositionMode !== undefined) {
setLocalComposition(compositionMode);
}
}, [compositionMode]);

useEffect(() => {
if (characterSpacing !== undefined) {
setLocalSpacing(characterSpacing);
}
}, [characterSpacing]);

useEffect(() => {
if (characterDepth !== undefined) {
setLocalDepth(characterDepth);
}
}, [characterDepth]);

const updateCamera = (
settings: CinematicCameraSettings
) => {
setLocalCamera(settings);
onCameraSettingsChange?.(settings);
};

const updateComposition = (
mode: CompositionMode,
spacing: number,
depth: number
) => {
setLocalComposition(mode);
setLocalSpacing(spacing);
setLocalDepth(depth);

onCompositionChange?.(mode, spacing, depth);

};

const activeCamera = localCamera;

const activeComposition =
compositionMode ?? localComposition;

const activeSpacing =
characterSpacing ?? localSpacing;

const activeDepth =
characterDepth ?? localDepth;

return (
<div
style={{
width: "100%",
display: "flex",
flexDirection: "column",
gap: 14,
}}
>
<div
style={{
width: "100%",
height,
minHeight: 300,
position: "relative",
overflow: "hidden",
borderRadius: 16,
background: "#090d16",
border: "1px solid rgba(255,255,255,0.1)",
}}
>
<CharacterCanvas
selectedIds={selectedIds}
height={height}
environment={environment}
action={action}
appearances={appearances}
cameraSettings={activeCamera}
compositionMode={activeComposition}
characterSpacing={activeSpacing}
characterDepth={activeDepth}
/>
</div>

  {showControls && (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
        gap: 14,
        width: "100%",
        alignItems: "start",
      }}
    >
      <CinematicCameraPanel
        value={activeCamera}
        onChange={updateCamera}
      />

      <CinematicScenePanel
        mode={activeComposition}
        spacing={activeSpacing}
        depth={activeDepth}
        characterCount={selectedIds.length}
        onModeChange={(mode) =>
          updateComposition(
            mode,
            activeSpacing,
            activeDepth
          )
        }
        onSpacingChange={(spacing) =>
          updateComposition(
            activeComposition,
            spacing,
            activeDepth
          )
        }
        onDepthChange={(depth) =>
          updateComposition(
            activeComposition,
            activeSpacing,
            depth
          )
        }
      />
    </div>
  )}
</div>

);
}
