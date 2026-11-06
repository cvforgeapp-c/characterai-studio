import { useEffect, useState } from "react";

import {
  getAllRigCapabilities,
  subscribeToRigCapabilities,
  type CharacterRigCapabilities,
} from "../lib/cinematic-rig-capability-store";

function Status({
  label,
  supported,
}: {
  label: string;
  supported: boolean;
}) {
  return (
    <div style={styles.row}>
      <span>{label}</span>

      <span
        style={{
          color: supported ? "#86efac" : "#fca5a5",
          fontWeight: 700,
        }}
      >
        {supported ? "SUPPORTED" : "NOT DETECTED"}
      </span>
    </div>
  );
}

function CharacterReport({
  report,
}: {
  report: CharacterRigCapabilities;
}) {
  const supportedFeatures = [
    report.hasSkeleton,
    report.hasFacialMorphs,
    report.hasVisemeMorphs,
    report.hasBlinkSupport,
    report.hasEyeBones,
    report.hasEarBones,
    report.hasTailBones,
  ].filter(Boolean).length;

  return (
    <div style={styles.character}>
      <div style={styles.characterTitle}>
        {report.characterId}
      </div>

      <div style={styles.score}>
        {supportedFeatures}/7 animation capabilities detected
      </div>

      <Status
        label="Skeleton"
        supported={report.hasSkeleton}
      />

      <Status
        label="Facial expressions"
        supported={report.hasFacialMorphs}
      />

      <Status
        label="Lip-sync morphs"
        supported={report.hasVisemeMorphs}
      />

      <Status
        label="Blink support"
        supported={report.hasBlinkSupport}
      />

      <Status
        label="Eye bones"
        supported={report.hasEyeBones}
      />

      <Status
        label="Ear bones"
        supported={report.hasEarBones}
      />

      <Status
        label="Tail bones"
        supported={report.hasTailBones}
      />

      <div style={styles.metadata}>
        Bones: {report.boneCount} · Morph targets:{" "}
        {report.morphCount}
      </div>
    </div>
  );
}

export default function CinematicRigDiagnostics({
  enabled = true,
}: {
  enabled?: boolean;
}) {
  const [reports, setReports] = useState<
    CharacterRigCapabilities[]
  >([]);

  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setReports([]);
      return;
    }

    const refresh = () => {
      setReports(getAllRigCapabilities());
    };

    refresh();

    return subscribeToRigCapabilities(refresh);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div style={styles.container}>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        style={styles.header}
      >
        <span>🔍 STAGE 73–75 · RIG DIAGNOSTICS</span>

        <span>{expanded ? "−" : "+"}</span>
      </button>

      <div style={styles.summary}>
        {reports.length > 0
          ? `${reports.length} CHARACTER MODEL${reports.length === 1 ? "" : "S"} ANALYZED`
          : "WAITING FOR CHARACTER MODELS"}
      </div>

      {expanded && (
        <div style={styles.content}>
          {reports.length === 0 ? (
            <div style={styles.empty}>
              Load a character to inspect its animation rig.
            </div>
          ) : (
            reports.map((report) => (
              <CharacterReport
                key={report.characterId}
                report={report}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 270,
    maxHeight: "70%",
    overflowY: "auto",
    padding: 12,
    borderRadius: 12,
    background: "rgba(9, 15, 24, 0.94)",
    border: "1px solid rgba(120, 180, 220, 0.3)",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
    boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
    zIndex: 30,
    pointerEvents: "auto",
  },

  header: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    border: 0,
    background: "transparent",
    color: "#9bdcff",
    fontWeight: 800,
    fontSize: 11,
    cursor: "pointer",
    padding: 0,
  },

  summary: {
    marginTop: 8,
    fontSize: 10,
    color: "#b8c7d8",
  },

  content: {
    marginTop: 8,
  },

  character: {
    marginTop: 12,
    paddingTop: 10,
    borderTop: "1px solid rgba(255,255,255,0.12)",
  },

  characterTitle: {
    fontSize: 12,
    fontWeight: 800,
    color: "#fff",
    marginBottom: 5,
  },

  score: {
    fontSize: 10,
    color: "#93c5fd",
    marginBottom: 7,
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    fontSize: 10,
    padding: "4px 0",
    color: "#dbeafe",
  },

  metadata: {
    marginTop: 7,
    fontSize: 10,
    color: "#91a6ba",
  },

  empty: {
    marginTop: 12,
    fontSize: 11,
    color: "#b8c7d8",
  },
};
