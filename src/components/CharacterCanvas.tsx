import { Component, Suspense, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { Canvas } from "@react-three/fiber";
import {
ContactShadows,
Html,
OrbitControls,
PerspectiveCamera,
Stars,
} from "@react-three/drei";

import {
Color,
Fog,
type Group,
} from "three";

import GLBCharacter from "./GLBCharacter";

import type { CharacterAction } from "../lib/character-motion";

export type EnvironmentId =
| "studio"
| "park"
| "kitchen"
| "city"
| "space"
| "beach";

interface CharacterCanvasProps {
selectedIds: string[];
height?: number;
showControls?: boolean;
environment?: EnvironmentId;
action?: CharacterAction;
appearances?: Record<string, unknown>;
}

interface CharacterErrorBoundaryProps {
children: ReactNode;
characterName: string;
}

interface CharacterErrorBoundaryState {
hasError: boolean;
}

class CharacterErrorBoundary extends Component<
CharacterErrorBoundaryProps,
CharacterErrorBoundaryState

«{
state: CharacterErrorBoundaryState = {
hasError: false,
};»

static getDerivedStateFromError(): CharacterErrorBoundaryState {
return { hasError: true };
}

render() {
if (this.state.hasError) {
return (
<Html center>
<div className="character-model-error">
<strong>{this.props.characterName}</strong>
<span>3D model unavailable</span>
</div>
</Html>
);
}

return this.props.children;

}
}

const ENVIRONMENTS: Record<
EnvironmentId,
{
background: string;
floor: string;
fog: string;
intensity: number;
}

«= {
studio: {
background: "#101820",
floor: "#18252d",
fog: "#101820",
intensity: 1.5,
},
park: {
background: "#789b91",
floor: "#526f53",
fog: "#789b91",
intensity: 1.2,
},
kitchen: {
background: "#c5b9a6",
floor: "#75695c",
fog: "#c5b9a6",
intensity: 1.3,
},
city: {
background: "#536477",
floor: "#343d4b",
fog: "#536477",
intensity: 1.4,
},
space: {
background: "#050817",
floor: "#10152c",
fog: "#050817",
intensity: 0.9,
},
beach: {
background: "#8bb9c4",
floor: "#d0b88c",
fog: "#8bb9c4",
intensity: 1.4,
},
};»

const MODEL_PATHS: Record<string, string> = {
lion: "/models/lion.glb",
monkey: "/models/monkey.glb",
};

function StageLighting({
environment,
}: {
environment: EnvironmentId;
}) {
const settings = ENVIRONMENTS[environment];

return (
<>
<ambientLight intensity={settings.intensity * 0.55} />

  <directionalLight
    position={[5, 8, 5]}
    intensity={2.2}
    castShadow
    shadow-mapSize-width={2048}
    shadow-mapSize-height={2048}
  />

  <directionalLight
    position={[-5, 4, -4]}
    intensity={1.3}
    color="#8db9ff"
  />

  <spotLight
    position={[0, 7, -4]}
    angle={0.7}
    penumbra={0.8}
    intensity={3}
    color="#fff0d5"
    castShadow
  />

  <pointLight
    position={[0, 2, 4]}
    intensity={0.6}
    color="#ffffff"
  />
</>

);
}

function StageEnvironment({
environment,
}: {
environment: EnvironmentId;
}) {
const settings = ENVIRONMENTS[environment];

return (
<>
<color attach="background" args={[settings.background]} />

  <fog
    attach="fog"
    args={[new Color(settings.fog), 12, 35]}
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

  {environment === "space" && (
    <Stars
      radius={80}
      depth={50}
      count={1800}
      factor={4}
      saturation={0}
      fade
      speed={0.5}
    />
  )}

  <ContactShadows
    position={[0, 0, 0]}
    opacity={0.45}
    scale={15}
    blur={2.5}
    far={8}
    resolution={512}
  />
</>

);
}

function CinematicCharacters({
selectedIds,
action,
}: {
selectedIds: string[];
action: CharacterAction;
}) {
const positions = useMemo(() => {
const spacing = 2.2;

return selectedIds.map((id, index) => {
  const total = selectedIds.length;

  return {
    id,
    position: [
      (index - (total - 1) / 2) * spacing,
      0,
      0,
    ] as [number, number, number],
  };
});

}, [selectedIds]);

return (
<group>
{positions.map(({ id, position }) => {
const modelUrl = MODEL_PATHS[id];

    if (!modelUrl) {
      return null;
    }

    return (
      <group
        key={id}
        position={position}
      >
        <CharacterErrorBoundary
          characterName={id}
        >
          <Suspense
            fallback={
              <Html center>
                <div className="character-model-loading">
                  Loading {id}...
                </div>
              </Html>
            }
          >
            <GLBCharacter
              modelUrl={modelUrl}
              action={action}
              targetHeight={2.5}
            />
          </Suspense>
        </CharacterErrorBoundary>
      </group>
    );
  })}
</group>

);
}

export default function CharacterCanvas({
selectedIds,
height = 520,
showControls = true,
environment = "studio",
action = "idle",
}: CharacterCanvasProps) {
const [cameraDistance, setCameraDistance] = useState(8);

const availableCharacters = selectedIds.filter(
(id) => MODEL_PATHS[id]
);

return (
<div
className="cinematic-character-stage"
style={{
width: "100%",
height,
position: "relative",
overflow: "hidden",
borderRadius: 18,
background: "#101820",
}}
>
<Canvas
shadows
dpr={[1, 1.75]}
gl={{
antialias: true,
alpha: false,
powerPreference: "high-performance",
}}
>
<PerspectiveCamera
makeDefault
position={[0, 2.8, cameraDistance]}
fov={35}
/>

    <StageLighting environment={environment} />

    <StageEnvironment environment={environment} />

    <CinematicCharacters
      selectedIds={availableCharacters}
      action={action}
    />

    <OrbitControls
      makeDefault
      enableDamping
      dampingFactor={0.06}
      minDistance={3}
      maxDistance={18}
      maxPolarAngle={Math.PI / 2 + 0.05}
      target={[0, 1.1, 0]}
    />
  </Canvas>

  <div className="cinematic-stage-top">
    <span className="cinematic-live-indicator" />
    <span>CHARACTER STAGE</span>
    <span className="cinematic-environment-name">
      {environment.toUpperCase()}
    </span>
  </div>

  {showControls && (
    <div className="cinematic-stage-controls">
      <button
        type="button"
        onClick={() =>
          setCameraDistance((value) =>
            Math.max(4, value - 1)
          )
        }
      >
        +
      </button>

      <button
        type="button"
        onClick={() =>
          setCameraDistance((value) =>
            Math.min(15, value + 1)
          )
        }
      >
        −
      </button>
    </div>
  )}

  {availableCharacters.length === 0 && (
    <div className="cinematic-stage-empty">
      <strong>Character models required</strong>
      <span>
        Add a supported GLB model to begin your scene.
      </span>
    </div>
  )}

  <style>{`
    .cinematic-stage-top {
      position: absolute;
      top: 15px;
      left: 16px;
      right: 16px;
      display: flex;
      align-items: center;
      gap: 9px;
      color: white;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.8px;
      pointer-events: none;
      text-shadow: 0 2px 8px #000;
    }

    .cinematic-live-indicator {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #4be0a0;
      box-shadow: 0 0 12px #4be0a0;
    }

    .cinematic-environment-name {
      margin-left: auto;
      opacity: 0.75;
    }

    .cinematic-stage-controls {
      position: absolute;
      right: 14px;
      bottom: 14px;
      display: flex;
      gap: 8px;
    }

    .cinematic-stage-controls button {
      width: 38px;
      height: 38px;
      border: 1px solid #ffffff40;
      border-radius: 12px;
      background: #101820bb;
      color: white;
      font-size: 21px;
      cursor: pointer;
    }

    .cinematic-stage-empty {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: white;
      background: #10182055;
      text-align: center;
      pointer-events: none;
    }

    .cinematic-stage-empty strong {
      font-size: 16px;
    }

    .cinematic-stage-empty span {
      font-size: 12px;
      opacity: 0.7;
    }

    .character-model-loading,
    .character-model-error {
      padding: 12px 16px;
      border: 1px solid #ffffff30;
      border-radius: 12px;
      background: #101820e8;
      color: white;
      font-size: 12px;
      white-space: nowrap;
      text-align: center;
    }

    .character-model-error {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .character-model-error span {
      opacity: 0.65;
    }
  `}</style>
</div>

);
              }
