import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

type CharacterAction =
  | "idle"
  | "talk"
  | "walk"
  | "jump"
  | "laugh"
  | "angry"
  | "surprised"
  | "blink"
  | "wave"
  | "dance"
  | "cry";

interface Props {
  id: string;
  action?: CharacterAction;
  position?: [number, number, number];
  scale?: number;
}

const DESIGNS: Record<string, {
  body: string;
  head: string;
  accent: string;
  height: number;
  animal: boolean;
}> = {
  lion: {
    body: "#c68a42",
    head: "#e4ae65",
    accent: "#8c4925",
    height: 1.9,
    animal: true,
  },
  monkey: {
    body: "#86502f",
    head: "#a76c45",
    accent: "#e8b98e",
    height: 1.8,
    animal: true,
  },
  goat: {
    body: "#e8e0d0",
    head: "#d5c7aa",
    accent: "#554438",
    height: 1.7,
    animal: true,
  },
  chicken: {
    body: "#f4eee0",
    head: "#fff8e9",
    accent: "#d94336",
    height: 1.35,
    animal: true,
  },
  dog: {
    body: "#b98250",
    head: "#d09a65",
    accent: "#75452c",
    height: 1.55,
    animal: true,
  },
  cat: {
    body: "#b8b4b0",
    head: "#d4d0ca",
    accent: "#68616a",
    height: 1.4,
    animal: true,
  },
  elephant: {
    body: "#858d9b",
    head: "#a3aab5",
    accent: "#626b7b",
    height: 2.1,
    animal: true,
  },
  rabbit: {
    body: "#eee8df",
    head: "#fffaf4",
    accent: "#d68b9a",
    height: 1.5,
    animal: true,
  },
  cow: {
    body: "#f4eee8",
    head: "#eee3d8",
    accent: "#36333a",
    height: 1.8,
    animal: true,
  },
  bear: {
    body: "#75503a",
    head: "#956b4d",
    accent: "#d3a47d",
    height: 1.9,
    animal: true,
  },
  tomato: {
    body: "#d93636",
    head: "#ef4940",
    accent: "#368b49",
    height: 1.4,
    animal: false,
  },
  onion: {
    body: "#a77ac7",
    head: "#c29add",
    accent: "#66984d",
    height: 1.4,
    animal: false,
  },
  potato: {
    body: "#ad8254",
    head: "#c49a6a",
    accent: "#76532e",
    height: 1.35,
    animal: false,
  },
  broccoli: {
    body: "#368d49",
    head: "#51a95c",
    accent: "#28723a",
    height: 1.55,
    animal: false,
  },
  carrot: {
    body: "#ed842b",
    head: "#f5a13c",
    accent: "#42994c",
    height: 1.5,
    animal: false,
  },
  banana: {
    body: "#e9c83e",
    head: "#f5dc65",
    accent: "#9d7821",
    height: 1.5,
    animal: false,
  },
  orange: {
    body: "#e98528",
    head: "#f6a13b",
    accent: "#478b3f",
    height: 1.4,
    animal: false,
  },
};

function Eye({ x }: { x: number }) {
  return (
    <group position={[x, 0.05, 0.43]}>
      <mesh>
        <sphereGeometry args={[0.105, 24, 24]} />
        <meshStandardMaterial color="#fffaf2" />
      </mesh>
      <mesh position={[0, 0, 0.075]}>
        <sphereGeometry args={[0.052, 20, 20]} />
        <meshStandardMaterial color="#241b19" />
      </mesh>
      <mesh position={[-0.018, 0.025, 0.115]}>
        <sphereGeometry args={[0.017, 12, 12]} />
        <meshBasicMaterial color="white" />
      </mesh>
    </group>
  );
}

function CharacterFace({
  accent,
  animal,
}: {
  accent: string;
  animal: boolean;
}) {
  return (
    <group position={[0, 1.65, 0]}>
      <Eye x={-0.19} />
      <Eye x={0.19} />

      {animal && (
        <mesh position={[0, -0.14, 0.47]}>
          <sphereGeometry args={[0.11, 20, 16]} />
          <meshStandardMaterial color={accent} />
        </mesh>
      )}

      <mesh position={[0, -0.28, 0.43]}>
        <sphereGeometry args={[0.11, 20, 12]} />
        <meshStandardMaterial
          color="#673d36"
          roughness={0.65}
        />
      </mesh>

      <mesh position={[0, -0.27, 0.52]}>
        <boxGeometry args={[0.11, 0.018, 0.025]} />
        <meshStandardMaterial color="#fff1e8" />
      </mesh>
    </group>
  );
}

