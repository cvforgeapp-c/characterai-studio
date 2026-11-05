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

interface EnvironmentSettings {
  background: string;
  floor: string;
  fog: string;
  ambient: number;
  directional: number;
}

const ENVIRONMENTS: Record<EnvironmentId, EnvironmentSettings> = {
  studio: {
    background: "#111827",
    floor: "#202b3b",
    fog: "#111827",
    ambient: 1.1,
    directional: 2.2,
  },

  park: {
    background: "#8eb6a0",
    floor: "#426b49",
    fog: "#8eb6a0",
    ambient: 1.2,
    directional: 2,
  },

  kitchen: {
    background: "#c9bba8",
    floor: "#71685d",
    fog: "#c9bba8",
    ambient: 1.3,
    directional: 2,
  },

  city: {
    background: "#68788e",
    floor: "#343b48",
    fog: "#68788e",
    ambient: 1,
    directional: 2.1,
  },

  space: {
    background: "#030712",
    floor: "#111827",
    fog: "#030712",
    ambient: 0.8,
    directional: 1.8,
  },

  beach: {
    background: "#79b8d1",
    floor: "#c9ad7b",
    fog: "#79b8d1",
    ambient: 1.3,
    directional: 2,
  },
};

interface ModelErrorBoundaryProps {
  children: ReactNode;
}

interface ModelErrorBoundaryState {
  hasError: boolean;
}

class ModelErrorBoundary extends Component<
  ModelErrorBoundaryProps,
  ModelErrorBoundaryState
> {
  constructor(props: ModelErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(): ModelErrorBoundaryState {
    return {
      hasError: true,
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Html center>
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "10px",
              background: "rgba(15, 23, 42, 0.95)",
              color: "#fca5a5",
              fontSize: "13px",
              width: "190px",
              textAlign: "center",
              border: "1px solid rgba(248,113,113,0.3)",
            }}
          >
            Character model could not load.
            <br />
            Check the GLB model file.
          </div>
        </Html>
      );
    }

    return this.props.children;
  }
}

function StageLighting({
  settings,
}: {
  settings: EnvironmentSettings;
}) {
  return (
    <>
      <ambientLight intensity={settings.ambient} />

      <hemisphereLight
        args={["#ffffff", "#273449", 1.1]}
      />

      <directionalLight
        position={[5, 8, 6]}
        intensity={settings.directional}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <directionalLight
        position={[-5, 4, -4]}
        intensity={0.8}
      />

      <spotLight
        position={[0, 8, 3]}
        angle={0.5}
        penumbra={0.8}
        intensity={1.4}
        castShadow
      />

      <pointLight
        position={[0, 2, -5]}
        intensity={0.7}
        color="#93c5fd"
      />
    </>
  );
}

function StageEnvironment({
  environment,
  settings,
}: {
  environment: EnvironmentId;
  settings: EnvironmentSettings;
}) {
  return (
    <>
      <color
        attach="background"
        args={[settings.background]}
      />

      <fog
        attach="fog"
        args={[settings.fog, 15, 45]}
      />

      {environment === "space" && (
        <Stars
          radius={90}
          depth={45}
          count={2500}
          factor={4}
          saturation={0}
          fade
          speed={0.5}
        />
      )}

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.03, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />

        <meshStandardMaterial
          color={settings.floor}
          roughness={0.88}
          metalness={0.05}
        />
      </mesh>

      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.45}
        scale={12}
        blur={2.5}
        far={5}
        resolution={512}
      />
    </>
  );
}

interface CharacterModel {
  id: string;
  modelUrl: string;
  position: [number, number, number];
  targetHeight: number;
}

