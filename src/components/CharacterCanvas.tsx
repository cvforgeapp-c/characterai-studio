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
}

interface Settings {
  background: string;
  floor: string;
  fog: string;
  ambient: number;
  directional: number;
}

const ENVIRONMENTS: Record<EnvironmentId, Settings> = {
  studio: {
    background: "#101827",
    floor: "#202b3b",
    fog: "#101827",
    ambient: 1.2,
    directional: 2.5,
  },
  park: {
    background: "#91b9a0",
    floor: "#426b49",
    fog: "#91b9a0",
    ambient: 1.3,
    directional: 2.2,
  },
  kitchen: {
    background: "#c9bba8",
    floor: "#71685d",
    fog: "#c9bba8",
    ambient: 1.4,
    directional: 2.2,
  },
  city: {
    background: "#68788e",
    floor: "#343b48",
    fog: "#68788e",
    ambient: 1.1,
    directional: 2.3,
  },
  space: {
    background: "#030712",
    floor: "#111827",
    fog: "#030712",
    ambient: 0.9,
    directional: 2,
  },
  beach: {
    background: "#79b8d1",
    floor: "#c9ad7b",
    fog: "#79b8d1",
    ambient: 1.4,
    directional: 2.2,
  },
};

class ModelErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
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

function Lighting({ settings }: { settings: Settings }) {
  return (
    <>
      <ambientLight intensity={settings.ambient} />

      <hemisphereLight
        args={["#ffffff", "#263449", 1.1]}
      />

      <directionalLight
        position={[5, 9, 7]}
        intensity={settings.directional}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <directionalLight
        position={[-6, 5, -5]}
        intensity={1.1}
        color="#a5c8ff"
      />

      <spotLight
        position={[0, 8, 4]}
        angle={0.55}
        penumbra={0.8}
        intensity={1.5}
        castShadow
      />

      <pointLight
        position={[0, 2, -5]}
        intensity={0.8}
        color="#7dd3fc"
      />
    </>
  );
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
  selectedIds,
  action,
}: {
  selectedIds: string[];
  action: CharacterAction;
}) {
  const models = useMemo(() => {
    return selectedIds
      .map((id) => CHARACTER_MODELS[id])
      .filter((model) => Boolean(model));
  }, [selectedIds]);

  const spacing = 2.3;

  return (
    <>
      {models.map((model, index) => {
        const x =
          (index - (models.length - 1) / 2) * spacing;

        return (
          <group
            key={model.id}
            position={[x, 0, 0]}
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
        );
      })}
    </>
  );
}

export default function CharacterCanvas({
  selectedIds,
  height = 560,
  showControls = true,
  environment = "studio",
  action = "idle",
}: Props) {
  const [cameraDistance, setCameraDistance] = useState(9);

  const settings = ENVIRONMENTS[environment];

  const supportedIds = useMemo(
    () =>
      [...new Set(selectedIds)].filter(
        (id) => Boolean(CHARACTER_MODELS[id])
      ),
    [selectedIds]
  );

  return (
    <div style={{ ...styles.container, height }}>
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
          fov={38}
          near={0.1}
          far={100}
        />

        <Lighting settings={settings} />

        <Environment
          environment={environment}
          settings={settings}
        />

        <Suspense fallback={null}>
          <CharacterCollection
            selectedIds={supportedIds}
            action={action}
          />
        </Suspense>

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          enablePan
          minDistance={3}
          maxDistance={20}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI / 2.05}
          target={[0, 1, 0]}
        />
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
          </div>

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