function FoodBody({
  id,
  color,
}: {
  id: string;
  color: string;
}) {
  if (id === "carrot") {
    return (
      <mesh position={[0, 0.9, 0]}>
        <coneGeometry args={[0.43, 1.15, 32]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
    );
  }

  if (id === "banana") {
    return (
      <mesh position={[0, 0.95, 0]} rotation={[0, 0, -0.25]}>
        <capsuleGeometry args={[0.3, 0.8, 8, 24]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
    );
  }

  if (id === "broccoli") {
    return (
      <group>
        <mesh position={[0, 0.65, 0]}>
          <cylinderGeometry args={[0.22, 0.3, 0.8, 24]} />
          <meshStandardMaterial color="#9bce76" />
        </mesh>
        {[[-0.25, 1.35, 0], [0.18, 1.42, 0], [0, 1.65, 0]].map(
          ([x, y, z], index) => (
            <mesh
              key={index}
              position={[x, y, z]}
            >
              <sphereGeometry args={[0.43, 24, 24]} />
              <meshStandardMaterial color={color} roughness={0.85} />
            </mesh>
          )
        )}
      </group>
    );
  }

  return (
    <mesh position={[0, 0.95, 0]}>
      <sphereGeometry args={[0.66, 40, 32]} />
      <meshStandardMaterial
        color={color}
        roughness={0.52}
      />
    </mesh>
  );
}

export default function CharacterModel3D({
  id,
  action = "idle",
  position = [0, 0, 0],
  scale = 1,
}: Props) {
  const root = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);

  const design = DESIGNS[id];

  useFrame(({ clock }) => {
    if (!root.current) return;

    const time = clock.elapsedTime;

    root.current.position.y =
      action === "jump"
        ? Math.abs(Math.sin(time * 5)) * 0.7
        : Math.sin(time * 2) * 0.035;

    root.current.rotation.y =
      action === "dance"
        ? Math.sin(time * 3) * 0.35
        : Math.sin(time * 0.7) * 0.04;

    if (leftArm.current && rightArm.current) {
      const wave =
        action === "wave"
          ? Math.sin(time * 8) * 0.8
          : action === "dance"
            ? Math.sin(time * 5) * 0.7
            : action === "talk"
              ? Math.sin(time * 6) * 0.2
              : 0;

      leftArm.current.rotation.z = wave;
      rightArm.current.rotation.z = -wave;
    }
  });

  if (!design) return null;

  return (
    <group
      position={position}
      scale={scale}
    >
      <group ref={root}>
        {design.animal ? (
          <>
            {/* Torso */}
            <mesh position={[0, 0.95, 0]}>
              <capsuleGeometry args={[0.39, 0.65, 8, 32]} />
              <meshStandardMaterial
                color={design.body}
                roughness={0.8}
              />
            </mesh>

            {/* Head */}
            <mesh position={[0, 1.65, 0]}>
              <sphereGeometry args={[0.48, 40, 32]} />
              <meshStandardMaterial
                color={design.head}
                roughness={0.8}
              />
            </mesh>

            {/* Ears */}
            {[-1, 1].map((side) => (
              <mesh
                key={side}
                position={[side * 0.43, 1.94, 0]}
                rotation={[0, 0, side * -0.25]}
              >
                <sphereGeometry args={[0.19, 24, 20]} />
                <meshStandardMaterial color={design.accent} />
              </mesh>
            ))}

            {/* Facial expression */}
            <CharacterFace
              accent={design.accent}
              animal={design.animal}
            />
          </>
        ) : (
          <>
            <FoodBody id={id} color={design.body} />

            <CharacterFace
              accent={design.accent}
              animal={false}
            />
          </>
        )}

        {/* Arms */}
        <group ref={leftArm} position={[-0.43, 1.1, 0]}>
          <mesh
            position={[-0.12, -0.23, 0]}
            rotation={[0, 0, -0.3]}
          >
            <capsuleGeometry args={[0.12, 0.48, 6, 16]} />
            <meshStandardMaterial color={design.body} />
          </mesh>
        </group>

        <group ref={rightArm} position={[0.43, 1.1, 0]}>
          <mesh
            position={[0.12, -0.23, 0]}
            rotation={[0, 0, 0.3]}
          >
            <capsuleGeometry args={[0.12, 0.48, 6, 16]} />
            <meshStandardMaterial color={design.body} />
          </mesh>
        </group>

        {/* Legs */}
        {[-0.2, 0.2].map((x) => (
          <mesh
            key={x}
            position={[x, 0.27, 0]}
          >
            <capsuleGeometry args={[0.13, 0.35, 6, 16]} />
            <meshStandardMaterial color={design.accent} />
          </mesh>
        ))}

        {/* Character-specific lion mane */}
        {id === "lion" && (
          <mesh position={[0, 1.66, -0.12]}>
            <sphereGeometry args={[0.64, 32, 28]} />
            <meshStandardMaterial
              color="#92501e"
              roughness={0.95}
            />
          </mesh>
        )}

        {/* Character-specific elephant trunk */}
        {id === "elephant" && (
          <mesh
            position={[0, 1.28, 0.48]}
            rotation={[0.2, 0, 0]}
          >
            <capsuleGeometry args={[0.13, 0.48, 8, 20]} />
            <meshStandardMaterial color={design.head} />
          </mesh>
        )}

        {/* Character-specific rabbit ears */}
        {id === "rabbit" &&
          [-1, 1].map((side) => (
            <mesh
              key={side}
              position={[side * 0.2, 2.15, 0]}
              rotation={[0, 0, side * 0.15]}
            >
              <capsuleGeometry args={[0.1, 0.62, 8, 20]} />
              <meshStandardMaterial color={design.head} />
            </mesh>
          ))}

        {/* Character-specific chicken comb */}
        {id === "chicken" && (
          <mesh position={[0, 2.14, 0]}>
            <sphereGeometry args={[0.17, 20, 16]} />
            <meshStandardMaterial color="#d92f32" />
          </mesh>
        )}

        {/* Food leaves */}
        {["tomato", "onion", "orange"].includes(id) && (
          <mesh position={[0, 1.58, 0]}>
            <coneGeometry args={[0.19, 0.3, 6]} />
            <meshStandardMaterial color={design.accent} />
          </mesh>
        )}
      </group>
    </group>
  );
          }
