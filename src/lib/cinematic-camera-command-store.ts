import { useSyncExternalStore } from "react";

import type {
CinematicCameraCommand,
} from "./cinematic-camera-director";

type CameraCommandListener = (
command: CinematicCameraCommand | null
) => void;

let currentCommand: CinematicCameraCommand | null = null;

const listeners = new Set<CameraCommandListener>();

function notifyListeners(): void {
listeners.forEach((listener) => {
listener(currentCommand);
});
}

export function publishCinematicCameraCommand(
command: CinematicCameraCommand
): void {
currentCommand = command;
notifyListeners();
}

export function getCinematicCameraCommand():
CinematicCameraCommand | null {
return currentCommand;
}

export function subscribeToCinematicCameraCommand(
listener: CameraCommandListener
): () => void {
listeners.add(listener);

return () => {
listeners.delete(listener);
};
}

export function clearCinematicCameraCommand(): void {
currentCommand = null;
notifyListeners();
}

export function useCinematicCameraCommand():
CinematicCameraCommand | null {
return useSyncExternalStore(
subscribeToCinematicCameraCommand,
getCinematicCameraCommand,
getCinematicCameraCommand
);
}
