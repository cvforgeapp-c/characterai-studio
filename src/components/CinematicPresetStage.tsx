import React, { useCallback, useState } from "react";

import CharacterStage, {
type CharacterAppearance,
} from "./CharacterStage";

import CinematicScenePresetPanel from "./CinematicScenePresetPanel";

import type {
CinematicScenePreset,
} from "./CinematicScenePresets";

import type {
CinematicCameraSettings,
} from "./CinematicCameraRig";

import type {
CompositionMode,
} from "./CinematicComposition";

import type {
EnvironmentId,
} from "./CharacterCanvas";

import type {
CharacterAction,
} from "../lib/character-motion";

interface Props {
selectedIds: string[];
height?: number;
showControls?: boolean;
environment?: EnvironmentId;
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
target: [0, 1.15, 0],
characterPosition: [0, 1.15, 0],
transitionSpeed: 3,
movementSpeed: 0.35,
fieldOfView: 40,
orbitRadius: 6.5,
orbitHeight: 2.3,
enabled: true,
};

export default function CinematicPresetStage({
selectedIds,
height = 560,
showControls = true,
environment: initialEnvironment = "studio",
action = "idle",
appearances,
cameraSettings: externalCameraSettings,
onCameraSettingsChange,
compositionMode: externalCompositionMode = "auto",
characterSpacing: externalSpacing = 2.3,
characterDepth: externalDepth = 1.5,
onCompositionChange,
}: Props) {
const [environment, setEnvironment] =
useState<EnvironmentId>(initialEnvironment);

const [cameraSettings, setCameraSettings] =
useState<CinematicCameraSettings>(
externalCameraSettings ?? DEFAULT_CAMERA
);

const [compositionMode, setCompositionMode] =
useState<CompositionMode>(externalCompositionMode);

const [spacing, setSpacing] =
useState(externalSpacing);

const [depth, setDepth] =
useState(externalDepth);

const [selectedPresetId, setSelectedPresetId] =
useState<string>("");

const handleCameraChange = useCallback(
(settings: CinematicCameraSettings) => {
setCameraSettings(settings);
onCameraSettingsChange?.(settings);
},
[onCameraSettingsChange]
);

const handlePresetApply = useCallback(
(preset: CinematicScenePreset) => {
setEnvironment(preset.environment);

  setCameraSettings(preset.camera);
  onCameraSettingsChange?.(preset.camera);

  setCompositionMode(preset.composition);
  setSpacing(preset.spacing);
  setDepth(preset.depth);

  onCompositionChange?.(
    preset.composition,
    preset.spacing,
    preset.depth
  );

  setSelectedPresetId(preset.id);
},
[
  onCameraSettingsChange,
  onCompositionChange,
]

);

return (
<div style={styles.container}>
<div style={styles.stage}>
<CharacterStage
selectedIds={selectedIds}
height={height}
showControls={showControls}
environment={environment}
action={action}
appearances={appearances}
cameraSettings={cameraSettings}
onCameraSettingsChange={handleCameraChange}
compositionMode={compositionMode}
characterSpacing={spacing}
characterDepth={depth}
onCompositionChange={(
mode,
newSpacing,
newDepth
) => {
setCompositionMode(mode);
setSpacing(newSpacing);
setDepth(newDepth);

        onCompositionChange?.(
          mode,
          newSpacing,
          newDepth
        );
      }}
    />
  </div>

  <div style={styles.presets}>
    <CinematicScenePresetPanel
      characterCount={selectedIds.length}
      selectedPresetId={selectedPresetId}
      onApply={handlePresetApply}
    />
  </div>
</div>

);
}

const styles: Record<string, React.CSSProperties> = {
container: {
width: "100%",
display: "flex",
flexDirection: "column",
gap: 18,
},

stage: {
width: "100%",
minWidth: 0,
},

presets: {
width: "100%",
minWidth: 0,
},
};
