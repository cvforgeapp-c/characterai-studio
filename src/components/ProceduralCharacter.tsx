import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";

import type { CharacterDefinition } from "../lib/character-catalog";
import CharacterAnatomy from "./CharacterAnatomy";

import {
  createCharacterMotion,
  type CharacterAction
} from "../lib/character-motion";

export type CharacterStyle = "pixar" | "realistic";

export interface CharacterTransform {
  x: number;
  y: number;
  z: number;
  scale: number;
  rotation: number;
}

interface ProceduralCharacterProps {
  character: CharacterDefinition;
  index: number;
  total: number;
  action: CharacterAction;
  transform: CharacterTransform;
  style?: CharacterStyle;
  skinTone?: string;
  clothingColor?: string;
  hairColor?: string;
}

const SKIN_TONES = [
  "#f1c7a5",
  "#dca47c",
  "#bd805b",
  "#925b40",
  "#70452f",
  "#4d3027"
];

const CLOTHING_COLORS = [
  "#2563eb",
  "#dc3545",
  "#16a085",
  "#8b5cf6",
  "#e68a24",
  "#34495e",
  "#db2777",
  "#16865c"
];

const HAIR_COLORS = [
  "#211a18",
  "#493026",
  "#75452d",
  "#171717",
  "#a36b35"
];

