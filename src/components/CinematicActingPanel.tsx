import React, { useMemo, useState } from "react";

export type ActingEmotion =
| "neutral"
| "happy"
| "angry"
| "sad"
| "surprised"
| "scared"
| "confident"
| "curious"
| "disgusted"
| "embarrassed"
| "excited"
| "suspicious";

export type ActingGesture =
| "idle"
| "talk"
| "explain"
| "point"
| "shrug"
| "wave"
| "laugh"
| "cry"
| "argue"
| "think"
| "dance"
| "celebrate"
| "react"
| "walk";

export type EyeFocus =
| "camera"
| "partner"
| "left"
| "right"
| "down"
| "up"
| "wandering";

export interface CinematicActingSettings {
emotion: ActingEmotion;
gesture: ActingGesture;
eyeFocus: EyeFocus;
intensity: number;
energy: number;
gestureSpeed: number;
headMovement: number;
bodyMovement: number;
facialIntensity: number;
speaking: boolean;
blinkEnabled: boolean;
breathingEnabled: boolean;
}

interface ActingPreset {
id: string;
name: string;
description: string;
icon: string;
settings: Partial<CinematicActingSettings>;
}

interface Props {
value?: CinematicActingSettings;
onChange?: (settings: CinematicActingSettings) => void;
compact?: boolean;
}

export const DEFAULT_ACTING_SETTINGS: CinematicActingSettings = {
emotion: "happy",
gesture: "talk",
eyeFocus: "camera",
intensity: 0.75,
energy: 0.7,
gestureSpeed: 1,
headMovement: 0.65,
bodyMovement: 0.65,
facialIntensity: 0.8,
speaking: true,
blinkEnabled: true,
breathingEnabled: true,
};

export const CINEMATIC_ACTING_PRESETS: ActingPreset[] = [
{
id: "comedy",
name: "Comedy Performance",
description: "Playful facial reactions and expressive gestures.",
icon: "😂",
settings: {
emotion: "happy",
gesture: "talk",
eyeFocus: "camera",
intensity: 0.9,
energy: 0.9,
gestureSpeed: 1.15,
headMovement: 0.85,
bodyMovement: 0.8,
facialIntensity: 1,
speaking: true,
},
},
{
id: "dramatic",
name: "Dramatic",
description: "Controlled movement with intense emotional delivery.",
icon: "🎭",
settings: {
emotion: "angry",
gesture: "explain",
eyeFocus: "partner",
intensity: 0.95,
energy: 0.65,
gestureSpeed: 0.75,
headMovement: 0.55,
bodyMovement: 0.7,
facialIntensity: 1,
speaking: true,
},
},
{
id: "surprise",
name: "Big Surprise",
description: "A sudden, energetic reaction.",
icon: "😲",
settings: {
emotion: "surprised",
gesture: "react",
eyeFocus: "camera",
intensity: 1,
energy: 1,
gestureSpeed: 1.4,
headMovement: 1,
bodyMovement: 0.95,
facialIntensity: 1,
speaking: false,
},
},
{
id: "sad",
name: "Emotional Scene",
description: "Subtle sadness and lowered body language.",
icon: "🥺",
settings: {
emotion: "sad",
gesture: "cry",
eyeFocus: "down",
intensity: 0.85,
energy: 0.25,
gestureSpeed: 0.65,
headMovement: 0.35,
bodyMovement: 0.3,
facialIntensity: 0.9,
speaking: false,
},
},
{
id: "confident",
name: "Confident Speaker",
description: "Strong eye contact and deliberate gestures.",
icon: "😎",
settings: {
emotion: "confident",
gesture: "explain",
eyeFocus: "camera",
intensity: 0.8,
energy: 0.75,
gestureSpeed: 0.9,
headMovement: 0.55,
bodyMovement: 0.7,
facialIntensity: 0.75,
speaking: true,
},
},
{
id: "suspicious",
name: "Suspicious Reaction",
description: "A curious, questioning performance.",
icon: "🤨",
settings: {
emotion: "suspicious",
gesture: "think",
eyeFocus: "partner",
intensity: 0.8,
energy: 0.45,
gestureSpeed: 0.7,
headMovement: 0.8,
bodyMovement: 0.35,
facialIntensity: 0.9,
speaking: false,
},
},
{
id: "celebration",
name: "Celebration",
description: "High-energy excitement and celebration.",
icon: "🎉",
settings: {
emotion: "excited",
gesture: "celebrate",
eyeFocus: "camera",
intensity: 1,
energy: 1,
gestureSpeed: 1.35,
headMovement: 0.95,
bodyMovement: 1,
facialIntensity: 1,
speaking: false,
},
},
{
id: "embarrassed",
name: "Awkward Moment",
description: "Shy expressions and hesitant movements.",
icon: "😳",
settings: {
emotion: "embarrassed",
gesture: "shrug",
eyeFocus: "down",
intensity: 0.75,
energy: 0.35,
gestureSpeed: 0.7,
headMovement: 0.7,
bodyMovement: 0.4,
facialIntensity: 0.85,
speaking: false,
},
},
];

