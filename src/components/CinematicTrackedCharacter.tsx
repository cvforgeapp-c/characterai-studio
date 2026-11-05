import {
useEffect,
useRef,
type ReactNode,
} from "react";

import * as THREE from "three";

import {
registerLiveCharacter,
unregisterLiveCharacter,
} from "../lib/cinematic-live-target-store";

interface CinematicTrackedCharacterProps {
id: string;
position?: [number, number, number];
rotation?: [number, number, number];
scale?: number | [number, number, number];
children: ReactNode;
}

export default function CinematicTrackedCharacter({
id,
position = [0, 0, 0],
rotation = [0, 0, 0],
scale = 1,
children,
}: CinematicTrackedCharacterProps) {
const groupRef = useRef<THREE.Group>(null);

useEffect(() => {
const group = groupRef.current;

if (!group) return;

registerLiveCharacter(id, group);

return () => {
  unregisterLiveCharacter(id, group);
};

}, [id]);

return (
<group
ref={groupRef}
position={position}
rotation={rotation}
scale={scale}
>
{children}
</group>
);
}
