import React, { useMemo, useState } from "react";

import {
CINEMATIC_SCENE_PRESETS,
applyCinematicPreset,
type CinematicScenePreset,
} from "./CinematicScenePresets";

type Category = "all" | "comedy" | "cinematic" | "dialogue";

interface Props {
characterCount: number;
selectedPresetId?: string;
onApply: (preset: CinematicScenePreset) => void;
}

const CATEGORY_LABELS: {
id: Category;
label: string;
icon: string;
}[] = [
{ id: "all", label: "All Scenes", icon: "🎬" },
{ id: "comedy", label: "Comedy", icon: "😂" },
{ id: "cinematic", label: "Cinematic", icon: "🎥" },
{ id: "dialogue", label: "Dialogue", icon: "💬" },
];

const ENVIRONMENT_ICONS: Record<string, string> = {
studio: "🎞️",
park: "🌳",
kitchen: "🍳",
city: "🌆",
space: "🚀",
beach: "🏖️",
};

export default function CinematicScenePresetPanel({
characterCount,
selectedPresetId,
onApply,
}: Props) {
const [category, setCategory] = useState<Category>("all");

const [expanded, setExpanded] = useState(true);

const presets = useMemo(() => {
if (category === "all") {
return CINEMATIC_SCENE_PRESETS;
}

return CINEMATIC_SCENE_PRESETS.filter(
  (preset) => preset.category === category
);

}, [category]);

const handleApply = (preset: CinematicScenePreset) => {
const preparedPreset = applyCinematicPreset(
preset,
characterCount
);

onApply(preparedPreset);

};

return (
<section style={styles.panel}>
<button
type="button"
onClick={() => setExpanded((value) => !value)}
style={styles.header}
aria-expanded={expanded}
>
<div style={styles.headerLeft}>
<span style={styles.headerIcon}>🎬</span>

      <div>
        <strong style={styles.title}>
          Cinematic Scene Presets
        </strong>

        <span style={styles.subtitle}>
          Professional scene setups
        </span>
      </div>
    </div>

    <span style={styles.expandIcon}>
      {expanded ? "−" : "+"}
    </span>
  </button>

  {expanded && (
    <>
      <div style={styles.categoryList}>
        {CATEGORY_LABELS.map((item) => {
          const active = category === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              style={{
                ...styles.categoryButton,
                ...(active
                  ? styles.categoryButtonActive
                  : {}),
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div style={styles.presetGrid}>
        {presets.map((preset) => {
          const active =
            selectedPresetId === preset.id;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApply(preset)}
              style={{
                ...styles.presetCard,
                ...(active
                  ? styles.presetCardActive
                  : {}),
              }}
              aria-pressed={active}
            >
              <div style={styles.cardTop}>
                <span style={styles.environmentIcon}>
                  {ENVIRONMENT_ICONS[preset.environment] ?? "🎬"}
                </span>

                {active && (
                  <span style={styles.selectedBadge}>
                    ACTIVE
                  </span>
                )}
              </div>

              <strong style={styles.presetName}>
                {preset.name}
              </strong>

              <span style={styles.description}>
                {preset.description}
              </span>

              <div style={styles.cardFooter}>
                <span style={styles.environmentLabel}>
                  {preset.environment.toUpperCase()}
                </span>

                <span style={styles.compositionLabel}>
                  {preset.composition.toUpperCase()}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div style={styles.footer}>
        <span>
          {presets.length} scene presets
        </span>

        <span>
          {characterCount} characters selected
        </span>
      </div>
    </>
  )}
</section>

);
}

const styles: Record<string, React.CSSProperties> = {
panel: {
width: "100%",
borderRadius: 16,
overflow: "hidden",
background:
"linear-gradient(145deg, #111827, #0b1220)",
border: "1px solid rgba(148,163,184,0.18)",
color: "#e5e7eb",
},

header: {
width: "100%",
padding: "17px",
display: "flex",
alignItems: "center",
justifyContent: "space-between",
background: "transparent",
border: "none",
color: "inherit",
cursor: "pointer",
textAlign: "left",
},

headerLeft: {
display: "flex",
alignItems: "center",
gap: 12,
},

headerIcon: {
width: 42,
height: 42,
display: "grid",
placeItems: "center",
borderRadius: 12,
background: "rgba(99,102,241,0.16)",
fontSize: 21,
},

title: {
display: "block",
fontSize: 14,
fontWeight: 800,
color: "#f8fafc",
},

subtitle: {
display: "block",
marginTop: 4,
fontSize: 11,
color: "#94a3b8",
},

expandIcon: {
fontSize: 23,
color: "#a5b4fc",
},

categoryList: {
display: "flex",
gap: 7,
padding: "0 15px 15px",
overflowX: "auto",
},

categoryButton: {
flexShrink: 0,
display: "flex",
alignItems: "center",
gap: 6,
padding: "9px 12px",
borderRadius: 9,
border: "1px solid rgba(148,163,184,0.16)",
background: "rgba(30,41,59,0.65)",
color: "#cbd5e1",
fontSize: 11,
fontWeight: 700,
cursor: "pointer",
},

categoryButtonActive: {
background: "rgba(79,70,229,0.25)",
border: "1px solid rgba(129,140,248,0.65)",
color: "#c7d2fe",
},

presetGrid: {
display: "grid",
gridTemplateColumns:
"repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
gap: 11,
padding: "0 15px 15px",
},

presetCard: {
minWidth: 0,
display: "flex",
flexDirection: "column",
alignItems: "stretch",
gap: 10,
padding: 13,
borderRadius: 12,
border: "1px solid rgba(148,163,184,0.17)",
background:
"linear-gradient(145deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95))",
color: "#e2e8f0",
textAlign: "left",
cursor: "pointer",
transition: "border-color 160ms ease",
},

presetCardActive: {
border: "1px solid #818cf8",
background:
"linear-gradient(145deg, rgba(49,46,129,0.48), rgba(30,41,59,0.96))",
boxShadow: "0 0 0 1px rgba(129,140,248,0.16)",
},

cardTop: {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
minHeight: 34,
},

environmentIcon: {
fontSize: 25,
},

selectedBadge: {
padding: "5px 7px",
borderRadius: 6,
background: "rgba(99,102,241,0.25)",
color: "#c7d2fe",
fontSize: 9,
fontWeight: 900,
letterSpacing: "0.08em",
},

presetName: {
fontSize: 13,
fontWeight: 800,
color: "#f8fafc",
},

description: {
minHeight: 38,
fontSize: 11,
lineHeight: 1.55,
color: "#94a3b8",
},

cardFooter: {
display: "flex",
flexWrap: "wrap",
gap: 6,
marginTop: 3,
},

environmentLabel: {
padding: "5px 7px",
borderRadius: 5,
background: "rgba(14,165,233,0.12)",
color: "#7dd3fc",
fontSize: 9,
fontWeight: 800,
},

compositionLabel: {
padding: "5px 7px",
borderRadius: 5,
background: "rgba(168,85,247,0.12)",
color: "#d8b4fe",
fontSize: 9,
fontWeight: 800,
},

footer: {
display: "flex",
justifyContent: "space-between",
gap: 10,
padding: "12px 15px",
borderTop: "1px solid rgba(148,163,184,0.12)",
color: "#64748b",
fontSize: 10,
},
};
