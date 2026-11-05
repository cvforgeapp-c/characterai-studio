import { useMemo } from "react";
import { Color } from "three";
import type { EnvironmentId } from "./CharacterCanvas";

interface Props {
environment: EnvironmentId;
}

function StudioEnvironment() {
return (
<>
{/* Studio cyclorama */}
<mesh
position={[0, 3, -9]}
receiveShadow
>
<boxGeometry args={[35, 12, 0.5]} />
<meshStandardMaterial
color="#17243a"
roughness={0.9}
/>
</mesh>

  {/* Vertical architectural light panels */}
  {[-7, -3.5, 3.5, 7].map((x) => (
    <mesh
      key={x}
      position={[x, 3, -8.65]}
    >
      <boxGeometry args={[0.045, 7, 0.05]} />
      <meshBasicMaterial color="#638aff" />
    </mesh>
  ))}

  {/* Overhead studio structures */}
  <mesh position={[0, 7, -3]}>
    <boxGeometry args={[16, 0.12, 0.12]} />
    <meshStandardMaterial
      color="#46536a"
      metalness={0.7}
      roughness={0.3}
    />
  </mesh>

  <pointLight
    position={[-5, 5, -3]}
    color="#477cff"
    intensity={1.5}
    distance={14}
  />

  <pointLight
    position={[5, 5, -3]}
    color="#a27aff"
    intensity={1.5}
    distance={14}
  />
</>

);
}

function ParkEnvironment() {
const trees = useMemo(
() =>
Array.from({ length: 12 }, (_, index) => ({
x: (index % 6) * 5 - 12.5,
z: -7 - Math.floor(index / 6) * 5,
height: 3 + (index % 3) * 0.7,
})),
[]
);

return (
<>
{/* Distant green landscape */}
<mesh position={[0, 1, -15]}>
<boxGeometry args={[45, 10, 1]} />
<meshStandardMaterial color="#567e55" />
</mesh>

  {trees.map((tree, index) => (
    <group
      key={index}
      position={[tree.x, 0, tree.z]}
    >
      <mesh
        position={[0, tree.height / 2, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.18, 0.32, tree.height, 10]} />
        <meshStandardMaterial color="#765039" />
      </mesh>

      <mesh
        position={[0, tree.height + 0.8, 0]}
        castShadow
      >
        <sphereGeometry args={[1.35, 16, 12]} />
        <meshStandardMaterial
          color={index % 2 ? "#397d49" : "#4c9252"}
          roughness={0.95}
        />
      </mesh>
    </group>
  ))}

  <directionalLight
    position={[-5, 9, 4]}
    color="#fff0c2"
    intensity={0.8}
  />
</>

);
}

function KitchenEnvironment() {
return (
<>
{/* Kitchen back wall */}
<mesh position={[0, 3, -7]}>
<boxGeometry args={[25, 8, 0.5]} />
<meshStandardMaterial color="#b7a993" />
</mesh>

  {/* Cabinet row */}
  {[-6, -3, 0, 3, 6].map((x) => (
    <mesh
      key={x}
      position={[x, 2.4, -6.55]}
      castShadow
    >
      <boxGeometry args={[2.5, 2.3, 0.45]} />
      <meshStandardMaterial
        color="#755c48"
        roughness={0.65}
      />
    </mesh>
  ))}

  {/* Countertop */}
  <mesh position={[0, 1.15, -5.8]}>
    <boxGeometry args={[18, 0.16, 2]} />
    <meshStandardMaterial
      color="#d8d1c4"
      roughness={0.3}
    />
  </mesh>

  {/* Hanging lights */}
  {[-4, 0, 4].map((x) => (
    <group key={x} position={[x, 5.7, -2]}>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 1.2, 8]} />
        <meshStandardMaterial color="#343434" />
      </mesh>

      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.22, 16, 12]} />
        <meshStandardMaterial
          color="#ffe2a8"
          emissive="#ffb65c"
          emissiveIntensity={1.3}
        />
      </mesh>

      <pointLight
        position={[0, -0.3, 0]}
        color="#ffd59b"
        intensity={0.7}
        distance={8}
      />
    </group>
  ))}
</>

);
}

