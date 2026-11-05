import { useEffect } from "react";

import {
useCinematicCameraCommand,
} from "../lib/cinematic-camera-command-store";

import type {
CinematicCameraCommand,
} from "../lib/cinematic-camera-director";

interface CinematicCameraCommandBridgeProps {
enabled?: boolean;
onCommand: (
command: CinematicCameraCommand
) => void;
}

export default function CinematicCameraCommandBridge({
enabled = true,
onCommand,
}: CinematicCameraCommandBridgeProps) {
const command = useCinematicCameraCommand();

useEffect(() => {
if (!enabled || !command || !command.enabled) {
return;
}

onCommand(command);

}, [command, enabled, onCommand]);

return null;
}
