import React, {
Component,
Suspense,
useMemo,
useState,
type ReactNode,
} from "react";

import { Canvas } from "@react-three/fiber";

import {
ContactShadows,
Html,
OrbitControls,
PerspectiveCamera,
} from "@react-three/drei";

import { Color } from "three";

import CinematicCameraRig, {
type CinematicCameraSettings,
} from "./CinematicCameraRig";

import CinematicShotTransitionController from "./CinematicShotTransitionController";

import CinematicLighting from "./CinematicLighting";
import CinematicEnvironment from "./CinematicEnvironment";

import CinematicCharacterActor from "./CinematicCharacterActor";
import CinematicTrackedCharacter from "./CinematicTrackedCharacter";
import CinematicLiveTargetTracker from "./CinematicLiveTargetTracker";

import CinematicEmotionalActingRig from "./CinematicEmotionalActingRig";
import CinematicCharacterInteractionRig from "./CinematicCharacterInteractionRig";
import CinematicFacialExpressionRig from "./CinematicFacialExpressionRig";
import CinematicEyeAnimationRig from "./CinematicEyeAnimationRig";
import CinematicSecondaryMotionRig from "./CinematicSecondaryMotionRig";

import CinematicRigDiagnostics from "./CinematicRigDiagnostics";
import CinematicRigCompatibilityDirector from "./CinematicRigCompatibilityDirector";

import CinematicAnimationFallbackRig from "./CinematicAnimationFallbackRig";
import CinematicProceduralMotionFallback from "./CinematicProceduralMotionFallback";
import CinematicAnimationQualityPanel from "./CinematicAnimationQualityPanel";

// Stage 79: Adaptive performance monitoring
import CinematicPerformanceOptimizer from "./CinematicPerformanceOptimizer";
import CinematicPerformancePanel from "./CinematicPerformancePanel";

import {
useCinematicCameraCommand,
} from "../lib/cinematic-camera-command-store";

import {
calculateCharacterCameraTarget,
getCharacterCameraDistance,
} from "../lib/cinematic-camera-targeting";

import {
DEFAULT_ACTING_SETTINGS,
type CinematicActingSettings,
} from "./CinematicActingPanel";

import {
calculateComposition,
type CompositionMode,
} from "./CinematicComposition";

import { CHARACTER_MODELS } from "../lib/character-models";

import type { CharacterAction } from "../lib/character-motion";

export type EnvironmentId =
| "studio"
| "park"
| "kitchen"
| "city"
| "space"
| "beach";

interface Props {
selectedIds: string[];
height?: number;
showControls?: boolean;
environment?: EnvironmentId;
action?: CharacterAction;
appearances?: Record<string, unknown>;
cameraSettings?: CinematicCameraSettings;
compositionMode?: CompositionMode;
characterSpacing?: number;
characterDepth?: number;
actingSettings?: CinematicActingSettings;
}

interface Settings {
background: string;
floor: string;
fog: string;
warmLighting: boolean;
}

const ENVIRONMENTS: Record<EnvironmentId, Settings> = {
studio: {
background: "#101827",
floor: "#202b3b",
fog: "#101827",
warmLighting: false,
},
park: {
background: "#91b9a0",
floor: "#426b49",
fog: "#91b9a0",
warmLighting: true,
},
kitchen: {
background: "#c9bba8",
floor: "#71685d",
fog: "#c9bba8",
warmLighting: true,
},
city: {
background: "#68788e",
floor: "#343b48",
fog: "#68788e",
warmLighting: false,
},
space: {
background: "#030712",
floor: "#111827",
fog: "#030712",
warmLighting: false,
},
beach: {
background: "#79b8d1",
floor: "#c9ad7b",
fog: "#79b8d1",
warmLighting: true,
},
};

/* ---------------------------------------
CHARACTER MODEL ERROR BOUNDARY
--------------------------------------- */

class ModelErrorBoundary extends Component<
{ children: ReactNode },
{ hasError: boolean }

«{
constructor(props: { children: ReactNode }) {
super(props);»

this.state = {
  hasError: false,
};

}

static getDerivedStateFromError() {
return {
hasError: true,
};
}

render() {
if (this.state.hasError) {
return (
<Html center>
<div style={styles.error}>
Character model failed to load.
</div>
</Html>
);
}

return this.props.children;

}
}

