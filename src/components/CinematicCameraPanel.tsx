import { useState } from "react";
import type {
CinematicCameraSettings,
CinematicShot,
} from "./CinematicCameraRig";

interface Props {
value: CinematicCameraSettings;
onChange: (settings: CinematicCameraSettings) => void;
}

const shotGroups = [
{
title: "CINEMATIC SHOTS",
shots: [
{ id: "wide", label: "Wide Shot", icon: "🌄", description: "Shows the complete environment." },
{ id: "medium", label: "Medium Shot", icon: "🎬", description: "Frames the character naturally." },
{ id: "closeup", label: "Close-up", icon: "🎭", description: "Focuses on facial expressions." },
{ id: "extreme-closeup", label: "Extreme Close-up", icon: "👁️", description: "Captures fine facial details." },
{ id: "over-shoulder", label: "Over Shoulder", icon: "🎥", description: "Frames dialogue from behind." },
{ id: "two-shot", label: "Two Character", icon: "👥", description: "Frames two characters together." },
{ id: "low-angle", label: "Low Angle", icon: "⬆️", description: "Makes characters look powerful." },
{ id: "high-angle", label: "High Angle", icon: "⬇️", description: "Looks down on the scene." },
],
},
{
title: "CAMERA MOVEMENT",
shots: [
{ id: "dolly-in", label: "Dolly In", icon: "🔎", description: "Moves the camera closer." },
{ id: "dolly-out", label: "Dolly Out", icon: "↗️", description: "Moves the camera away." },
{ id: "orbit", label: "Orbit", icon: "🔄", description: "Moves around the characters." },
{ id: "tracking", label: "Tracking", icon: "🎞️", description: "Follows the character." },
],
},
] satisfies {
title: string;
shots: {
id: CinematicShot;
label: string;
icon: string;
description: string;
}[];
}[];

function Slider({
label,
value,
min,
max,
step,
onChange,
suffix = "",
}: {
label: string;
value: number;
min: number;
max: number;
step: number;
onChange: (value: number) => void;
suffix?: string;
}) {
return (
<div style={{ marginBottom: 17 }}>
<div style={styles.sliderHeader}>
<span>{label}</span>
<strong>{value.toFixed(1)}{suffix}</strong>
</div>

  <input
    type="range"
    min={min}
    max={max}
    step={step}
    value={value}
    onChange={(event) => onChange(Number(event.target.value))}
    style={styles.range}
  />
</div>

);
}

