import type { ReactNode } from "react";
import type { CharacterDefinition } from "../lib/character-catalog";

interface CharacterAnatomyProps {
  character: CharacterDefinition;
}

function Detail({
  position,
  scale,
  color,
  shape = "sphere",
  rotation
}: {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  shape?: "sphere" | "cone" | "cylinder";
  rotation?: [number, number, number];
}) {
  const geometry: ReactNode =
    shape === "cone" ? (
      <coneGeometry args={[1, 1, 16]} />
    ) : shape === "cylinder" ? (
      <cylinderGeometry args={[0.5, 0.5, 1, 16]} />
    ) : (
      <sphereGeometry args={[1, 20, 20]} />
    );

  return (
    <mesh position={position} scale={scale} rotation={rotation}>
      {geometry}
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
}

export default function CharacterAnatomy({
  character
}: CharacterAnatomyProps) {
  const id = character.id;
  const secondary = character.secondaryColor;

  switch (id) {
    case "lion":
      return (
        <group>
          <Detail position={[0, 1.78, -0.12]} scale={[0.57, 0.57, 0.3]} color="#9b5427" />
          <Detail position={[-0.43, 2.12, 0]} scale={[0.2, 0.2, 0.2]} color="#9b5427" />
          <Detail position={[0.43, 2.12, 0]} scale={[0.2, 0.2, 0.2]} color="#9b5427" />
          <Detail position={[0, 1.48, -0.5]} scale={[0.13, 0.13, 0.55]} color={secondary} rotation={[1.2, 0, 0]} />
        </group>
      );

    case "goat":
      return (
        <group>
          <Detail position={[-0.25, 2.32, 0]} scale={[0.09, 0.38, 0.09]} color="#f3e4c5" shape="cone" rotation={[0, 0, 0.2]} />
          <Detail position={[0.25, 2.32, 0]} scale={[0.09, 0.38, 0.09]} color="#f3e4c5" shape="cone" rotation={[0, 0, -0.2]} />
          <Detail position={[0, 1.43, 0.45]} scale={[0.1, 0.23, 0.1]} color="#eeeeee" />
        </group>
      );

    case "chicken":
      return (
        <group>
          <Detail position={[0, 2.2, 0]} scale={[0.09, 0.22, 0.09]} color="#e74b42" />
          <Detail position={[-0.18, 2.13, 0]} scale={[0.09, 0.18, 0.09]} color="#e74b42" />
          <Detail position={[0.18, 2.13, 0]} scale={[0.09, 0.18, 0.09]} color="#e74b42" />
          <Detail position={[0, 1.62, 0.44]} scale={[0.16, 0.12, 0.16]} color="#f3a51b" />
          <Detail position={[-0.48, 1.3, 0]} scale={[0.18, 0.12, 0.32]} color="#fff2dc" />
          <Detail position={[0.48, 1.3, 0]} scale={[0.18, 0.12, 0.32]} color="#fff2dc" />
        </group>
      );

    case "dog":
      return (
        <group>
          <Detail position={[-0.38, 1.98, 0]} scale={[0.17, 0.32, 0.13]} color={secondary} rotation={[0, 0, -0.4]} />
          <Detail position={[0.38, 1.98, 0]} scale={[0.17, 0.32, 0.13]} color={secondary} rotation={[0, 0, 0.4]} />
          <Detail position={[0, 1.38, 0.43]} scale={[0.15, 0.1, 0.12]} color="#51332d" />
        </group>
      );

    case "cat":
      return (
        <group>
          <Detail position={[-0.28, 2.12, 0]} scale={[0.19, 0.25, 0.13]} color={secondary} shape="cone" />
          <Detail position={[0.28, 2.12, 0]} scale={[0.19, 0.25, 0.13]} color={secondary} shape="cone" />
          <Detail position={[0, 0.75, -0.55]} scale={[0.1, 0.1, 0.65]} color={secondary} rotation={[0.4, 0, 0]} />
        </group>
      );

    case "monkey":
      return (
        <group>
          <Detail position={[-0.45, 1.8, 0]} scale={[0.17, 0.17, 0.1]} color="#e9b6a0" />
          <Detail position={[0.45, 1.8, 0]} scale={[0.17, 0.17, 0.1]} color="#e9b6a0" />
          <Detail position={[0, 1.45, 0.4]} scale={[0.22, 0.18, 0.12]} color="#e9b6a0" />
          <Detail position={[0, 0.75, -0.65]} scale={[0.08, 0.08, 0.55]} color={secondary} />
        </group>
      );

    case "elephant":
      return (
        <group>
          <Detail position={[-0.48, 1.78, 0]} scale={[0.25, 0.4, 0.13]} color="#a9a5b8" />
          <Detail position={[0.48, 1.78, 0]} scale={[0.25, 0.4, 0.13]} color="#a9a5b8" />
          <Detail position={[0, 1.42, 0.48]} scale={[0.13, 0.4, 0.13]} color={secondary} rotation={[0.25, 0, 0]} />
          <Detail position={[-0.2, 1.65, 0.43]} scale={[0.07, 0.3, 0.07]} color="#f6e8d1" shape="cone" rotation={[0, 0, 0.15]} />
          <Detail position={[0.2, 1.65, 0.43]} scale={[0.07, 0.3, 0.07]} color="#f6e8d1" shape="cone" rotation={[0, 0, -0.15]} />
        </group>
      );

    case "rabbit":
      return (
        <group>
          <Detail position={[-0.23, 2.35, 0]} scale={[0.13, 0.4, 0.1]} color={secondary} rotation={[0, 0, -0.12]} />
          <Detail position={[0.23, 2.35, 0]} scale={[0.13, 0.4, 0.1]} color={secondary} rotation={[0, 0, 0.12]} />
          <Detail position={[0, 0.7, -0.48]} scale={[0.2, 0.2, 0.2]} color="#ffffff" />
        </group>
      );

    case "cow":
      return (
        <group>
          <Detail position={[-0.4, 2.1, 0]} scale={[0.12, 0.2, 0.12]} color="#f5e7c8" shape="cone" />
          <Detail position={[0.4, 2.1, 0]} scale={[0.12, 0.2, 0.12]} color="#f5e7c8" shape="cone" />
          <Detail position={[-0.43, 1.72, 0.2]} scale={[0.14, 0.2, 0.06]} color="#29242b" />
          <Detail position={[0.38, 1.5, 0.2]} scale={[0.15, 0.2, 0.06]} color="#29242b" />
          <Detail position={[0, 1.38, 0.47]} scale={[0.25, 0.17, 0.12]} color="#f2a4aa" />
        </group>
      );

    case "bear":
      return (
        <group>
          <Detail position={[-0.32, 2.12, 0]} scale={[0.18, 0.18, 0.13]} color={secondary} />
          <Detail position={[0.32, 2.12, 0]} scale={[0.18, 0.18, 0.13]} color={secondary} />
          <Detail position={[0, 1.48, 0.44]} scale={[0.22, 0.17, 0.12]} color="#e8c4a0" />
        </group>
      );

    case "tomato":
    case "onion":
    case "potato":
    case "broccoli":
    case "carrot":
    case "banana":
    case "orange":
      return (
        <group>
          <Detail position={[0, 2.22, 0]} scale={[0.1, 0.22, 0.1]} color="#398c47" />
          <Detail position={[-0.17, 2.28, 0]} scale={[0.22, 0.08, 0.1]} color="#4caf50" rotation={[0, 0, 0.3]} />
          <Detail position={[0.17, 2.28, 0]} scale={[0.22, 0.08, 0.1]} color="#4caf50" rotation={[0, 0, -0.3]} />
        </group>
      );

    default:
      return null;
  }
                             }