/* ---------------------------------------
BASE ENVIRONMENT
--------------------------------------- */

function Environment({
settings,
}: {
settings: Settings;
}) {
return (
<>
<color
attach="background"
args={[new Color(settings.background)]}
/>

  <fog
    attach="fog"
    args={[settings.fog, 18, 55]}
  />

  <mesh
    rotation={[-Math.PI / 2, 0, 0]}
    position={[0, -0.04, 0]}
    receiveShadow
  >
    <planeGeometry args={[100, 100]} />

    <meshStandardMaterial
      color={settings.floor}
      roughness={0.85}
      metalness={0.05}
    />
  </mesh>

  <ContactShadows
    position={[0, 0, 0]}
    opacity={0.45}
    scale={14}
    blur={2.5}
    far={6}
    resolution={512}
  />
</>

);
}

/* ---------------------------------------
CHARACTER COLLECTION
--------------------------------------- */

function CharacterCollection({
placements,
action,
actingSettings,
}: {
placements: ReturnType<typeof calculateComposition>["placements"];
action: CharacterAction;
actingSettings: CinematicActingSettings;
}) {
const models = useMemo(
() =>
placements.flatMap((placement) => {
const model =
CHARACTER_MODELS[
placement.id as keyof typeof CHARACTER_MODELS
];

    return model
      ? [{ placement, model }]
      : [];
  }),
[placements],

);

return (
<group name="cinematic-character-collection">
{models.map(({ placement, model }) => (
<CinematicTrackedCharacter
key={model.id}
id={model.id}
position={placement.position}
rotation={placement.rotation}
scale={placement.scale}
>
<ModelErrorBoundary>
<Suspense
fallback={
<Html center>
<div style={styles.loading}>
Loading {model.name}...
</div>
</Html>
}
>
<CinematicCharacterActor
characterId={model.id}
modelUrl={model.modelUrl}
action={action}
targetHeight={model.targetHeight}
actingSettings={actingSettings}
actingEnabled
/>
</Suspense>
</ModelErrorBoundary>
</CinematicTrackedCharacter>
))}
</group>
);
}

/* ---------------------------------------
MAIN CINEMATIC CHARACTER CANVAS
--------------------------------------- */

