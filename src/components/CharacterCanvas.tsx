import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh, Group } from "three";
import {
  characters,
  type CharacterDefinition
} from "../lib/character-catalog";
import CharacterAnatomy from "./CharacterAnatomy";
import {
  createCharacterMotion
} from "../lib/character-motion";

interface CharacterModelProps {
  character: CharacterDefinition;
  index: number;
}

function CharacterModel({
  character,
  index
}: CharacterModelProps) {
  const bodyRef = useRef<Mesh>(null);
  const headRef = useRef<Group>(null);
  const characterRef = useRef<Group>(null);

  useFrame((state) => {
    const motion = createCharacterMotion({
      action: "idle",
      time: state.clock.elapsedTime,
      characterOffset: index * 1.5
    });

    if (bodyRef.current) {
      bodyRef.current.position.y =
        0.95 + motion.bodyY;

      bodyRef.current.rotation.x =
        motion.bodyRotationX;

      bodyRef.current.rotation.z =
        motion.bodyRotationZ;
    }

    if (headRef.current) {
      headRef.current.rotation.x =
        motion.headRotationX;

      headRef.current.rotation.y =
        motion.headRotationY;

      headRef.current.rotation.z =
        motion.headRotationZ;
    }

    if (characterRef.current) {
      characterRef.current.position.y = 0;
    }
  });

  const x = (index - 1.5) * 1.65;

  return (
    <group
      ref={characterRef}
      position={[x, 0, 0]}
      scale={character.size}
    >
      {/* Character body */}
      <mesh
        ref={bodyRef}
        position={[0, 0.95, 0]}
        castShadow
      >
        <sphereGeometry args={[0.58, 32, 32]} />

        <meshStandardMaterial
          color={character.color}
          roughness={0.7}
        />
      </mesh>

      {/* Character head */}
      <group
        ref={headRef}
        position={[0, 1.75, 0]}
      >
        <mesh castShadow>
          <sphereGeometry args={[0.43, 32, 32]} />

          <meshStandardMaterial
            color={character.color}
            roughness={0.65}
          />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.15, 0.07, 0.365]}>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>

        <mesh position={[-0.15, 0.07, 0.43]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial color="#17121f" />
        </mesh>

        <mesh position={[0.15, 0.07, 0.365]}>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>

        <mesh position={[0.15, 0.07, 0.43]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial color="#17121f" />
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.08, 0.425]}>
          <sphereGeometry args={[0.065, 16, 16]} />

          <meshStandardMaterial
            color={character.secondaryColor}
          />
        </mesh>

        {/* Mouth */}
        <mesh position={[0, -0.23, 0.39]}>
          <sphereGeometry args={[0.105, 16, 16]} />

          <meshStandardMaterial color="#54252c" />
        </mesh>

        {/* Species-specific anatomy */}
        <CharacterAnatomy character={character} />
      </group>

      {/* Arms */}
      <mesh
        position={[-0.58, 0.95, 0]}
        rotation={[0, 0, -0.3]}
      >
        <capsuleGeometry args={[0.12, 0.45, 4, 8]} />

        <meshStandardMaterial
          color={character.secondaryColor}
        />
      </mesh>

      <mesh
        position={[0.58, 0.95, 0]}
        rotation={[0, 0, 0.3]}
      >
        <capsuleGeometry args={[0.12, 0.45, 4, 8]} />

        <meshStandardMaterial
          color={character.secondaryColor}
        />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.22, 0.28, 0]}>
        <capsuleGeometry args={[0.12, 0.35, 4, 8]} />

        <meshStandardMaterial
          color={character.secondaryColor}
        />
      </mesh>

      <mesh position={[0.22, 0.28, 0]}>
        <capsuleGeometry args={[0.12, 0.35, 4, 8]} />

        <meshStandardMaterial
          color={character.secondaryColor}
        />
      </mesh>
    </group>
  );
}

interface CharacterCanvasProps {
  selectedIds: string[];
}

export default function CharacterCanvas({
  selectedIds
}: CharacterCanvasProps) {
  const selectedCharacters = characters.filter(
    (character) => selectedIds.includes(character.id)
  );

  return (
    <div
      className="character-stage"
      style={{
        width: "100%",
        height: "380px"
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
          alpha: true,
          powerPreference: "low-power"
        }}
      >
        <ambientLight intensity={1.5} />

        <directionalLight
          position={[4, 7, 5]}
          intensity={2}
          castShadow
        />

        <pointLight
          position={[-4, 3, -3]}
          intensity={1}
          color="#a78bfa"
        />

        <group position={[0, -0.4, 0]}>
          {selectedCharacters.map((character, index) => (
            <CharacterModel
              key={character.id}
              character={character}
              index={index}
            />
          ))}

          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.03, 0]}
            receiveShadow
          >
            <circleGeometry args={[6, 64]} />

            <meshStandardMaterial
              color="#292b42"
              roughness={0.9}
            />
          </mesh>
        </group>

        <OrbitControls
          enablePan={false}
          minDistance={5}
          maxDistance={12}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
