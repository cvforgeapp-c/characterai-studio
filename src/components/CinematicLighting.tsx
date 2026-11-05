import { useMemo } from "react";
import { Color } from "three";

interface CinematicLightingProps {
intensity?: number;
dramatic?: boolean;
warm?: boolean;
}

export default function CinematicLighting({
intensity = 1,
dramatic = true,
warm = false,
}: CinematicLightingProps) {
const colors = useMemo(
() => ({
key: new Color(warm ? "#ffd2a1" : "#ffffff"),
fill: new Color(warm ? "#9bb8ff" : "#a8c8ff"),
rim: new Color(warm ? "#ff9b59" : "#9b8cff"),
}),
[warm]
);

const power = Math.max(0.1, Math.min(intensity, 2));

return (
<>
{/* Base illumination */}
<ambientLight
intensity={dramatic ? 0.32 * power : 0.65 * power}
color="#dce8ff"
/>

  <hemisphereLight
    args={["#dceaff", "#25202d", 0.55 * power]}
  />

  {/* Main cinematic key light */}
  <directionalLight
    position={[4, 8, 5]}
    intensity={2.1 * power}
    color={colors.key}
    castShadow
    shadow-mapSize-width={2048}
    shadow-mapSize-height={2048}
    shadow-camera-near={0.5}
    shadow-camera-far={30}
    shadow-camera-left={-10}
    shadow-camera-right={10}
    shadow-camera-top={10}
    shadow-camera-bottom={-10}
    shadow-bias={-0.00015}
  />

  {/* Soft front fill */}
  <directionalLight
    position={[-5, 3, 6]}
    intensity={0.75 * power}
    color={colors.fill}
  />

  {/* Back rim light */}
  <spotLight
    position={[0, 6, -6]}
    angle={0.75}
    penumbra={0.8}
    intensity={dramatic ? 2.8 * power : 1.4 * power}
    color={colors.rim}
    distance={25}
    decay={2}
    castShadow
  />

  {/* Side separation light */}
  <pointLight
    position={[6, 2.5, -2]}
    intensity={0.8 * power}
    color="#80cfff"
    distance={15}
    decay={2}
  />

  {/* Subtle warm ground bounce */}
  <pointLight
    position={[-4, 0.8, 3]}
    intensity={0.35 * power}
    color="#ffbd85"
    distance={10}
    decay={2}
  />
</>

);
}