export default function CharacterCanvas({
selectedIds,
height = 560,
showControls = true,
environment = "studio",
action = "idle",
cameraSettings,
compositionMode = "auto",
characterSpacing = 2.3,
characterDepth = 1.5,
actingSettings = DEFAULT_ACTING_SETTINGS,
}: Props) {
const [cameraDistance, setCameraDistance] = useState(9);

const settings = ENVIRONMENTS[environment];

/* SHARED DIRECTOR CAMERA COMMAND */

const directorCommand = useCinematicCameraCommand();

const directorCameraEnabled =
directorCommand !== null &&
directorCommand.enabled === true;

/* EXISTING CAMERA SETTINGS */

const existingCameraEnabled =
cameraSettings !== undefined &&
cameraSettings.enabled !== false;

/* PREVENT COMPETING MANUAL CAMERA CONTROLS */

const cinematicEnabled =
directorCameraEnabled || existingCameraEnabled;

/* REGISTERED CHARACTER MODELS ONLY */

const supportedIds = useMemo(
() =>
[...new Set(selectedIds)].filter(
(id) =>
Boolean(
CHARACTER_MODELS[
id as keyof typeof CHARACTER_MODELS
],
),
),
[selectedIds],
);

/* CHARACTER COMPOSITION */

const composition = useMemo(
() =>
calculateComposition({
characterIds: supportedIds,
mode: compositionMode,
spacing: characterSpacing,
depth: characterDepth,
}),
[
supportedIds,
compositionMode,
characterSpacing,
characterDepth,
],
);

/* STAGE 50 + 52: CHARACTER-AWARE FRAMING */

const characterCameraFraming = useMemo(
() =>
calculateCharacterCameraTarget(
composition.placements.map((placement) => ({
id: placement.id,
position: placement.position,
scale: placement.scale,
})),
),
[composition.placements],
);

const characterCameraDistance = useMemo(
() =>
getCharacterCameraDistance(
characterCameraFraming.groupWidth,
characterCameraFraming.groupDepth,
characterCameraFraming.characterCount,
characterCameraFraming.groupHeight,
),
[characterCameraFraming],
);

const cameraTarget: [number, number, number] =
directorCameraEnabled
? characterCameraFraming.target
: cameraSettings?.characterPosition ??
cameraSettings?.target ??
characterCameraFraming.target;

/* STAGE 51 + 52: ADAPTIVE CAMERA FRAMING */

const adaptiveFramingDistance = useMemo(
() =>
Math.max(
characterCameraDistance,
directorCommand?.orbitRadius ?? 0,
),
[
characterCameraDistance,
directorCommand?.orbitRadius,
],
);

return (
<div
style={{
...styles.container,
height,
}}
>
<Canvas
shadows
dpr={[1, 1.5]}
gl={{
antialias: true,
alpha: false,
powerPreference: "high-performance",
}}
>
{/* MAIN CAMERA */}

    <PerspectiveCamera
      makeDefault
      position={[0, 2.6, cameraDistance]}
      fov={cameraSettings?.fieldOfView ?? 38}
      near={0.1}
      far={100}
    />

    {/* STAGE 53–55: LIVE CHARACTER TARGET TRACKER */}

    <CinematicLiveTargetTracker enabled />

    {/* STAGE 74: AUTOMATIC RIG COMPATIBILITY DETECTION */}

    <CinematicRigCompatibilityDirector enabled />

    {/* STAGE 79: PERFORMANCE MONITORING */}

    <CinematicPerformanceOptimizer enabled />

    {/* STAGE 61–64: UNIFIED CINEMATIC CAMERA */}

    {directorCameraEnabled && (
      <CinematicShotTransitionController
        enabled
        target={cameraTarget}
        framingDistance={adaptiveFramingDistance}
      />
    )}

    {/* EXISTING CINEMATIC CAMERA */}

    {!directorCameraEnabled &&
      existingCameraEnabled &&
      cameraSettings && (
        <CinematicCameraRig
          shot={cameraSettings.shot}
          target={cameraSettings.target}
          characterPosition={cameraTarget}
          secondaryCharacterPosition={
            cameraSettings.secondaryCharacterPosition
          }
          transitionSpeed={
            cameraSettings.transitionSpeed ?? 3
          }
          movementSpeed={
            cameraSettings.movementSpeed ?? 0.35
          }
          fieldOfView={
            cameraSettings.fieldOfView ?? 40
          }
          orbitRadius={
            cameraSettings.orbitRadius ??
            characterCameraDistance
          }
          orbitHeight={
            cameraSettings.orbitHeight ?? 2.3
          }
          enabled
        />
      )}

    {/* CINEMATIC LIGHTING */}

    <CinematicLighting
      intensity={0.85}
      dramatic
      warm={settings.warmLighting}
    />

    {/* ENVIRONMENT */}

    <Environment settings={settings} />

    <CinematicEnvironment
      environment={environment}
    />

    {/* CHARACTER MODELS */}

    <Suspense fallback={null}>
      <CharacterCollection
        placements={composition.placements}
        action={action}
        actingSettings={actingSettings}
      />
    </Suspense>

    {/* STAGE 65: AUTOMATIC EMOTIONAL ACTING */}

    <CinematicEmotionalActingRig />

    {/* STAGE 66: CHARACTER-TO-CHARACTER INTERACTION */}

    <CinematicCharacterInteractionRig />

    {/* STAGE 67–70: FACIAL EXPRESSION AND EMOTION SYNC */}

    <CinematicFacialExpressionRig />

    {/* STAGE 71: NATURAL EYE MOVEMENT AND BLINKING */}

    <CinematicEyeAnimationRig />

    {/* STAGE 72: NATURAL EAR AND TAIL MOVEMENT */}

    <CinematicSecondaryMotionRig />

    {/* STAGE 76: JAW ANIMATION FALLBACK */}

    <CinematicAnimationFallbackRig enabled />

    {/* STAGE 77: PROCEDURAL IDLE MOTION FALLBACK */}

    <CinematicProceduralMotionFallback
      enabled
      breathingIntensity={0.012}
      swayIntensity={0.018}
    />

    {/* MANUAL CAMERA CONTROLS */}

    {!cinematicEnabled && (
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enablePan
        minDistance={3}
        maxDistance={30}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.05}
        target={cameraTarget}
      />
    )}
  </Canvas>

  {/* STAGE 75: LIVE RIG DIAGNOSTICS DASHBOARD */}

  <CinematicRigDiagnostics enabled />

  {/* STAGE 78: ANIMATION QUALITY DASHBOARD */}

  <CinematicAnimationQualityPanel enabled />

  {/* STAGE 79: PERFORMANCE MONITORING PANEL */}

  <CinematicPerformancePanel enabled />

  {/* STUDIO INFORMATION BAR */}

  {showControls && (
    <>
      <div style={styles.topBar}>
        <span style={styles.badge}>
          CINEMATIC STUDIO
        </span>

        <span style={styles.environment}>
          {environment.toUpperCase()}
        </span>

        <span style={styles.count}>
          {supportedIds.length} CHARACTERS
        </span>

        <span style={styles.compositionBadge}>
          {compositionMode.toUpperCase()}
        </span>

        {directorCameraEnabled && (
          <span style={styles.cameraBadge}>
            🎥 DIRECTOR:{" "}
            {directorCommand?.shot.toUpperCase()}
          </span>
        )}

        {!directorCameraEnabled &&
          existingCameraEnabled && (
            <span style={styles.cameraBadge}>
              🎥 {cameraSettings?.shot.toUpperCase()}
            </span>
          )}

        {directorCameraEnabled && (
          <span style={styles.focusBadge}>
            🎯 SMART CAMERA
          </span>
        )}

        <span style={styles.actingBadge}>
          🎭 {actingSettings.emotion.toUpperCase()}
        </span>

        <span style={styles.emotionEngineBadge}>
          ✨ AUTO EMOTION
        </span>

        <span style={styles.interactionBadge}>
          👀 CHARACTER INTERACTION
        </span>

        <span style={styles.facialBadge}>
          😊 FACIAL SYNC
        </span>

        <span style={styles.eyeBadge}>
          👁️ EYE ANIMATION
        </span>

        <span style={styles.secondaryMotionBadge}>
          🐾 SECONDARY MOTION
        </span>

        <span style={styles.fallbackBadge}>
          ⚙️ ANIMATION FALLBACKS
        </span>

        <span style={styles.diagnosticsBadge}>
          🔍 RIG DIAGNOSTICS
        </span>

        <span style={styles.qualityBadge}>
          ⭐ QUALITY SCORING
        </span>

        <span style={styles.performanceBadge}>
          ⚡ AUTO PERFORMANCE
        </span>
      </div>

      {/* ZOOM CONTROLS */}

      {!cinematicEnabled && (
        <div style={styles.controls}>
          <button
            type="button"
            onClick={() =>
              setCameraDistance((value) =>
                Math.max(4, value - 1),
              )
            }
            style={styles.button}
          >
            +
          </button>

          <button
            type="button"
            onClick={() =>
              setCameraDistance((value) =>
                Math.min(20, value + 1),
              )
            }
            style={styles.button}
          >
            −
          </button>

          <button
            type="button"
            onClick={() => setCameraDistance(9)}
            style={styles.button}
          >
            ↺
          </button>
        </div>
      )}
    </>
  )}

  {/* EMPTY CHARACTER SELECTION */}

  {supportedIds.length === 0 && (
    <div style={styles.empty}>
      <div style={{ fontSize: 36 }}>
        🎬
      </div>

      <strong>Select a character</strong>

      <span>
        Choose a character from the studio library.
      </span>
    </div>
  )}

  {/* MISSING MODEL WARNING */}

  {selectedIds.length !== supportedIds.length && (
    <div style={styles.warning}>
      Some selected characters do not have registered models.
    </div>
  )}
</div>

);
}

