import { useEffect, useState } from "react";

import {
getCinematicPerformanceState,
subscribeToCinematicPerformance,
setCinematicQuality,
type CinematicPerformanceState,
type CinematicQualityLevel,
} from "../lib/cinematic-performance-store";

interface CinematicPerformancePanelProps {
enabled?: boolean;
}

const qualityOptions: CinematicQualityLevel[] = [
"high",
"balanced",
"performance",
];

export default function CinematicPerformancePanel({
enabled = true,
}: CinematicPerformancePanelProps) {
const [performance, setPerformance] =
useState<CinematicPerformanceState>(
getCinematicPerformanceState,
);

const [expanded, setExpanded] = useState(true);

useEffect(() => {
if (!enabled) return;

const refresh = () => {
  setPerformance(getCinematicPerformanceState());
};

refresh();

return subscribeToCinematicPerformance(refresh);

}, [enabled]);

if (!enabled) return null;

const fpsStatus =
performance.fps >= 50
? "Good"
: performance.fps >= 30
? "Moderate"
: "Low";

const fpsColor =
performance.fps >= 50
? "#22c55e"
: performance.fps >= 30
? "#f59e0b"
: "#ef4444";

const qualityLabel: Record<CinematicQualityLevel, string> = {
high: "High",
balanced: "Balanced",
performance: "Performance",
};

return (
<section
style={{
position: "absolute",
right: 16,
bottom: 16,
zIndex: 40,
width: expanded ? 270 : 170,
padding: 14,
borderRadius: 14,
color: "#f8fafc",
background: "rgba(12, 17, 27, 0.94)",
border: "1px solid rgba(148, 163, 184, 0.22)",
boxShadow: "0 12px 35px rgba(0,0,0,0.3)",
fontFamily: "Inter, Arial, sans-serif",
fontSize: 12,
backdropFilter: "blur(12px)",
}}
>
<header
style={{
display: "flex",
justifyContent: "space-between",
alignItems: "center",
gap: 10,
marginBottom: expanded ? 13 : 0,
}}
>
<strong style={{ fontSize: 13 }}>
Performance Monitor
</strong>

    <button
      type="button"
      onClick={() => setExpanded((value) => !value)}
      style={buttonStyle}
    >
      {expanded ? "−" : "+"}
    </button>
  </header>

  {expanded && (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 9,
        }}
      >
        <Metric
          label="Frame rate"
          value={`${performance.fps} FPS`}
          valueColor={fpsColor}
        />

        <Metric
          label="Frame time"
          value={`${performance.frameTime.toFixed(1)} ms`}
        />

        <Metric
          label="Render quality"
          value={qualityLabel[performance.quality]}
        />

        <Metric
          label="Performance"
          value={fpsStatus}
          valueColor={fpsColor}
        />
      </div>

      <div
        style={{
          marginTop: 13,
          marginBottom: 7,
          color: "#94a3b8",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 0.8,
          textTransform: "uppercase",
        }}
      >
        Rendering quality
      </div>

      <div style={{ display: "flex", gap: 5 }}>
        {qualityOptions.map((quality) => {
          const selected =
            performance.quality === quality;

          return (
            <button
              key={quality}
              type="button"
              onClick={() => setCinematicQuality(quality)}
              style={{
                ...buttonStyle,
                flex: 1,
                padding: "7px 4px",
                background: selected
                  ? "#2563eb"
                  : "rgba(148,163,184,0.12)",
                borderColor: selected
                  ? "#3b82f6"
                  : "rgba(148,163,184,0.2)",
                color: "#fff",
                fontSize: 10,
              }}
            >
              {qualityLabel[quality]}
            </button>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 12,
          paddingTop: 10,
          borderTop: "1px solid rgba(148,163,184,0.16)",
          display: "flex",
          justifyContent: "space-between",
          color: "#94a3b8",
        }}
      >
        <span>Automatic optimization</span>

        <span
          style={{
            color: performance.isOptimizing
              ? "#22c55e"
              : "#f59e0b",
            fontWeight: 700,
          }}
        >
          {performance.isOptimizing ? "ACTIVE" : "INACTIVE"}
        </span>
      </div>

      <div
        style={{
          marginTop: 7,
          color: "#64748b",
          fontSize: 10,
        }}
      >
        DPR: {performance.pixelRatio.toFixed(2)}
        {" · "}
        Shadows: {performance.shadowsEnabled ? "On" : "Off"}
        {" · "}
        Effects: {performance.effectsEnabled ? "On" : "Off"}
      </div>
    </>
  )}
</section>

);
}

function Metric({
label,
value,
valueColor = "#f8fafc",
}: {
label: string;
value: string;
valueColor?: string;
}) {
return (
<div
style={{
padding: 10,
borderRadius: 9,
background: "rgba(148,163,184,0.09)",
minWidth: 0,
}}
>
<div
style={{
color: "#94a3b8",
fontSize: 10,
marginBottom: 5,
}}
>
{label}
</div>

  <strong
    style={{
      color: valueColor,
      fontSize: 15,
    }}
  >
    {value}
  </strong>
</div>

);
}

const buttonStyle: React.CSSProperties = {
border: "1px solid rgba(148,163,184,0.2)",
borderRadius: 7,
padding: "4px 9px",
background: "rgba(148,163,184,0.12)",
color: "#e2e8f0",
cursor: "pointer",
};
