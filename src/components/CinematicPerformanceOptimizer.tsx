import { useEffect, useRef } from "react";

import { useFrame, useThree } from "@react-three/fiber";

import {
getCinematicPerformanceState,
setCinematicQuality,
setCinematicOptimizing,
updateCinematicPerformance,
subscribeToCinematicPerformance,
type CinematicQualityLevel,
} from "../lib/cinematic-performance-store";

interface CinematicPerformanceOptimizerProps {
enabled?: boolean;
}

const QUALITY_ORDER: CinematicQualityLevel[] = [
"performance",
"balanced",
"high",
];

export default function CinematicPerformanceOptimizer({
enabled = true,
}: CinematicPerformanceOptimizerProps) {
const { gl, setDpr } = useThree();

const elapsed = useRef(0);
const frameCount = useRef(0);
const frameTimeTotal = useRef(0);

const lowPerformanceWindows = useRef(0);
const highPerformanceWindows = useRef(0);

const lastQuality = useRef<CinematicQualityLevel | null>(null);

useEffect(() => {
if (!enabled) return;

const applySettings = () => {
  const state = getCinematicPerformanceState();

  if (lastQuality.current !== state.quality) {
    lastQuality.current = state.quality;
  }

  setDpr(state.pixelRatio);

  gl.shadowMap.enabled = state.shadowsEnabled;
  gl.shadowMap.needsUpdate = true;

  gl.info.reset();
};

applySettings();

const unsubscribe =
  subscribeToCinematicPerformance(applySettings);

return () => {
  unsubscribe();
  gl.shadowMap.enabled = true;
};

}, [enabled, gl, setDpr]);

useEffect(() => {
if (!enabled) {
setCinematicOptimizing(false);
return;
}

setCinematicOptimizing(true);

return () => {
  setCinematicOptimizing(false);
};

}, [enabled]);

useFrame((_, delta) => {
if (!enabled) return;

const safeDelta = Math.min(delta, 0.25);

elapsed.current += safeDelta;
frameCount.current += 1;
frameTimeTotal.current += safeDelta * 1000;

if (elapsed.current < 1) return;

const measuredFps =
  frameCount.current / elapsed.current;

const averageFrameTime =
  frameTimeTotal.current / frameCount.current;

updateCinematicPerformance({
  fps: Math.round(measuredFps),
  frameTime: Number(averageFrameTime.toFixed(2)),
});

const current =
  getCinematicPerformanceState().quality;

const currentIndex = QUALITY_ORDER.indexOf(current);

if (measuredFps < 24) {
  lowPerformanceWindows.current += 1;
  highPerformanceWindows.current = 0;
} else if (measuredFps > 52) {
  highPerformanceWindows.current += 1;
  lowPerformanceWindows.current = 0;
} else {
  lowPerformanceWindows.current = 0;
  highPerformanceWindows.current = 0;
}

// Reduce quality after three consecutive low-FPS windows.
if (lowPerformanceWindows.current >= 3) {
  const nextIndex = Math.max(0, currentIndex - 1);

  if (nextIndex !== currentIndex) {
    setCinematicQuality(QUALITY_ORDER[nextIndex]);
  }

  lowPerformanceWindows.current = 0;
  highPerformanceWindows.current = 0;
}

// Restore quality only after eight stable high-FPS windows.
if (highPerformanceWindows.current >= 8) {
  const nextIndex = Math.min(
    QUALITY_ORDER.length - 1,
    currentIndex + 1,
  );

  if (nextIndex !== currentIndex) {
    setCinematicQuality(QUALITY_ORDER[nextIndex]);
  }

  lowPerformanceWindows.current = 0;
  highPerformanceWindows.current = 0;
}

elapsed.current = 0;
frameCount.current = 0;
frameTimeTotal.current = 0;

});

return null;
}