const EMOTIONS: { value: ActingEmotion; label: string; icon: string }[] = [
{ value: "neutral", label: "Neutral", icon: "😐" },
{ value: "happy", label: "Happy", icon: "😊" },
{ value: "angry", label: "Angry", icon: "😠" },
{ value: "sad", label: "Sad", icon: "😢" },
{ value: "surprised", label: "Surprised", icon: "😲" },
{ value: "scared", label: "Scared", icon: "😨" },
{ value: "confident", label: "Confident", icon: "😎" },
{ value: "curious", label: "Curious", icon: "🤔" },
{ value: "disgusted", label: "Disgusted", icon: "🤢" },
{ value: "embarrassed", label: "Embarrassed", icon: "😳" },
{ value: "excited", label: "Excited", icon: "🤩" },
{ value: "suspicious", label: "Suspicious", icon: "🤨" },
];

const GESTURES: { value: ActingGesture; label: string }[] = [
{ value: "idle", label: "Idle" },
{ value: "talk", label: "Talking" },
{ value: "explain", label: "Explain" },
{ value: "point", label: "Point" },
{ value: "shrug", label: "Shrug" },
{ value: "wave", label: "Wave" },
{ value: "laugh", label: "Laugh" },
{ value: "cry", label: "Cry" },
{ value: "argue", label: "Argue" },
{ value: "think", label: "Think" },
{ value: "dance", label: "Dance" },
{ value: "celebrate", label: "Celebrate" },
{ value: "react", label: "React" },
{ value: "walk", label: "Walk" },
];

const EYE_FOCUS: { value: EyeFocus; label: string }[] = [
{ value: "camera", label: "Camera" },
{ value: "partner", label: "Other character" },
{ value: "left", label: "Left" },
{ value: "right", label: "Right" },
{ value: "down", label: "Down" },
{ value: "up", label: "Up" },
{ value: "wandering", label: "Natural wandering" },
];

const styles: Record<string, React.CSSProperties> = {
panel: {
width: "100%",
color: "#f4f5fa",
background: "linear-gradient(145deg,#171b2b,#101421)",
border: "1px solid #30374d",
borderRadius: 18,
padding: 18,
boxSizing: "border-box",
fontFamily: "Inter,system-ui,sans-serif",
},
heading: {
display: "flex",
alignItems: "center",
justifyContent: "space-between",
gap: 12,
marginBottom: 16,
},
title: {
margin: 0,
fontSize: 17,
fontWeight: 800,
},
subtitle: {
color: "#929bb1",
fontSize: 12,
marginTop: 5,
},
badge: {
padding: "6px 10px",
borderRadius: 20,
background: "#27334c",
color: "#9fc3ff",
fontSize: 11,
fontWeight: 800,
},
section: {
marginTop: 18,
},
sectionTitle: {
color: "#cbd3e6",
fontSize: 12,
fontWeight: 800,
letterSpacing: 0.8,
textTransform: "uppercase",
marginBottom: 10,
},
grid: {
display: "grid",
gridTemplateColumns: "repeat(auto-fit,minmax(125px,1fr))",
gap: 9,
},
card: {
background: "#20283b",
border: "1px solid #36415b",
borderRadius: 12,
padding: 11,
color: "#eef2ff",
cursor: "pointer",
textAlign: "left",
minHeight: 75,
},
select: {
width: "100%",
background: "#20283b",
border: "1px solid #36415b",
borderRadius: 10,
color: "#f4f5fa",
padding: "11px 12px",
outline: "none",
fontSize: 13,
},
sliderRow: {
marginTop: 13,
},
sliderHeader: {
display: "flex",
justifyContent: "space-between",
gap: 12,
color: "#cbd3e6",
fontSize: 12,
marginBottom: 7,
},
slider: {
width: "100%",
accentColor: "#8b79ff",
cursor: "pointer",
},
toggleRow: {
display: "flex",
alignItems: "center",
justifyContent: "space-between",
gap: 12,
padding: "11px 0",
borderBottom: "1px solid #30374d",
fontSize: 13,
color: "#dce2f2",
},
reset: {
border: "1px solid #46516c",
background: "#252e43",
color: "#dce5ff",
borderRadius: 9,
padding: "9px 13px",
fontSize: 12,
fontWeight: 700,
cursor: "pointer",
},
};

