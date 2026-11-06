import {
useEffect,
useState,
type CSSProperties,
} from "react";

import {
getCharacterAnimationTaskDiagnostics,
type CharacterAnimationTaskDiagnostic,
} from "../lib/cinematic-animation-runtime";

const panelStyle: CSSProperties = {
position: "absolute",
right: 12,
bottom: 12,
zIndex: 40,
width: 260,
maxHeight: 300,
overflowY: "auto",
padding: 12,
borderRadius: 12,
background: "rgba(10, 15, 25, 0.94)",
color: "#ffffff",
border: "1px solid rgba(255,255,255,0.14)",
fontFamily: "Arial, sans-serif",
fontSize: 12,
boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
};

const headingStyle: CSSProperties = {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
marginBottom: 10,
fontWeight: 700,
};

const taskStyle: CSSProperties = {
padding: "7px 8px",
marginTop: 6,
borderRadius: 7,
background: "rgba(255,255,255,0.07)",
};

const priorityLabels: Record<string, string> = {
speaking: "Speaking",
listening: "Listening",
foreground: "Foreground",
background: "Background",
};

export default function CinematicAnimationTaskPanel({
enabled = true,
}: {
enabled?: boolean;
}) {
const [tasks, setTasks] = useState<
CharacterAnimationTaskDiagnostic[]

«([]);»

const [expanded, setExpanded] = useState(true);

useEffect(() => {
if (!enabled) return;

const update = () => {
  setTasks(getCharacterAnimationTaskDiagnostics());
};

update();

const interval = window.setInterval(update, 1000);

return () => window.clearInterval(interval);

}, [enabled]);

if (!enabled) return null;

const activeCount = tasks.filter(
(task) => task.enabled
).length;

return (
<div style={panelStyle}>
<div style={headingStyle}>
<span>Animation Tasks</span>

    <button
      type="button"
      onClick={() => setExpanded((value) => !value)}
      style={{
        border: 0,
        borderRadius: 5,
        padding: "4px 8px",
        background: "rgba(255,255,255,0.12)",
        color: "#fff",
        cursor: "pointer",
      }}
    >
      {expanded ? "Hide" : "Show"}
    </button>
  </div>

  <div style={{ opacity: 0.8, marginBottom: 8 }}>
    Registered: {tasks.length} · Enabled: {activeCount}
  </div>

  {expanded && (
    <>
      {tasks.length === 0 ? (
        <div style={{ opacity: 0.65 }}>
          Waiting for animation tasks...
        </div>
      ) : (
        tasks.map((task) => (
          <div
            key={`${task.characterId}-${task.taskId}`}
            style={taskStyle}
          >
            <div style={{ fontWeight: 700 }}>
              {task.taskId}
            </div>

            <div style={{ opacity: 0.75, marginTop: 3 }}>
              Character: {task.characterId}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 5,
              }}
            >
              <span>
                {priorityLabels[task.priority] ?? task.priority}
              </span>

              <span
                style={{
                  color: task.enabled ? "#7ee7a1" : "#ff9a9a",
                }}
              >
                {task.enabled ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        ))
      )}
    </>
  )}
</div>

);
}
