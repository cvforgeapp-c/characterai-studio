import { useEffect } from "react";

import {
getCinematicPerformanceState,
subscribeToCinematicPerformance,
} from "../lib/cinematic-performance-store";

import {
setAnimationSchedulerQuality,
} from "../lib/cinematic-animation-scheduler";

export default function CinematicAnimationQualityScheduler() {
useEffect(() => {
const syncQuality = () => {
const performance = getCinematicPerformanceState();

  setAnimationSchedulerQuality(performance.quality);
};

// Apply the current quality immediately.
syncQuality();

// Keep animation scheduling synchronized with performance changes.
const unsubscribe = subscribeToCinematicPerformance(syncQuality);

return () => {
  unsubscribe();
};

}, []);

return null;
}