function CityEnvironment() {
const buildings = useMemo(
() =>
Array.from({ length: 11 }, (_, index) => ({
x: (index - 5) * 4,
height: 5 + ((index * 7) % 8),
width: 2.5 + (index % 2),
})),
[]
);

return (
<>
{/* Urban skyline */}
{buildings.map((building, index) => (
<group
key={index}
position={[building.x, 0, -14]}
>
<mesh
position={[0, building.height / 2, 0]}
>
<boxGeometry
args={[
building.width,
building.height,
2,
]}
/>

        <meshStandardMaterial
          color={index % 2 ? "#35435b" : "#48546b"}
          roughness={0.85}
        />
      </mesh>

      {Array.from(
        {
          length: Math.floor(building.height / 2),
        },
        (_, row) => (
          <mesh
            key={row}
            position={[
              0,
              1.2 + row * 1.7,
              1.02,
            ]}
          >
            <boxGeometry args={[0.35, 0.55, 0.025]} />

            <meshBasicMaterial
              color={row % 2 ? "#ffd78b" : "#8bc9ff"}
            />
          </mesh>
        )
      )}
    </group>
  ))}

  {/* City road */}
  <mesh
    rotation={[-Math.PI / 2, 0, 0]}
    position={[0, 0.005, 0]}
  >
    <planeGeometry args={[100, 100]} />
    <meshStandardMaterial color="#242b37" />
  </mesh>

  {/* Road center line */}
  <mesh
    rotation={[-Math.PI / 2, 0, 0]}
    position={[0, 0.015, 0]}
  >
    <planeGeometry args={[0.15, 100]} />
    <meshBasicMaterial color="#f4d47b" />
  </mesh>
</>

);
}

function SpaceEnvironment() {
return (
<>
<Stars
radius={100}
depth={70}
count={5000}
factor={5}
saturation={0.15}
fade
speed={0.35}
/>

  {/* Distant planetary sphere */}
  <mesh position={[9, 5, -18]}>
    <sphereGeometry args={[3.5, 48, 48]} />

    <meshStandardMaterial
      color="#5369a9"
      roughness={0.8}
      metalness={0.1}
      emissive="#263d88"
      emissiveIntensity={0.35}
    />
  </mesh>

  {/* Planet atmosphere */}
  <pointLight
    position={[9, 5, -15]}
    color="#658bff"
    intensity={2}
    distance={18}
  />

  {/* Floating distant moon */}
  <mesh position={[-10, 8, -22]}>
    <sphereGeometry args={[1.4, 32, 32]} />

    <meshStandardMaterial
      color="#d9d9e5"
      roughness={1}
    />
  </mesh>
</>

);
}

function BeachEnvironment() {
return (
<>
{/* Ocean */}
<mesh
rotation={[-Math.PI / 2, 0, 0]}
position={[0, 0.015, -12]}
>
<planeGeometry args={[100, 35]} />

    <meshStandardMaterial
      color="#247da5"
      roughness={0.25}
      metalness={0.15}
    />
  </mesh>

  {/* Distant horizon */}
  <mesh position={[0, 2.5, -19]}>
    <boxGeometry args={[100, 5, 0.5]} />

    <meshBasicMaterial color="#77bdd8" />
  </mesh>

  {/* Sun */}
  <mesh position={[8, 9, -18]}>
    <sphereGeometry args={[1.5, 32, 32]} />

    <meshBasicMaterial color="#ffe4a0" />
  </mesh>

  <pointLight
    position={[8, 8, -12]}
    color="#ffcf8c"
    intensity={1.5}
    distance={35}
  />

  {/* Distant palm trunks */}
  {[-12, -8, 11, 15].map((x) => (
    <group
      key={x}
      position={[x, 0, -8]}
    >
      <mesh
        position={[0, 2, 0]}
        rotation={[0, 0, -0.12]}
      >
        <cylinderGeometry args={[0.13, 0.22, 4, 8]} />

        <meshStandardMaterial color="#78523a" />
      </mesh>

      <mesh position={[0, 4.2, 0]}>
        <sphereGeometry args={[1, 12, 8]} />

        <meshStandardMaterial color="#367d49" />
      </mesh>
    </group>
  ))}
</>

);
}

export default function CinematicEnvironment({
environment,
}: Props) {
return (
<>
{environment === "studio" && <StudioEnvironment />}
{environment === "park" && <ParkEnvironment />}
{environment === "kitchen" && <KitchenEnvironment />}
{environment === "city" && <CityEnvironment />}
{environment === "space" && <SpaceEnvironment />}
{environment === "beach" && <BeachEnvironment />}
</>
);
  }
