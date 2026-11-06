import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";

export type PerformanceQuality =
| "high"
| "balanced"
| "performance";

export interface PerformanceProfile {
quality: PerformanceQuality;
fps: number;
pixelRatio: number;
animationScale: number;
shadowsEnabled: boolean;
updatedAt: number;
}

let currentProfile: PerformanceProfile = {
quality: "high",
fps: 60,
pixelRatio: 1.5,
animationScale: 1,
shadowsEnabled: true,
updatedAt: Date.now(),
};

const listeners = new Set<() => void>();

function publishProfile(profile: PerformanceProfile) {
currentProfile = profile;
listeners.forEach((listener) => listener());
}

export function getPerformanceProfile() {
return currentProfile;
}

export function subscribeToPerformanceProfile(
listener: () => void,
) {
listeners.add(listener);

return () => {
listeners.delete(listener);
};
}

function createProfile(fps: number): PerformanceProfile {
if (fps < 22) {
return {
quality: "performance",
fps,
pixelRatio: 0.75,
animationScale: 0.5,
shadowsEnabled: false,
updatedAt: Date.now(),
};
}

if (fps < 42) {
return {
quality: "balanced",
fps,
pixelRatio: 1,
animationScale: 0.75,
shadowsEnabled: false,
updatedAt: Date.now(),
};
}

return {
quality: "high",
fps,
pixelRatio: 1.5,
animationScale: 1,
shadowsEnabled: true,
updatedAt: Date.now(),
};
}

export default function CinematicPerformanceOptimizer({
enabled = true,
onProfileChange,
}: {
enabled?: boolean;
onProfileChange?: (profile: PerformanceProfile) => void;
}) {
const frameCount = useRef(0);
const elapsed = useRef(0);
const previousQuality = useRef<PerformanceQuality>("high");

useFrame((_, delta) => {
if (!enabled) return;

frameCount.current += 1;
elapsed.current += delta;

if (elapsed.current < 2) return;

const fps = frameCount.current / elapsed.current;

frameCount.current = 0;
elapsed.current = 0;

const nextProfile = createProfile(fps);

// Prevent constant profile switching around thresholds.
if (
  nextProfile.quality === previousQuality.current &&
  currentProfile.quality === nextProfile.quality
) {
  return;
}

previousQuality.current = nextProfile.quality;

publishProfile(nextProfile);
onProfileChange?.(nextProfile);

});

useEffect(() => {
if (!enabled) return;

return () => {
  previousQuality.current = "high";
};

}, [enabled]);

return null;
}

export function usePerformanceProfile() {
const [profile, setProfile] = useState(currentProfile);

useEffect(() => {
const update = () => {
setProfile({ ...currentProfile });
};

return subscribeToPerformanceProfile(update);

}, []);

return profile;
}
