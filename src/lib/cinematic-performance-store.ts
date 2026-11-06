export type CinematicQualityLevel =
| "high"
| "balanced"
| "performance";

export interface CinematicPerformanceState {
fps: number;
frameTime: number;
quality: CinematicQualityLevel;
pixelRatio: number;
shadowsEnabled: boolean;
effectsEnabled: boolean;
animationBudget: number;
isOptimizing: boolean;
updatedAt: number;
}

const listeners = new Set<() => void>();

let performanceState: CinematicPerformanceState = {
fps: 60,
frameTime: 16.67,
quality: "high",
pixelRatio: 1.5,
shadowsEnabled: true,
effectsEnabled: true,
animationBudget: 1,
isOptimizing: false,
updatedAt: Date.now(),
};

function notify(): void {
listeners.forEach((listener) => listener());
}

export function getCinematicPerformanceState():
CinematicPerformanceState {
return { ...performanceState };
}

export function subscribeToCinematicPerformance(
listener: () => void,
): () => void {
listeners.add(listener);

return () => {
listeners.delete(listener);
};
}

export function updateCinematicPerformance(
updates: Partial<CinematicPerformanceState>,
): void {
performanceState = {
...performanceState,
...updates,
updatedAt: Date.now(),
};

notify();
}

export function setCinematicQuality(
quality: CinematicQualityLevel,
): void {
const settings: Record<
CinematicQualityLevel,
Pick<
CinematicPerformanceState,
| "pixelRatio"
| "shadowsEnabled"
| "effectsEnabled"
| "animationBudget"
>

«= {
high: {
pixelRatio: 1.75,
shadowsEnabled: true,
effectsEnabled: true,
animationBudget: 1,
},»

balanced: {
  pixelRatio: 1.25,
  shadowsEnabled: true,
  effectsEnabled: true,
  animationBudget: 0.75,
},

performance: {
  pixelRatio: 1,
  shadowsEnabled: false,
  effectsEnabled: false,
  animationBudget: 0.5,
},

};

performanceState = {
...performanceState,
quality,
...settings[quality],
updatedAt: Date.now(),
};

notify();
}

export function setCinematicOptimizing(
isOptimizing: boolean,
): void {
performanceState = {
...performanceState,
isOptimizing,
updatedAt: Date.now(),
};

notify();
}

export function resetCinematicPerformance(): void {
performanceState = {
fps: 60,
frameTime: 16.67,
quality: "high",
pixelRatio: 1.5,
shadowsEnabled: true,
effectsEnabled: true,
animationBudget: 1,
isOptimizing: false,
updatedAt: Date.now(),
};

notify();
  }