export default function CinematicCameraPanel({
value,
onChange,
}: Props) {
const [expanded, setExpanded] = useState(true);

function update<K extends keyof CinematicCameraSettings>(
key: K,
nextValue: CinematicCameraSettings[K]
) {
onChange({
...value,
[key]: nextValue,
});
}

return (
<section style={styles.panel}>
<button
type="button"
onClick={() => setExpanded(!expanded)}
style={styles.header}
>
<div>
<div style={styles.eyebrow}>DIRECTOR'S TOOLKIT</div>
<div style={styles.title}>🎥 Cinematic Camera</div>
</div>

    <span style={styles.expandIcon}>
      {expanded ? "−" : "+"}
    </span>
  </button>

  {expanded && (
    <div style={styles.content}>
      <div style={styles.status}>
        <span style={styles.statusDot} />
        CAMERA CONTROL
        <span style={{ marginLeft: "auto", color: "#9ca3af" }}>
          {value.shot.replaceAll("-", " ").toUpperCase()}
        </span>
      </div>

      {shotGroups.map((group) => (
        <div key={group.title} style={styles.group}>
          <div style={styles.groupTitle}>{group.title}</div>

          <div style={styles.grid}>
            {group.shots.map((shot) => {
              const active = value.shot === shot.id;

              return (
                <button
                  key={shot.id}
                  type="button"
                  title={shot.description}
                  onClick={() => update("shot", shot.id)}
                  style={{
                    ...styles.shotButton,
                    ...(active ? styles.activeShot : {}),
                  }}
                >
                  <span style={styles.shotIcon}>{shot.icon}</span>
                  <span style={styles.shotLabel}>{shot.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div style={styles.group}>
        <div style={styles.groupTitle}>LENS SETTINGS</div>

        <Slider
          label="Field of View"
          value={value.fieldOfView ?? 40}
          min={20}
          max={75}
          step={1}
          suffix="°"
          onChange={(v) => update("fieldOfView", v)}
        />

        <Slider
          label="Transition Smoothness"
          value={value.transitionSpeed ?? 3}
          min={0.5}
          max={10}
          step={0.5}
          onChange={(v) => update("transitionSpeed", v)}
        />
      </div>

      <div style={styles.group}>
        <div style={styles.groupTitle}>CAMERA MOVEMENT</div>

        <Slider
          label="Movement Speed"
          value={value.movementSpeed ?? 0.35}
          min={0.05}
          max={2}
          step={0.05}
          onChange={(v) => update("movementSpeed", v)}
        />

        <Slider
          label="Orbit Radius"
          value={value.orbitRadius ?? 5.5}
          min={2}
          max={12}
          step={0.5}
          onChange={(v) => update("orbitRadius", v)}
        />

        <Slider
          label="Orbit Height"
          value={value.orbitHeight ?? 2.3}
          min={0.5}
          max={7}
          step={0.1}
          onChange={(v) => update("orbitHeight", v)}
        />
      </div>

      <button
        type="button"
        onClick={() =>
          onChange({
            shot: "medium",
            transitionSpeed: 3,
            movementSpeed: 0.35,
            fieldOfView: 40,
            orbitRadius: 5.5,
            orbitHeight: 2.3,
            enabled: true,
          })
        }
        style={styles.resetButton}
      >
        ↺ Reset Camera
      </button>
    </div>
  )}
</section>

);
}

const styles: Record<string, React.CSSProperties> = {
panel: {
width: "100%",
color: "#f8fafc",
background: "linear-gradient(145deg, #151c2b, #101522)",
border: "1px solid #303b50",
borderRadius: 14,
overflow: "hidden",
fontFamily: "Inter, system-ui, sans-serif",
},
header: {
width: "100%",
border: 0,
padding: "17px",
display: "flex",
alignItems: "center",
justifyContent: "space-between",
background: "transparent",
color: "inherit",
textAlign: "left",
cursor: "pointer",
},
eyebrow: {
color: "#8b9bb5",
fontSize: 9,
letterSpacing: 2,
fontWeight: 800,
marginBottom: 5,
},
title: {
fontSize: 17,
fontWeight: 800,
},
expandIcon: {
fontSize: 23,
color: "#a5b4fc",
},
content: {
padding: "0 15px 16px",
},
status: {
display: "flex",
alignItems: "center",
gap: 8,
padding: "10px",
borderRadius: 8,
background: "#202a3d",
fontSize: 9,
fontWeight: 800,
letterSpacing: 1,
marginBottom: 18,
},
statusDot: {
width: 7,
height: 7,
borderRadius: "50%",
background: "#35d399",
boxShadow: "0 0 8px #35d399",
},
group: {
marginBottom: 21,
},
groupTitle: {
color: "#91a3bf",
fontSize: 10,
fontWeight: 800,
letterSpacing: 1.5,
marginBottom: 11,
},
grid: {
display: "grid",
gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
gap: 8,
},
shotButton: {
minHeight: 67,
padding: "10px 7px",
display: "flex",
flexDirection: "column",
justifyContent: "center",
alignItems: "center",
gap: 6,
background: "#202a3b",
border: "1px solid #354258",
borderRadius: 9,
color: "#d8e1ef",
cursor: "pointer",
},
activeShot: {
background: "linear-gradient(135deg, #243f68, #29315c)",
border: "1px solid #818cf8",
boxShadow: "0 0 12px #6366f133",
color: "#ffffff",
},
shotIcon: {
fontSize: 19,
},
shotLabel: {
fontSize: 11,
fontWeight: 700,
textAlign: "center",
},
sliderHeader: {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
fontSize: 12,
marginBottom: 7,
color: "#dce5f2",
},
range: {
width: "100%",
accentColor: "#818cf8",
cursor: "pointer",
},
resetButton: {
width: "100%",
padding: 12,
borderRadius: 8,
border: "1px solid #46536c",
background: "#202a3b",
color: "#e2e8f0",
fontSize: 12,
fontWeight: 800,
cursor: "pointer",
},
};
