import { useRef } from "react";
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
}

export default function ProceduralCharacter({
character,
index,
total,
action,
transform,
style = "pixar"
}: ProceduralCharacterProps) {
const characterRef = useRef<Group>(null);
const bodyRef = useRef<Mesh>(null);
const headRef = useRef<Group>(null);
const leftArmRef = useRef<Group>(null);
const rightArmRef = useRef<Group>(null);
const leftLegRef = useRef<Group>(null);
const rightLegRef = useRef<Group>(null);
const mouthRef = useRef<Mesh>(null);

const spacing = 1.8;
const defaultX = (index - (total - 1) / 2) * spacing;

const bodyColor = character.color;
const secondaryColor = character.secondaryColor;

const realistic = style === "realistic";

const bodyRoughness = realistic ? 0.9 : 0.65;
const bodyWidth = realistic ? 0.43 : 0.48;
const bodyHeight = realistic ? 0.62 : 0.57;
const headSize = realistic ? 0.37 : 0.43;

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
      ? Math.sin(state.clock.elapsedTime * 5 + index + Math.PI) * 0.45
      : 0;
}

if (mouthRef.current) {
  mouthRef.current.scale.y = 1 + motion.mouthOpen * 3;
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
{/* Human-like body */}
<mesh
ref={bodyRef}
position={[0, 1.05, 0]}
scale={[bodyWidth, bodyHeight, realistic ? 0.25 : 0.31]}
castShadow
>
<sphereGeometry args={[1, 32, 32]} />
<meshStandardMaterial
color={bodyColor}
roughness={bodyRoughness}
/>
</mesh>

  {/* Neck */}
  <mesh
    position={[0, 1.57, 0]}
    castShadow
  >
    <cylinderGeometry args={[0.14, 0.17, 0.25, 20]} />
    <meshStandardMaterial
      color={bodyColor}
      roughness={bodyRoughness}
    />
  </mesh>

  {/* Head and facial features */}
  <group
    ref={headRef}
    position={[0, 1.88, 0]}
  >
    <mesh castShadow>
      <sphereGeometry args={[headSize, 32, 32]} />
      <meshStandardMaterial
        color={bodyColor}
        roughness={bodyRoughness}
      />
    </mesh>

    {/* Left eye */}
    <mesh position={[-0.14, 0.07, headSize * 0.83]}>
      <sphereGeometry args={[0.075, 20, 20]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>

    <mesh position={[-0.14, 0.07, headSize * 0.96]}>
      <sphereGeometry args={[0.037, 16, 16]} />
      <meshStandardMaterial color="#17121f" />
    </mesh>

    {/* Right eye */}
    <mesh position={[0.14, 0.07, headSize * 0.83]}>
      <sphereGeometry args={[0.075, 20, 20]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>

    <mesh position={[0.14, 0.07, headSize * 0.96]}>
      <sphereGeometry args={[0.037, 16, 16]} />
      <meshStandardMaterial color="#17121f" />
    </mesh>

    {/* Nose */}
    <mesh position={[0, -0.08, headSize]}>
      <sphereGeometry args={[0.065, 16, 16]} />
      <meshStandardMaterial color={secondaryColor} />
    </mesh>

    {/* Animated mouth */}
    <mesh
      ref={mouthRef}
      position={[0, -0.22, headSize * 0.91]}
    >
      <sphereGeometry args={[0.09, 20, 20]} />
      <meshStandardMaterial color="#54252c" />
    </mesh>

    {/* Animal ears, horns, tails and food details */}
    <CharacterAnatomy character={character} />
  </group>

  {/* Left shoulder and upper arm */}
  <group
    ref={leftArmRef}
    position={[-0.43, 1.35, 0]}
  >
    <mesh
      position={[0, -0.23, 0]}
      castShadow
    >
      <capsuleGeometry args={[0.105, 0.35, 6, 12]} />
      <meshStandardMaterial
        color={bodyColor}
        roughness={bodyRoughness}
      />
    </mesh>

    {/* Left hand */}
    <mesh position={[0, -0.49, 0.015]} castShadow>
      <sphereGeometry args={[0.12, 20, 20]} />
      <meshStandardMaterial color={secondaryColor} />
    </mesh>

    {/* Fingers */}
    {[-0.07, -0.02, 0.03, 0.08].map((x, i) => (
      <mesh
        key={i}
        position={[x, -0.57, 0.035]}
      >
        <capsuleGeometry args={[0.025, 0.07, 4, 8]} />
        <meshStandardMaterial color={secondaryColor} />
      </mesh>
    ))}
  </group>

  {/* Right shoulder and upper arm */}
  <group
    ref={rightArmRef}
    position={[0.43, 1.35, 0]}
  >
    <mesh
      position={[0, -0.23, 0]}
      castShadow
    >
      <capsuleGeometry args={[0.105, 0.35, 6, 12]} />
      <meshStandardMaterial
        color={bodyColor}
        roughness={bodyRoughness}
      />
    </mesh>

    {/* Right hand */}
    <mesh position={[0, -0.49, 0.015]} castShadow>
      <sphereGeometry args={[0.12, 20, 20]} />
      <meshStandardMaterial color={secondaryColor} />
    </mesh>

    {/* Fingers */}
    {[-0.07, -0.02, 0.03, 0.08].map((x, i) => (
      <mesh
        key={i}
        position={[x, -0.57, 0.035]}
      >
        <capsuleGeometry args={[0.025, 0.07, 4, 8]} />
        <meshStandardMaterial color={secondaryColor} />
      </mesh>
    ))}
  </group>

  {/* Left leg */}
  <group
    ref={leftLegRef}
    position={[-0.2, 0.65, 0]}
  >
    <mesh position={[0, -0.2, 0]} castShadow>
      <capsuleGeometry args={[0.13, 0.4, 6, 12]} />
      <meshStandardMaterial color={secondaryColor} />
    </mesh>

    {/* Left foot / shoe */}
    <mesh position={[0, -0.49, 0.09]} castShadow>
      <sphereGeometry args={[0.17, 20, 20]} />
      <meshStandardMaterial color="#292b35" />
    </mesh>
  </group>

  {/* Right leg */}
  <group
    ref={rightLegRef}
    position={[0.2, 0.65, 0]}
  >
    <mesh position={[0, -0.2, 0]} castShadow>
      <capsuleGeometry args={[0.13, 0.4, 6, 12]} />
      <meshStandardMaterial color={secondaryColor} />
    </mesh>

    {/* Right foot / shoe */}
    <mesh position={[0, -0.49, 0.09]} castShadow>
      <sphereGeometry args={[0.17, 20, 20]} />
      <meshStandardMaterial color="#292b35" />
    </mesh>
  </group>
</group>

);
    }
