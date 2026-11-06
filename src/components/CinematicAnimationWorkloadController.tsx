import { useEffect } from "react";

import {
getCinematicPerformanceState,
subscribeToCinematicPerformance,
} from "../lib/cinematic-performance-store";

import {
getAnimationWorkloadFactor,
setAnimationWorkloadFactor,
} from "../lib/cinematic-animation-scheduler";

function getTargetWorkload(
fps: number,
frameTime: number,
): number {
if (fps < 20 || frameTime > 50) return 3;
if (fps < 28 || frameTime > 35) return 2.5;
if (fps < 38 || frameTime > 26) return 2;
if (fps < 48 || frameTime > 21) return 1.5;

return 1;
}

export default function CinematicAnimationWorkloadController({
enabled = true,
}: {
enabled?: boolean;
}) {
useEffect(() => {
if (!enabled) {
setAnimationWorkloadFactor(1);
return;
}

let currentFactor = getAnimationWorkloadFactor();
let smoothedFps = 60;
let smoothedFrameTime = 16.67;
let recoveryCounter = 0;

const synchronize = () => {
  const performance =
    getCinematicPerformanceState();

  // Smooth sudden FPS fluctuations.
  smoothedFps =
    smoothedFps * 0.65 +
    performance.fps * 0.35;

  smoothedFrameTime =
    smoothedFrameTime * 0.65 +
    performance.frameTime * 0.35;

  const targetFactor = getTargetWorkload(
    smoothedFps,
    smoothedFrameTime,
  );

  // Reduce workload quickly when performance drops.
  if (targetFactor > currentFactor) {
    currentFactor = targetFactor;
    recoveryCounter = 0;

    setAnimationWorkloadFactor(currentFactor);
    return;
  }

  // Restore animation quality slowly.
  if (targetFactor < currentFactor) {
    recoveryCounter += 1;

    if (recoveryCounter >= 5) {
      currentFactor = Math.max(
        targetFactor,
        currentFactor - 0.5,
      );

      recoveryCounter = 0;

      setAnimationWorkloadFactor(currentFactor);
    }

    return;
  }

  recoveryCounter = 0;
};

synchronize();

const unsubscribe =
  subscribeToCinematicPerformance(synchronize);

return () => {
  unsubscribe();
  setAnimationWorkloadFactor(1);
};

}, [enabled]);

return null;
}
