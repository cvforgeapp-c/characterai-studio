import type { CSSProperties } from "react";
import type { CompositionMode } from "./CinematicComposition";

interface Props {
mode: CompositionMode;
spacing: number;
depth: number;
characterCount: number;
onModeChange: (mode: CompositionMode) => void;
onSpacingChange: (value: number) => void;
onDepthChange: (value: number) => void;
}

const MODES: {
id: CompositionMode;
name: string;
description: string;
icon: string;
}[] = [
{
id: "auto",
name: "Auto Director",
description: "Automatically arrange characters",
icon: "✦",
},
{
id: "single",
name: "Solo",
description: "One character in focus",
icon: "◉",
},
{
id: "dialogue",
name: "Dialogue",
description: "Face-to-face conversation",
icon: "↔",
},
{
id: "triangle",
name: "Triangle",
description: "Three-character staging",
icon: "△",
},
{
id: "group",
name: "Group",
description: "Balanced group arrangement",
icon: "▦",
},
{
id: "dramatic",
name: "Dramatic",
description: "Central hero composition",
icon: "◆",
},
];

export default function CinematicScenePanel({
mode,
spacing,
depth,
characterCount,
onModeChange,
onSpacingChange,
onDepthChange,
}: Props) {
const panel: CSSProperties = {
background: "linear-gradient(145deg, #151a25, #0c1019)",
border: "1px solid rgba(255,255,255,0.09)",
borderRadius: 18,
padding: 16,
color: "#f5f7fb",
width: "100%",
boxSizing: "border-box",
};

const label: CSSProperties = {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
fontSize: 12,
fontWeight: 700,
color: "#dce4f2",
marginBottom: 9,
};

const slider: CSSProperties = {
width: "100%",
accentColor: "#8b5cf6",
cursor: "pointer",
};

return (
<section style={panel}>
<div
style={{
display: "flex",
justifyContent: "space-between",
alignItems: "center",
marginBottom: 15,
}}
>
<div>
<div
style={{
fontSize: 15,
fontWeight: 800,
letterSpacing: 0.2,
}}
>
Scene Direction
</div>

      <div
        style={{
          color: "#8995a8",
          fontSize: 11,
          marginTop: 4,
        }}
      >
        Cinematic character composition
      </div>
    </div>

    <div
      style={{
        padding: "6px 10px",
        borderRadius: 20,
        background: "rgba(139,92,246,0.14)",
        color: "#c4a7ff",
        fontSize: 10,
        fontWeight: 800,
      }}
    >
      {characterCount} CHARACTERS
    </div>
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: 9,
    }}
  >
    {MODES.map((item) => {
      const active = mode === item.id;

      return (
        <button
          key={item.id}
          type="button"
          onClick={() => onModeChange(item.id)}
          style={{
            minHeight: 76,
            textAlign: "left",
            padding: 11,
            borderRadius: 12,
            border: active
              ? "1px solid #9b75ff"
              : "1px solid rgba(255,255,255,0.09)",
            background: active
              ? "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(99,102,241,0.12))"
              : "rgba(255,255,255,0.025)",
            color: "#f5f7fb",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <span
              style={{
                fontSize: 17,
                color: active ? "#c4a7ff" : "#a6b1c3",
              }}
            >
              {item.icon}
            </span>

            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {item.name}
            </span>

            {active && (
              <span
                style={{
                  marginLeft: "auto",
                  color: "#c4a7ff",
                  fontSize: 12,
                }}
              >
                ✓
              </span>
            )}
          </div>

          <div
            style={{
              fontSize: 10,
              lineHeight: 1.4,
              color: "#929eb0",
            }}
          >
            {item.description}
          </div>
        </button>
      );
    })}
  </div>

  <div
    style={{
      height: 1,
      background: "rgba(255,255,255,0.08)",
      margin: "17px 0",
    }}
  />

  <div style={{ marginBottom: 17 }}>
    <div style={label}>
      <span>Character Spacing</span>
      <span style={{ color: "#c4a7ff" }}>{spacing.toFixed(1)}</span>
    </div>

    <input
      aria-label="Character spacing"
      type="range"
      min="1"
      max="5"
      step="0.1"
      value={spacing}
      onChange={(event) =>
        onSpacingChange(Number(event.target.value))
      }
      style={slider}
    />

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        color: "#78869a",
        fontSize: 10,
      }}
    >
      <span>Close together</span>
      <span>Far apart</span>
    </div>
  </div>

  <div>
    <div style={label}>
      <span>Scene Depth</span>
      <span style={{ color: "#c4a7ff" }}>{depth.toFixed(1)}</span>
    </div>

    <input
      aria-label="Scene depth"
      type="range"
      min="0"
      max="4"
      step="0.1"
      value={depth}
      onChange={(event) =>
        onDepthChange(Number(event.target.value))
      }
      style={slider}
    />

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        color: "#78869a",
        fontSize: 10,
      }}
    >
      <span>Flat staging</span>
      <span>Deep staging</span>
    </div>
  </div>

  <div
    style={{
      marginTop: 16,
      padding: 10,
      borderRadius: 10,
      background: "rgba(139,92,246,0.08)",
      border: "1px solid rgba(139,92,246,0.16)",
      color: "#aebbd0",
      fontSize: 10,
      lineHeight: 1.5,
    }}
  >
    Scene direction changes the characters' positions in the live
    3D stage. Choose Auto Director for automatic arrangements.
  </div>
</section>

);
              }
