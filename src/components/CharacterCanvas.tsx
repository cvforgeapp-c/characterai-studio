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
Stars,
} from "@react-three/drei";

import { Color } from "three";

import GLBCharacter from "./GLBCharacter";

import CinematicCameraRig, {
type CinematicCameraSettings,
} from "./CinematicCameraRig";

import CinematicLighting from "./CinematicLighting";

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

function Environment({
environment,
settings,
}: {
environment: EnvironmentId;
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

  {environment === "space" && (
    <Stars
      radius={100}
      depth={50}
      count={3000}
      factor={4}
      saturation={0}
      fade
      speed={0.5}
    />
  )}

  {environment === "city" && (
    <Stars
      radius={45}
      depth={25}
      count={350}
      factor={2}
      saturation={0.2}
      fade
      speed={0.15}
    />
  )}

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

function CharacterCollection({
placements,
action,
}: {
placements: ReturnType<
typeof calculateComposition

«["placements"];
action: CharacterAction;
}) {
const models = useMemo(
() =>
placements
.map((placement) => ({
placement,
model: CHARACTER_MODELS[placement.id],
}))
.filter((item) => Boolean(item.model)),
[placements]
);»

return (
<>
{models.map(({ placement, model }) => (
<group
key={model.id}
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
<GLBCharacter
modelUrl={model.modelUrl}
action={action}
targetHeight={model.targetHeight}
/>
</Suspense>
</ModelErrorBoundary>
</group>
))}
</>
);
}

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
}: Props) {
const [cameraDistance, setCameraDistance] = useState(9);

const settings = ENVIRONMENTS[environment];

const cinematicEnabled =
cameraSettings !== undefined &&
cameraSettings.enabled !== false;

const supportedIds = useMemo(
() =>
[...new Set(selectedIds)].filter(
(id) => Boolean(CHARACTER_MODELS[id])
),
[selectedIds]
);

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
]
);

const cameraTarget =
cameraSettings?.characterPosition ??
cameraSettings?.target ??
composition.cameraTarget;

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
<PerspectiveCamera
makeDefault
position={[0, 2.6, cameraDistance]}
fov={cameraSettings?.fieldOfView ?? 38}
near={0.1}
far={100}
/>

    {cinematicEnabled && cameraSettings && (
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
          composition.cameraDistance
        }
        orbitHeight={
          cameraSettings.orbitHeight ?? 2.3
        }
        enabled
      />
    )}

    {/* Cinematic three-point lighting */}
    <CinematicLighting
      intensity={0.85}
      dramatic={true}
      warm={settings.warmLighting}
    />

    {/* Environment and atmospheric treatment */}
    <Environment
      environment={environment}
      settings={settings}
    />

    {/* Live character staging */}
    <Suspense fallback={null}>
      <CharacterCollection
        placements={composition.placements}
        action={action}
      />
    </Suspense>

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
        target={composition.cameraTarget}
      />
    )}
  </Canvas>

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

        {cinematicEnabled && (
          <span style={styles.cameraBadge}>
            🎥 {cameraSettings?.shot.toUpperCase()}
          </span>
        )}
      </div>

      {!cinematicEnabled && (
        <div style={styles.controls}>
          <button
            type="button"
            onClick={() =>
              setCameraDistance((value) =>
                Math.max(4, value - 1)
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
                Math.min(20, value + 1)
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

  {supportedIds.length === 0 && (
    <div style={styles.empty}>
      <div style={{ fontSize: 36 }}>🎬</div>

      <strong>Select a character</strong>

      <span>
        Choose a character from the studio library.
      </span>
    </div>
  )}

  {selectedIds.length !== supportedIds.length && (
    <div style={styles.warning}>
      Some selected characters do not have registered models.
    </div>
  )}
</div>

);
}

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

controls: {
position: "absolute",
right: 14,
bottom: 14,
display: "flex",
gap: 7,
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
},
};