function CinematicCharacters({
  selectedIds,
  action,
}: {
  selectedIds: string[];
  action: CharacterAction;
}) {
  const availableModels = useMemo<CharacterModel[]>(() => {
    const modelDefinitions: Record<string, CharacterModel> = {
      lion: {
        id: "lion",
        modelUrl: "/models/lion.glb",
        position: [-1.35, 0, 0],
        targetHeight: 2.3,
      },

      monkey: {
        id: "monkey",
        modelUrl: "/models/monkey.glb",
        position: [1.35, 0, 0],
        targetHeight: 2.1,
      },
    };

    return selectedIds
      .map((id) => modelDefinitions[id])
      .filter(
        (model): model is CharacterModel =>
          model !== undefined
      );
  }, [selectedIds]);

  if (availableModels.length === 0) {
    return (
      <Html center>
        <div
          style={{
            width: "260px",
            padding: "20px",
            borderRadius: "14px",
            background: "rgba(15, 23, 42, 0.94)",
            border: "1px solid rgba(148,163,184,0.25)",
            color: "#e2e8f0",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          <div
            style={{
              fontSize: "30px",
              marginBottom: "8px",
            }}
          >
            🎬
          </div>

          <strong>No supported 3D model selected</strong>

          <p
            style={{
              color: "#94a3b8",
              fontSize: "12px",
              margin: "8px 0 0",
            }}
          >
            The current cinematic model preview supports
            Lion and Monkey. More character models will
            be added as their 3D assets become available.
          </p>
        </div>
      </Html>
    );
  }

  return (
    <>
      {availableModels.map((model) => (
        <group
          key={model.id}
          position={model.position}
        >
          <ModelErrorBoundary>
            <Suspense
              fallback={
                <Html center>
                  <div
                    style={{
                      color: "#e2e8f0",
                      fontSize: "12px",
                      background: "rgba(15,23,42,0.85)",
                      padding: "10px 14px",
                      borderRadius: "8px",
                    }}
                  >
                    Loading {model.id}...
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
}: CharacterCanvasProps) {
  const [cameraDistance, setCameraDistance] = useState(8);

  const settings = ENVIRONMENTS[environment];

  const supportedIds = useMemo(
    () => selectedIds.filter(
      (id) => id === "lion" || id === "monkey"
    ),
    [selectedIds]
  );

  const zoomIn = () => {
    setCameraDistance((current) =>
      Math.max(4, current - 0.8)
    );
  };

  const zoomOut = () => {
    setCameraDistance((current) =>
      Math.min(15, current + 0.8)
    );
  };

  const resetCamera = () => {
    setCameraDistance(8);
  };

  return (
    <div
      style={{
        width: "100%",
        height,
        minHeight: 320,
        position: "relative",
        overflow: "hidden",
        borderRadius: "16px",
        background: settings.background,
        border: "1px solid rgba(148,163,184,0.18)",
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
          position={[0, 2.4, cameraDistance]}
          fov={38}
          near={0.1}
          far={100}
        />

        <StageLighting settings={settings} />

        <StageEnvironment
          environment={environment}
          settings={settings}
        />

        <Suspense fallback={null}>
          <CinematicCharacters
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
          maxDistance={18}
          minPolarAngle={0.25}
          maxPolarAngle={Math.PI / 2.05}
          target={[0, 1, 0]}
        />
      </Canvas>

      {showControls && (
        <>
          <div
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              display: "flex",
              gap: 8,
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                padding: "7px 11px",
                borderRadius: "7px",
                background: "rgba(15,23,42,0.78)",
                color: "#e2e8f0",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Cinematic Stage
            </span>

            <span
              style={{
                padding: "7px 10px",
                borderRadius: "7px",
                background: "rgba(15,23,42,0.65)",
                color: "#94a3b8",
                fontSize: "10px",
                textTransform: "uppercase",
              }}
            >
              {environment}
            </span>
          </div>

          <div
            style={{
              position: "absolute",
              right: 14,
              bottom: 14,
              display: "flex",
              gap: 7,
            }}
          >
            {[
              {
                label: "+",
                onClick: zoomIn,
                title: "Zoom in",
              },
              {
                label: "−",
                onClick: zoomOut,
                title: "Zoom out",
              },
              {
                label: "↺",
                onClick: resetCamera,
                title: "Reset camera",
              },
            ].map((button) => (
              <button
                key={button.title}
                type="button"
                onClick={button.onClick}
                title={button.title}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 9,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(15,23,42,0.85)",
                  color: "#ffffff",
                  fontSize: 19,
                  cursor: "pointer",
                }}
              >
                {button.label}
              </button>
            ))}
          </div>
        </>
      )}

      {selectedIds.length > 0 &&
        supportedIds.length === 0 && (
          <div
            style={{
              position: "absolute",
              bottom: 16,
              left: 16,
              right: 16,
              padding: "10px 12px",
              borderRadius: 8,
              background: "rgba(15,23,42,0.9)",
              color: "#fbbf24",
              fontSize: 12,
              textAlign: "center",
            }}
          >
            The selected character does not have a
            cinematic 3D model connected yet.
          </div>
        )}
    </div>
  );
        }