export default function CinematicActingPanel({
value,
onChange,
compact = false,
}: Props) {
const [internalSettings, setInternalSettings] =
useState<CinematicActingSettings>(DEFAULT_ACTING_SETTINGS);

const settings = value ?? internalSettings;

const update = (changes: Partial<CinematicActingSettings>) => {
const next = { ...settings, ...changes };

if (!value) {
  setInternalSettings(next);
}

onChange?.(next);

};

const activePreset = useMemo(() => {
return CINEMATIC_ACTING_PRESETS.find((preset) =>
Object.entries(preset.settings).every(
([key, presetValue]) =>
settings[key as keyof CinematicActingSettings] === presetValue,
),
);
}, [settings]);

const applyPreset = (preset: ActingPreset) => {
update({
...DEFAULT_ACTING_SETTINGS,
...preset.settings,
});
};

const slider = (
label: string,
key: keyof CinematicActingSettings,
min = 0,
max = 1,
step = 0.05,
) => (
<div style={styles.sliderRow} key={key}>
<div style={styles.sliderHeader}>
<span>{label}</span>
<strong>
{Math.round(Number(settings[key]) * 100)}%
</strong>
</div>

  <input
    style={styles.slider}
    type="range"
    min={min}
    max={max}
    step={step}
    value={Number(settings[key])}
    onChange={(event) =>
      update({ [key]: Number(event.target.value) })
    }
  />
</div>

);

return (
<section style={styles.panel}>
<div style={styles.heading}>
<div>
<h3 style={styles.title}>🎬 Character Acting Director</h3>
<div style={styles.subtitle}>
Control emotion, performance and body language.
</div>
</div>

    <span style={styles.badge}>STAGE 18</span>
  </div>

  <div style={styles.section}>
    <div style={styles.sectionTitle}>Cinematic acting presets</div>

    <div style={styles.grid}>
      {CINEMATIC_ACTING_PRESETS.map((preset) => {
        const selected = activePreset?.id === preset.id;

        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => applyPreset(preset)}
            style={{
              ...styles.card,
              borderColor: selected ? "#9584ff" : "#36415b",
              background: selected
                ? "linear-gradient(135deg,#37345f,#242c43)"
                : "#20283b",
              boxShadow: selected
                ? "0 0 0 1px #9584ff inset"
                : "none",
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 7 }}>
              {preset.icon}
            </div>

            <div style={{ fontSize: 12, fontWeight: 800 }}>
              {preset.name}
            </div>

            {!compact && (
              <div
                style={{
                  color: "#98a4bd",
                  fontSize: 10,
                  lineHeight: 1.5,
                  marginTop: 5,
                }}
              >
                {preset.description}
              </div>
            )}
          </button>
        );
      })}
    </div>
  </div>

  <div style={styles.section}>
    <div style={styles.sectionTitle}>Facial emotion</div>

    <div style={styles.grid}>
      {EMOTIONS.map((emotion) => (
        <button
          key={emotion.value}
          type="button"
          onClick={() => update({ emotion: emotion.value })}
          style={{
            ...styles.card,
            minHeight: 58,
            padding: 9,
            textAlign: "center",
            borderColor:
              settings.emotion === emotion.value
                ? "#9584ff"
                : "#36415b",
            background:
              settings.emotion === emotion.value
                ? "#37345f"
                : "#20283b",
          }}
        >
          <div style={{ fontSize: 21 }}>{emotion.icon}</div>
          <div style={{ fontSize: 11, marginTop: 5 }}>
            {emotion.label}
          </div>
        </button>
      ))}
    </div>
  </div>

  <div style={styles.section}>
    <div style={styles.sectionTitle}>Body performance</div>

    <select
      style={styles.select}
      value={settings.gesture}
      onChange={(event) =>
        update({
          gesture: event.target.value as ActingGesture,
        })
      }
    >
      {GESTURES.map((gesture) => (
        <option key={gesture.value} value={gesture.value}>
          {gesture.label}
        </option>
      ))}
    </select>
  </div>

  <div style={styles.section}>
    <div style={styles.sectionTitle}>Eye direction and attention</div>

    <select
      style={styles.select}
      value={settings.eyeFocus}
      onChange={(event) =>
        update({
          eyeFocus: event.target.value as EyeFocus,
        })
      }
    >
      {EYE_FOCUS.map((focus) => (
        <option key={focus.value} value={focus.value}>
          {focus.label}
        </option>
      ))}
    </select>
  </div>

  <div style={styles.section}>
    <div style={styles.sectionTitle}>Performance controls</div>

    {slider("Acting intensity", "intensity")}
    {slider("Character energy", "energy")}
    {slider("Gesture speed", "gestureSpeed", 0.25, 2, 0.05)}
    {slider("Head movement", "headMovement")}
    {slider("Body movement", "bodyMovement")}
    {slider("Facial intensity", "facialIntensity")}
  </div>

  <div style={styles.section}>
    <div style={styles.sectionTitle}>Natural performance</div>

    {[
      {
        key: "speaking" as const,
        label: "Speaking performance",
      },
      {
        key: "blinkEnabled" as const,
        label: "Natural eye blinking",
      },
      {
        key: "breathingEnabled" as const,
        label: "Subtle breathing",
      },
    ].map((item) => (
      <label key={item.key} style={styles.toggleRow}>
        <span>{item.label}</span>

        <input
          type="checkbox"
          checked={settings[item.key]}
          onChange={(event) =>
            update({ [item.key]: event.target.checked })
          }
          style={{
            width: 18,
            height: 18,
            accentColor: "#9584ff",
          }}
        />
      </label>
    ))}
  </div>

  <div
    style={{
      display: "flex",
      justifyContent: "flex-end",
      marginTop: 18,
    }}
  >
    <button
      type="button"
      style={styles.reset}
      onClick={() => update(DEFAULT_ACTING_SETTINGS)}
    >
      Reset performance
    </button>
  </div>
</section>

);
  }
