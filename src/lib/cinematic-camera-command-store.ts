import type { CinematicCameraCommand } from "./cinematic-camera-director";

type CameraCommandListener = (
command: CinematicCameraCommand | null
) => void;

let currentCommand: CinematicCameraCommand | null = null;

const listeners = new Set<CameraCommandListener>();

export function publishCinematicCameraCommand(
command: CinematicCameraCommand
): void {
currentCommand = command;

listeners.forEach((listener) => {
listener(currentCommand);
});
}

export function getCinematicCameraCommand():
CinematicCameraCommand | null {
return currentCommand;
}

export function subscribeToCinematicCameraCommand(
listener: CameraCommandListener
): () => void {
listeners.add(listener);

listener(currentCommand);

return () => {
listeners.delete(listener);
};
}

export function clearCinematicCameraCommand(): void {
currentCommand = null;

listeners.forEach((listener) => {
listener(null);
});
}
