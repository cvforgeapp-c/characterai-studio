import { useEffect, useState } from "react";

import {
getAnimationSchedulerStats,
getAnimationWorkloadFactor,
getAnimationSchedulerQuality,
type AnimationPriority,
} from "../lib/cinematic-animation-scheduler";

import {
getAllRigCapabilities,
} from "../lib/cinematic-rig-capability-store";

interface SchedulerStats {
totalCharacters: number;
speaking: number;
listening: number;
foreground: number;
background: number;
currentFrame: number;
quality: string;
workloadFactor: number;
}

const priorityLabels: AnimationPriority[] = [
"speaking",
"listening",
"foreground",
"background",
];

export default function CinematicAnimationSchedulerPanel({
enabled = true,
}: {
enabled?: boolean;
}) {
const [stats, setStats] = useState<SchedulerStats>(
getAnimationSchedulerStats(),
);

const [capabilityCount, setCapabilityCount] =
useState(0);

const [expanded, setExpanded] = useState(true);

useEffect(() => {
if (!enabled) return;

const update = () => {
  setStats(getAnimationSchedulerStats());
  setCapabilityCount(getAllRigCapabilities().length);
};

update();

const interval = window.setInterval(update, 1000);

return () => window.clearInterval(interval);

}, [enabled]);

if (!enabled) return null;

const workload = getAnimationWorkloadFactor();
const quality = getAnimationSchedulerQuality();

const cardStyle: React.CSSProperties = {
background: "rgba(12, 18, 30, 0.94)",
border: "1px solid rgba(100, 180, 255, 0.25)",
borderRadius: 12,
padding: 14,
color: "#e8f1ff",
fontSize: 12,
fontFamily: "Arial, sans-serif",
width: 245,
boxShadow: "0 8px 28px rgba(0,0,0,0.3)",
};

const rowStyle: React.CSSProperties = {
display: "flex",
justifyContent: "space-between",
padding: "5px 0",
borderBottom: "1px solid rgba(255,255,255,0.07)",
};

return (
<div
style={{
position: "absolute",
right: 14,
bottom: 14,
zIndex: 35,
pointerEvents: "auto",
}}
>
<div style={cardStyle}>
<button
onClick={() => setExpanded((value) => !value)}
style={{
width: "100%",
display: "flex",
justifyContent: "space-between",
background: "transparent",
color: "#ffffff",
border: 0,
padding: 0,
cursor: "pointer",
fontWeight: 700,
fontSize: 12,
}}
>
<span>⚙️ ANIMATION SCHEDULER</span>
<span>{expanded ? "−" : "+"}</span>
</button>

    {expanded && (
      <div style={{ marginTop: 12 }}>
        <div style={rowStyle}>
          <span>Registered characters</span>
          <strong>{stats.totalCharacters}</strong>
        </div>

        <div style={rowStyle}>
          <span>Rig reports</span>
          <strong>{capabilityCount}</strong>
        </div>

        {priorityLabels.map((priority) => (
          <div key={priority} style={rowStyle}>
            <span>
              {priority === "speaking"
                ? "🎙 Speaking"
                : priority === "listening"
                ? "👂 Listening"
                : priority === "foreground"
                ? "🎬 Foreground"
                : "🌙 Background"}
            </span>

            <strong>
              {stats[priority]}
            </strong>
          </div>
        ))}

        <div style={rowStyle}>
          <span>Scheduler quality</span>
          <strong>{quality.toUpperCase()}</strong>
        </div>

        <div style={rowStyle}>
          <span>Workload factor</span>
          <strong>{workload.toFixed(1)}×</strong>
        </div>

        <div style={rowStyle}>
          <span>Animation frame</span>
          <strong>{stats.currentFrame}</strong>
        </div>

        <div
          style={{
            marginTop: 10,
            padding: 8,
            borderRadius: 7,
            background:
              workload >= 2
                ? "rgba(255,160,60,0.13)"
                : "rgba(70,210,140,0.12)",
            color:
              workload >= 2 ? "#ffbd72" : "#75e6ae",
          }}
        >
          {workload >= 2
            ? "Adaptive workload reduction active"
            : "Normal animation workload"}
        </div>
      </div>
    )}
  </div>
</div>

);
}
