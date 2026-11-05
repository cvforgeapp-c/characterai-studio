import { useFrame } from "@react-three/fiber";

import {
updateLiveCharacterCameraTarget,
} from "../lib/cinematic-live-target-store";

interface Props {
enabled?: boolean;
}

export default function CinematicLiveTargetTracker({
enabled = true,
}: Props) {
useFrame(() => {
if (!enabled) return;

updateLiveCharacterCameraTarget();

});

return null;
}
