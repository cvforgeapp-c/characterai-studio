import React, { useCallback, useState } from "react";

import CinematicActingPanel, {
DEFAULT_ACTING_SETTINGS,
type CinematicActingSettings,
} from "./CinematicActingPanel";

interface Props {
onSettingsChange: (settings: CinematicActingSettings) => void;
initialSettings?: CinematicActingSettings;
}

export default function CinematicActingDirector({
onSettingsChange,
initialSettings = DEFAULT_ACTING_SETTINGS,
}: Props) {
const [settings, setSettings] =
useState<CinematicActingSettings>(initialSettings);

const handleChange = useCallback(
(next: CinematicActingSettings) => {
setSettings(next);
onSettingsChange(next);
},
[onSettingsChange]
);

return (
<div
style={{
display: "grid",
gridTemplateColumns: "minmax(0, 1fr)",
gap: 16,
width: "100%",
}}
>
<CinematicActingPanel
value={settings}
onChange={handleChange}
/>

  <div
    style={{
      padding: 14,
      borderRadius: 12,
      background: "#151d30",
      border: "1px solid #303b55",
      color: "#dbeafe",
      fontSize: 12,
    }}
  >
    <strong>Live acting configuration</strong>

    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 10,
      }}
    >
      <span style={badge}>
        Emotion: {settings.emotion}
      </span>

      <span style={badge}>
        Gesture: {settings.gesture}
      </span>

      <span style={badge}>
        Eye focus: {settings.eyeFocus}
      </span>

      <span style={badge}>
        Energy: {Math.round(settings.energy * 100)}%
      </span>
    </div>
  </div>
</div>

);
}

const badge: React.CSSProperties = {
padding: "7px 10px",
borderRadius: 8,
background: "#293650",
color: "#c7d2fe",
fontSize: 11,
fontWeight: 700,
};