/* ---------------------------------------
STUDIO STYLES
--------------------------------------- */

const styles: Record<string, React.CSSProperties> = {
container: {
width: "100%",
minHeight: 320,
position: "relative",
overflow: "hidden",
borderRadius: 16,
background: "#101827",
border: "1px solid rgba(148,163,184,0.2)",
},

topBar: {
position: "absolute",
top: 14,
left: 14,
right: 14,
display: "flex",
alignItems: "center",
gap: 9,
pointerEvents: "none",
flexWrap: "wrap",
zIndex: 5,
},

badge: {
padding: "8px 11px",
borderRadius: 7,
background: "rgba(15,23,42,0.88)",
color: "#e2e8f0",
fontSize: 10,
fontWeight: 800,
letterSpacing: "0.1em",
},

environment: {
padding: "8px 10px",
borderRadius: 7,
background: "rgba(15,23,42,0.72)",
color: "#93c5fd",
fontSize: 10,
},

count: {
padding: "8px 10px",
borderRadius: 7,
background: "rgba(15,23,42,0.72)",
color: "#86efac",
fontSize: 10,
},

compositionBadge: {
padding: "8px 10px",
borderRadius: 7,
background: "rgba(15,23,42,0.8)",
color: "#fcd34d",
fontSize: 10,
fontWeight: 800,
},

cameraBadge: {
padding: "8px 10px",
borderRadius: 7,
background: "rgba(49,46,129,0.9)",
color: "#c7d2fe",
fontSize: 10,
fontWeight: 800,
},

focusBadge: {
padding: "8px 10px",
borderRadius: 7,
background: "rgba(6,78,59,0.9)",
color: "#a7f3d0",
fontSize: 10,
fontWeight: 800,
},

actingBadge: {
padding: "8px 10px",
borderRadius: 7,
background: "rgba(88,28,135,0.9)",
color: "#e9d5ff",
fontSize: 10,
fontWeight: 800,
},

emotionEngineBadge: {
padding: "8px 10px",
borderRadius: 7,
background: "rgba(124,45,18,0.9)",
color: "#fed7aa",
fontSize: 10,
fontWeight: 800,
},

interactionBadge: {
padding: "8px 10px",
borderRadius: 7,
background: "rgba(8,84,100,0.9)",
color: "#a5f3fc",
fontSize: 10,
fontWeight: 800,
},

facialBadge: {
padding: "8px 10px",
borderRadius: 7,
background: "rgba(6,78,59,0.9)",
color: "#bbf7d0",
fontSize: 10,
fontWeight: 800,
},

eyeBadge: {
padding: "8px 10px",
borderRadius: 7,
background: "rgba(30,64,175,0.9)",
color: "#bfdbfe",
fontSize: 10,
fontWeight: 800,
},

secondaryMotionBadge: {
padding: "8px 10px",
borderRadius: 7,
background: "rgba(20,83,45,0.9)",
color: "#bbf7d0",
fontSize: 10,
fontWeight: 800,
},

fallbackBadge: {
padding: "8px 10px",
borderRadius: 7,
background: "rgba(120,53,15,0.9)",
color: "#fed7aa",
fontSize: 10,
fontWeight: 800,
},

diagnosticsBadge: {
padding: "8px 10px",
borderRadius: 7,
background: "rgba(88,28,135,0.9)",
color: "#e9d5ff",
fontSize: 10,
fontWeight: 800,
},

qualityBadge: {
padding: "8px 10px",
borderRadius: 7,
background: "rgba(120,53,15,0.9)",
color: "#fde68a",
fontSize: 10,
fontWeight: 800,
},

performanceBadge: {
padding: "8px 10px",
borderRadius: 7,
background: "rgba(8,84,100,0.9)",
color: "#a5f3fc",
fontSize: 10,
fontWeight: 800,
},

controls: {
position: "absolute",
right: 14,
bottom: 14,
display: "flex",
gap: 7,
zIndex: 5,
},

button: {
width: 39,
height: 39,
borderRadius: 9,
border: "1px solid rgba(255,255,255,0.18)",
background: "rgba(15,23,42,0.9)",
color: "#ffffff",
fontSize: 20,
cursor: "pointer",
},

loading: {
padding: "10px 14px",
borderRadius: 8,
background: "rgba(15,23,42,0.9)",
color: "#e2e8f0",
fontSize: 12,
},

error: {
padding: 14,
borderRadius: 9,
background: "#450a0a",
color: "#fecaca",
fontSize: 12,
},

empty: {
position: "absolute",
inset: 0,
display: "flex",
flexDirection: "column",
alignItems: "center",
justifyContent: "center",
gap: 10,
color: "#e2e8f0",
pointerEvents: "none",
},

warning: {
position: "absolute",
bottom: 14,
left: 14,
padding: "8px 11px",
borderRadius: 8,
background: "rgba(120,53,15,0.9)",
color: "#fed7aa",
fontSize: 11,
zIndex: 5,
},
};