export default function ProceduralCharacter({
  character,
  index,
  total,
  action,
  transform,
  style = "pixar",
  skinTone,
  clothingColor,
  hairColor
}: ProceduralCharacterProps) {
  const characterRef = useRef<Group>(null);
  const bodyRef = useRef<Mesh>(null);
  const headRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const mouthRef = useRef<Mesh>(null);
  const leftEyeRef = useRef<Mesh>(null);
  const rightEyeRef = useRef<Mesh>(null);

  const spacing = 1.8;
  const defaultX = (index - (total - 1) / 2) * spacing;

  const realistic = style === "realistic";

  const colors = useMemo(() => {
    return {
      skin: skinTone ?? SKIN_TONES[index % SKIN_TONES.length],
      clothes:
        clothingColor ??
        CLOTHING_COLORS[index % CLOTHING_COLORS.length],
      hair: hairColor ?? HAIR_COLORS[index % HAIR_COLORS.length],
      species: character.color,
      secondary: character.secondaryColor
    };
  }, [
    character.color,
    character.secondaryColor,
    index,
    skinTone,
    clothingColor,
    hairColor
  ]);

  const hairstyle = index % 4;

  const headSize = realistic ? 0.35 : 0.39;
  const bodyWidth = realistic ? 0.36 : 0.41;
  const bodyHeight = realistic ? 0.58 : 0.55;

  useFrame((state) => {
    const motion = createCharacterMotion({
      action,
      time: state.clock.elapsedTime,
      characterOffset: index * 1.5
    });

    if (characterRef.current) {
      characterRef.current.position.y =
        transform.y +
        Math.sin(state.clock.elapsedTime * 2 + index) * 0.025;
    }

    if (bodyRef.current) {
      bodyRef.current.position.y = 1.05 + motion.bodyY;
      bodyRef.current.rotation.x = motion.bodyRotationX;
      bodyRef.current.rotation.z = motion.bodyRotationZ;
    }

    if (headRef.current) {
      headRef.current.rotation.x = motion.headRotationX;
      headRef.current.rotation.y = motion.headRotationY;
      headRef.current.rotation.z = motion.headRotationZ;
    }

    if (leftArmRef.current) {
      leftArmRef.current.rotation.z = motion.leftArmRotationZ;
    }

    if (rightArmRef.current) {
      rightArmRef.current.rotation.z = motion.rightArmRotationZ;
    }

    if (leftLegRef.current) {
      leftLegRef.current.rotation.x =
        action === "walk"
          ? Math.sin(state.clock.elapsedTime * 5 + index) * 0.45
          : 0;
    }

    if (rightLegRef.current) {
      rightLegRef.current.rotation.x =
        action === "walk"
          ? Math.sin(
              state.clock.elapsedTime * 5 + index + Math.PI
            ) * 0.45
          : 0;
    }

    if (mouthRef.current) {
      mouthRef.current.scale.y = 1 + motion.mouthOpen * 3;
    }

    if (leftEyeRef.current && rightEyeRef.current) {
      const blink = motion.blink ? 0.15 : 1;
      leftEyeRef.current.scale.y = blink;
      rightEyeRef.current.scale.y = blink;
    }
  });

  return (
    <group
      ref={characterRef}
      position={[
        defaultX + transform.x,
        transform.y,
        transform.z
      ]}
      rotation={[0, transform.rotation, 0]}
      scale={character.size * transform.scale}
    >
      {/* BODY / SHIRT */}

      <mesh
        ref={bodyRef}
        position={[0, 1.05, 0]}
        scale={[
          bodyWidth,
          bodyHeight,
          realistic ? 0.24 : 0.29
        ]}
        castShadow
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={colors.clothes}
          roughness={realistic ? 0.85 : 0.55}
        />
      </mesh>

      {/* SHIRT COLLAR */}

      <mesh position={[0, 1.48, 0.15]}>
        <torusGeometry args={[0.13, 0.035, 8, 24]} />
        <meshStandardMaterial color="#f4eee5" />
      </mesh>

      {/* NECK */}

      <mesh position={[0, 1.58, 0]} castShadow>
        <cylinderGeometry args={[0.105, 0.13, 0.25, 24]} />
        <meshStandardMaterial
          color={colors.skin}
          roughness={realistic ? 0.9 : 0.7}
        />
      </mesh>

      {/* HEAD */}

      <group
        ref={headRef}
        position={[0, 1.88, 0]}
      >
        <mesh castShadow>
          <sphereGeometry args={[headSize, 40, 40]} />
          <meshStandardMaterial
            color={colors.skin}
            roughness={realistic ? 0.85 : 0.65}
          />
        </mesh>

        {/* EARS */}

        <mesh position={[-headSize * 0.92, 0, 0]}>
          <sphereGeometry args={[0.075, 20, 20]} />
          <meshStandardMaterial color={colors.skin} />
        </mesh>

        <mesh position={[headSize * 0.92, 0, 0]}>
          <sphereGeometry args={[0.075, 20, 20]} />
          <meshStandardMaterial color={colors.skin} />
        </mesh>

        {/* LEFT EYE */}

        <mesh
          ref={leftEyeRef}
          position={[-0.135, 0.055, headSize * 0.84]}
        >
          <sphereGeometry args={[0.065, 24, 24]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        <mesh position={[-0.135, 0.055, headSize * 0.98]}>
          <sphereGeometry args={[0.033, 20, 20]} />
          <meshStandardMaterial color="#211915" />
        </mesh>

        <mesh position={[-0.145, 0.07, headSize * 1.055]}>
          <sphereGeometry args={[0.012, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* RIGHT EYE */}

        <mesh
          ref={rightEyeRef}
          position={[0.135, 0.055, headSize * 0.84]}
        >
          <sphereGeometry args={[0.065, 24, 24]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        <mesh position={[0.135, 0.055, headSize * 0.98]}>
          <sphereGeometry args={[0.033, 20, 20]} />
          <meshStandardMaterial color="#211915" />
        </mesh>

        <mesh position={[0.125, 0.07, headSize * 1.055]}>
          <sphereGeometry args={[0.012, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* EYEBROWS */}

        <mesh
          position={[-0.135, 0.15, headSize * 0.87]}
          rotation={[0, 0, -0.08]}
        >
          <boxGeometry args={[0.12, 0.025, 0.035]} />
          <meshStandardMaterial color={colors.hair} />
        </mesh>

        <mesh
          position={[0.135, 0.15, headSize * 0.87]}
          rotation={[0, 0, 0.08]}
        >
          <boxGeometry args={[0.12, 0.025, 0.035]} />
          <meshStandardMaterial color={colors.hair} />
        </mesh>

        {/* NOSE */}

        <mesh position={[0, -0.075, headSize * 0.98]}>
          <sphereGeometry args={[0.055, 20, 20]} />
          <meshStandardMaterial color={colors.skin} />
        </mesh>

        {/* MOUTH */}

        <mesh
          ref={mouthRef}
          position={[0, -0.21, headSize * 0.89]}
        >
          <sphereGeometry args={[0.075, 24, 24]} />
          <meshStandardMaterial
            color="#632c35"
            roughness={0.5}
          />
        </mesh>

        {/* HAIR CAP */}

        <mesh
          position={[0, headSize * 0.72, -0.015]}
          scale={[1.02, 0.55, 1.02]}
        >
          <sphereGeometry args={[headSize, 32, 24]} />
          <meshStandardMaterial
            color={colors.hair}
            roughness={0.9}
          />
        </mesh>

        {/* HAIRSTYLE VARIATIONS */}

        {hairstyle === 0 && (
          <>
            <mesh position={[-0.23, 0.17, -0.01]}>
              <sphereGeometry args={[0.13, 16, 16]} />
              <meshStandardMaterial color={colors.hair} />
            </mesh>

            <mesh position={[0.23, 0.17, -0.01]}>
              <sphereGeometry args={[0.13, 16, 16]} />
              <meshStandardMaterial color={colors.hair} />
            </mesh>
          </>
        )}

        {hairstyle === 1 && (
          <>
            <mesh position={[0, 0.31, 0.02]}>
              <sphereGeometry args={[0.18, 20, 20]} />
              <meshStandardMaterial color={colors.hair} />
            </mesh>

            <mesh position={[0.18, 0.25, 0.02]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color={colors.hair} />
            </mesh>
          </>
        )}

        {hairstyle === 2 && (
          <>
            <mesh position={[-0.22, 0.05, 0]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color={colors.hair} />
            </mesh>

            <mesh position={[0.22, 0.05, 0]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color={colors.hair} />
            </mesh>

            <mesh position={[0, 0.25, 0]}>
              <sphereGeometry args={[0.16, 16, 16]} />
              <meshStandardMaterial color={colors.hair} />
            </mesh>
          </>
        )}

        {hairstyle === 3 && (
          <>
            <mesh position={[-0.2, 0.12, 0]}>
              <sphereGeometry args={[0.13, 16, 16]} />
              <meshStandardMaterial color={colors.hair} />
            </mesh>

            <mesh position={[0.2, 0.12, 0]}>
              <sphereGeometry args={[0.13, 16, 16]} />
              <meshStandardMaterial color={colors.hair} />
            </mesh>
          </>
        )}

        {/* EXISTING SPECIES DETAILS */}

        <CharacterAnatomy character={character} />
      </group>

      {/* LEFT ARM */}

      <group
        ref={leftArmRef}
        position={[-0.4, 1.34, 0]}
      >
        {/* Shirt sleeve */}

        <mesh position={[0, -0.14, 0]} castShadow>
          <capsuleGeometry args={[0.105, 0.22, 6, 12]} />
          <meshStandardMaterial color={colors.clothes} />
        </mesh>

        {/* Forearm */}

        <mesh position={[0, -0.37, 0]} castShadow>
          <capsuleGeometry args={[0.075, 0.28, 6, 12]} />
          <meshStandardMaterial color={colors.skin} />
        </mesh>

        {/* Hand */}

        <mesh position={[0, -0.57, 0.025]} castShadow>
          <sphereGeometry args={[0.09, 20, 20]} />
          <meshStandardMaterial color={colors.skin} />
        </mesh>

        {/* Fingers */}

        {[-0.055, -0.018, 0.018, 0.055].map((x, i) => (
          <mesh
            key={i}
            position={[x, -0.64, 0.04]}
          >
            <capsuleGeometry args={[0.018, 0.065, 4, 8]} />
            <meshStandardMaterial color={colors.skin} />
          </mesh>
        ))}
      </group>

      {/* RIGHT ARM */}

      <group
        ref={rightArmRef}
        position={[0.4, 1.34, 0]}
      >
        <mesh position={[0, -0.14, 0]} castShadow>
          <capsuleGeometry args={[0.105, 0.22, 6, 12]} />
          <meshStandardMaterial color={colors.clothes} />
        </mesh>

        <mesh position={[0, -0.37, 0]} castShadow>
          <capsuleGeometry args={[0.075, 0.28, 6, 12]} />
          <meshStandardMaterial color={colors.skin} />
        </mesh>

        <mesh position={[0, -0.57, 0.025]} castShadow>
          <sphereGeometry args={[0.09, 20, 20]} />
          <meshStandardMaterial color={colors.skin} />
        </mesh>

        {[-0.055, -0.018, 0.018, 0.055].map((x, i) => (
          <mesh
            key={i}
            position={[x, -0.64, 0.04]}
          >
            <capsuleGeometry args={[0.018, 0.065, 4, 8]} />
            <meshStandardMaterial color={colors.skin} />
          </mesh>
        ))}
      </group>

      {/* TROUSERS / LEFT LEG */}

      <group
        ref={leftLegRef}
        position={[-0.2, 0.65, 0]}
      >
        <mesh position={[0, -0.2, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.4, 6, 12]} />
          <meshStandardMaterial color="#26364a" />
        </mesh>

        {/* Shoe */}

        <mesh position={[0, -0.48, 0.09]} castShadow>
          <sphereGeometry args={[0.15, 20, 20]} />
          <meshStandardMaterial color="#25252a" roughness={0.8} />
        </mesh>
      </group>

      {/* TROUSERS / RIGHT LEG */}

      <group
        ref={rightLegRef}
        position={[0.2, 0.65, 0]}
      >
        <mesh position={[0, -0.2, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.4, 6, 12]} />
          <meshStandardMaterial color="#26364a" />
        </mesh>

        <mesh position={[0, -0.48, 0.09]} castShadow>
          <sphereGeometry args={[0.15, 20, 20]} />
          <meshStandardMaterial color="#25252a" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
                     }
