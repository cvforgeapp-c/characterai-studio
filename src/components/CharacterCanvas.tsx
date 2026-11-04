import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useMemo, useState } from "react";

import {
  characters,
  type CharacterDefinition
} from "../lib/character-catalog";

import ProceduralCharacter from "./ProceduralCharacter";

import type {
  CharacterTransform
} from "./ProceduralCharacter";

import type { CharacterAction } from "../lib/character-motion";

import type { CharacterAppearance } from "./CharacterStage";

export type EnvironmentId =
  | "studio"
  | "park"
  | "kitchen"
  | "city"
  | "space"
  | "beach";

/* -------------------------------------------------
   ENVIRONMENT COMPONENTS
------------------------------------------------- */

function Tree({
  position,
  scale = 1
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 1.3, 8]} />
        <meshStandardMaterial color="#70452c" />
      </mesh>

      <mesh position={[0, 1.55, 0]} castShadow>
        <coneGeometry args={[0.8, 1.8, 9]} />
        <meshStandardMaterial color="#25834f" />
      </mesh>

      <mesh position={[0, 2.15, 0]} castShadow>
        <sphereGeometry args={[0.45, 12, 12]} />
        <meshStandardMaterial color="#39a65d" />
      </mesh>
    </group>
  );
}

function Cloud({
  position,
  scale = 1
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      <mesh position={[0.4, 0.05, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      <mesh position={[-0.35, 0.05, 0]}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function Mountain({
  position,
  color,
  scale = 1
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
}) {
  return (
    <mesh
      position={position}
      scale={scale}
      castShadow
    >
      <coneGeometry args={[2.2, 3.5, 5]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Building({
  position,
  color,
  height
}: {
  position: [number, number, number];
  color: string;
  height: number;
}) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[1.1, height, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {Array.from({ length: 3 }).map((_, index) => (
        <mesh
          key={index}
          position={[0, 0.5 + index * 0.7, 0.51]}
        >
          <planeGeometry args={[0.35, 0.35]} />
          <meshStandardMaterial
            color="#f6d879"
            emissive="#f6d879"
            emissiveIntensity={0.25}
          />
        </mesh>
      ))}
    </group>
  );
}

/* -------------------------------------------------
   SIX 3D ENVIRONMENTS
------------------------------------------------- */

function Environment({
  type
}: {
  type: EnvironmentId;
}) {
  const scenery = useMemo(() => {
    switch (type) {
      case "park":
        return {
          sky: "#8bc9e8",
          ground: "#387d49",
          fog: "#b8d9e8"
        };

      case "kitchen":
        return {
          sky: "#c9a98d",
          ground: "#785b48",
          fog: "#c9a98d"
        };

      case "city":
        return {
          sky: "#8ca4c4",
          ground: "#535b6a",
          fog: "#a8b7cc"
        };

      case "space":
        return {
          sky: "#080b24",
          ground: "#171b3d",
          fog: "#080b24"
        };

      case "beach":
        return {
          sky: "#78c9e9",
          ground: "#e2c68a",
          fog: "#b4dce8"
        };

      default:
        return {
          sky: "#282442",
          ground: "#292b42",
          fog: "#282442"
        };
    }
  }, [type]);

  return (
    <>
      <color attach="background" args={[scenery.sky]} />

      <fog
        attach="fog"
        args={[scenery.fog, 12, 28]}
      />

      <ambientLight intensity={1.15} />

      <directionalLight
        position={[5, 8, 5]}
        intensity={2.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <hemisphereLight
        args={["#d9eaff", "#554466", 0.7]}
      />

      {type === "park" && (
        <>
          <Tree position={[-4, -0.2, -2]} scale={1.2} />
          <Tree position={[4, -0.2, -3]} scale={1.1} />
          <Tree position={[-5, -0.2, 2]} />
          <Tree position={[5, -0.2, 2]} />

          <Cloud position={[-3, 4, -5]} />
          <Cloud position={[3, 4.5, -5]} scale={1.2} />

          <Mountain
            position={[-5, 0, -8]}
            color="#6d967d"
            scale={1.6}
          />

          <Mountain
            position={[5, 0, -9]}
            color="#759c86"
            scale={1.8}
          />
        </>
      )}

      {type === "kitchen" && (
        <>
          <mesh position={[0, 1.8, -4]}>
            <boxGeometry args={[11, 4, 0.3]} />
            <meshStandardMaterial color="#b99170" />
          </mesh>

          <mesh position={[0, 0.5, -2.2]}>
            <boxGeometry args={[7, 0.15, 1.5]} />
            <meshStandardMaterial color="#a8784e" />
          </mesh>

          <mesh position={[-3.5, 1.4, -2.1]}>
            <boxGeometry args={[0.8, 2.5, 0.8]} />
            <meshStandardMaterial color="#ded5c4" />
          </mesh>

          <mesh position={[3.5, 1.4, -2.1]}>
            <boxGeometry args={[0.8, 2.5, 0.8]} />
            <meshStandardMaterial color="#ded5c4" />
          </mesh>
        </>
      )}

      {type === "city" && (
        <>
          <Building position={[-5, 0, -4]} color="#637a99" height={4} />
          <Building position={[-3.5, 0, -5]} color="#8a789e" height={5} />
          <Building position={[4, 0, -5]} color="#657f9d" height={4.5} />
          <Building position={[5.5, 0, -3]} color="#a17f82" height={3.5} />
        </>
      )}

      {type === "space" && (
        <>
          <Stars
            radius={80}
            depth={40}
            count={1500}
            factor={4}
            saturation={0}
            fade
            speed={0.5}
          />

          <mesh position={[-4, 3, -8]}>
            <sphereGeometry args={[0.7, 24, 24]} />
            <meshStandardMaterial
              color="#d7a8ff"
              emissive="#8d55d9"
              emissiveIntensity={0.7}
            />
          </mesh>

          <mesh position={[4, -1, -7]}>
            <sphereGeometry args={[1.1, 24, 24]} />
            <meshStandardMaterial
              color="#536bd4"
              roughness={0.8}
            />
          </mesh>

          <pointLight
            position={[-4, 3, -5]}
            color="#b78aff"
            intensity={3}
          />
        </>
      )}

      {type === "beach" && (
        <>
          <mesh
            position={[0, 0.03, -5]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[20, 8]} />
            <meshStandardMaterial color="#48a9d5" />
          </mesh>

          <Cloud position={[-4, 4, -5]} />
          <Cloud position={[4, 4.5, -5]} />

          <mesh position={[4, 0.3, -3]}>
            <cylinderGeometry args={[0.08, 0.08, 1.2, 8]} />
            <meshStandardMaterial color="#7b4b2a" />
          </mesh>

          <mesh position={[4, 1, -3]}>
            <coneGeometry args={[0.75, 0.9, 8]} />
            <meshStandardMaterial color="#268b53" />
          </mesh>
        </>
      )}

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.08, 0]}
        receiveShadow
      >
        <circleGeometry args={[18, 64]} />
        <meshStandardMaterial
          color={scenery.ground}
          roughness={0.9}
        />
      </mesh>

      {type === "studio" && (
        <>
          <spotLight
            position={[-4, 6, 3]}
            angle={0.6}
            penumbra={0.8}
            intensity={2}
            color="#a78bfa"
          />

          <spotLight
            position={[4, 6, 3]}
            angle={0.6}
            penumbra={0.8}
            intensity={2}
            color="#67e8f9"
          />
        </>
      )}
    </>
  );
}

/* -------------------------------------------------
   CHARACTER POSITIONING CONTROLS
------------------------------------------------- */

const DEFAULT_TRANSFORM: CharacterTransform = {
  x: 0,
  y: 0,
  z: 0,
  scale: 1,
  rotation: 0
};

function createDefaultTransform(): CharacterTransform {
  return { ...DEFAULT_TRANSFORM };
}

function CharacterPositionControls({
  character,
  transform,
  onChange,
  onReset
}: {
  character: CharacterDefinition;
  transform: CharacterTransform;
  onChange: (value: CharacterTransform) => void;
  onReset: () => void;
}) {
  function update(
    key: keyof CharacterTransform,
    value: number
  ) {
    onChange({
      ...transform,
      [key]: value
    });
  }

  return (
    <div
      style={{
        padding: 14,
        marginTop: 12,
        borderRadius: 12,
        background: "rgba(255,255,255,0.06)"
      }}
    >
      <strong>{character.name} — Position & Size</strong>

      <label className="field-label">
        Horizontal position: {transform.x.toFixed(1)}
      </label>

      <input
        type="range"
        min="-4"
        max="4"
        step="0.1"
        value={transform.x}
        onChange={(event) =>
          update("x", Number(event.target.value))
        }
        style={{ width: "100%" }}
      />

      <label className="field-label">
        Height: {transform.y.toFixed(1)}
      </label>

      <input
        type="range"
        min="-1"
        max="3"
        step="0.1"
        value={transform.y}
        onChange={(event) =>
          update("y", Number(event.target.value))
        }
        style={{ width: "100%" }}
      />

      <label className="field-label">
        Depth: {transform.z.toFixed(1)}
      </label>

      <input
        type="range"
        min="-4"
        max="4"
        step="0.1"
        value={transform.z}
        onChange={(event) =>
          update("z", Number(event.target.value))
        }
        style={{ width: "100%" }}
      />

      <label className="field-label">
        Character size: {transform.scale.toFixed(1)}x
      </label>

      <input
        type="range"
        min="0.5"
        max="2"
        step="0.1"
        value={transform.scale}
        onChange={(event) =>
          update("scale", Number(event.target.value))
        }
        style={{ width: "100%" }}
      />

      <label className="field-label">
        Rotation: {Math.round((transform.rotation * 180) / Math.PI)}°
      </label>

      <input
        type="range"
        min={-Math.PI}
        max={Math.PI}
        step="0.05"
        value={transform.rotation}
        onChange={(event) =>
          update("rotation", Number(event.target.value))
        }
        style={{ width: "100%" }}
      />

      <button
        type="button"
        className="secondary-button"
        onClick={onReset}
        style={{ marginTop: 12 }}
      >
        Reset Character
      </button>
    </div>
  );
}

/* -------------------------------------------------
   MAIN CHARACTER CANVAS
------------------------------------------------- */

interface CharacterCanvasProps {
  selectedIds: string[];
  environment?: EnvironmentId;
  action?: CharacterAction;
  appearances?: Record<string, CharacterAppearance>;
}

export default function CharacterCanvas({
  selectedIds,
  environment = "studio",
  action = "idle",
  appearances = {}
}: CharacterCanvasProps) {
  const selectedCharacters = characters.filter(
    (character) => selectedIds.includes(character.id)
  );

  // Corrected TypeScript state declaration.
  const [transforms, setTransforms] = useState<
    Record<string, CharacterTransform>
  >({});

  const [editingCharacter, setEditingCharacter] = useState<string>(
    selectedIds[0] ?? ""
  );

  function getTransform(id: string): CharacterTransform {
    return transforms[id] ?? createDefaultTransform();
  }

  function updateTransform(
    id: string,
    value: CharacterTransform
  ) {
    setTransforms((previous) => ({
      ...previous,
      [id]: value
    }));
  }

  function resetTransform(id: string) {
    setTransforms((previous) => ({
      ...previous,
      [id]: createDefaultTransform()
    }));
  }

  const activeCharacter =
    selectedCharacters.find(
      (character) => character.id === editingCharacter
    ) ?? selectedCharacters[0];

  return (
    <div style={{ width: "100%" }}>
      <div
        className="character-stage"
        style={{
          width: "100%",
          height: "380px",
          overflow: "hidden",
          borderRadius: "14px"
        }}
      >
        <Canvas
          camera={{
            position: [0, 2.8, 8],
            fov: 38
          }}
          shadows
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "low-power"
          }}
        >
          <Environment type={environment} />

          <group position={[0, -0.4, 0]}>
            {selectedCharacters.map((character, index) => {
              const appearance = appearances[character.id];

              return (
                <ProceduralCharacter
                  key={character.id}
                  character={character}
                  index={index}
                  total={selectedCharacters.length}
                  action={action}
                  transform={getTransform(character.id)}
                  style={appearance?.style ?? "pixar"}
                  skinTone={appearance?.skinTone}
                  clothingColor={appearance?.clothingColor}
                  hairColor={appearance?.hairColor}
                />
              );
            })}
          </group>

          <OrbitControls
            enablePan={false}
            enableZoom
            minDistance={5}
            maxDistance={13}
            maxPolarAngle={Math.PI / 2}
            target={[0, 1, 0]}
          />
        </Canvas>
      </div>

      {selectedCharacters.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <span className="section-eyebrow">
            CHARACTER ARRANGEMENT
          </span>

          <h3>Position Your Characters</h3>

          <div
            className="mode-grid"
            style={{ marginTop: 12 }}
          >
            {selectedCharacters.map((character) => (
              <button
                key={character.id}
                type="button"
                className={`mode-card ${
                  activeCharacter?.id === character.id
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setEditingCharacter(character.id)
                }
                aria-pressed={
                  activeCharacter?.id === character.id
                }
              >
                <span
                  style={{
                    display: "block",
                    fontSize: 28,
                    marginBottom: 6
                  }}
                >
                  {character.emoji}
                </span>

                <strong>{character.name}</strong>
              </button>
            ))}
          </div>

          {activeCharacter && (
            <CharacterPositionControls
              character={activeCharacter}
              transform={getTransform(activeCharacter.id)}
              onChange={(value) =>
                updateTransform(activeCharacter.id, value)
              }
              onReset={() =>
                resetTransform(activeCharacter.id)
              }
            />
          )}

          <button
            type="button"
            className="secondary-button"
            style={{ marginTop: 12 }}
            onClick={() => setTransforms({})}
          >
            Reset All Characters
          </button>
        </div>
      )}
    </div>
  );
  }
