import { useEffect, useMemo, useState } from "react";

import {
  getAllRigCapabilities,
  subscribeToRigCapabilities,
  type CharacterRigCapabilities,
} from "../lib/cinematic-rig-capability-store";

interface QualityResult {
  score: number;
  level: "Excellent" | "Good" | "Basic" | "Limited";
  recommendations: string[];
}

function calculateAnimationQuality(
  rig: CharacterRigCapabilities,
): QualityResult {
  let score = 0;
  const recommendations: string[] = [];

  // Skeletal animation: 20 points
  if (rig.hasSkeleton) {
    score += 20;
  } else {
    recommendations.push(
      "Use a rigged character model for skeletal animation.",
    );
  }

  // Facial expressions: 15 points
  if (rig.hasFacialMorphs) {
    score += 15;
  } else if (rig.hasSkeleton) {
    recommendations.push(
      "Add facial morph targets or compatible facial bones.",
    );
  } else {
    recommendations.push(
      "Add facial geometry and a compatible facial rig.",
    );
  }

  // Lip synchronization: 20 points
  if (rig.hasVisemeMorphs) {
    score += 20;
  } else {
    recommendations.push(
      "Add viseme morph targets for more accurate lip synchronization.",
    );
  }

  // Blinking: 10 points
  if (rig.hasBlinkSupport) {
    score += 10;
  } else {
    recommendations.push(
      "Add eyelid bones or blink morph targets.",
    );
  }

  // Eye movement: 10 points
  if (rig.hasEyeBones) {
    score += 10;
  } else {
    recommendations.push(
      "Add dedicated eye bones for natural eye movement.",
    );
  }

  // Ear movement: 10 points
  if (rig.hasEarBones) {
    score += 10;
  } else {
    recommendations.push(
      "Add ear bones if the character has movable ears.",
    );
  }

  // Tail movement: 10 points
  if (rig.hasTailBones) {
    score += 10;
  } else {
    recommendations.push(
      "Add tail bones if the character has a tail.",
    );
  }

  // Additional rig complexity: 5 points
  if (rig.boneCount >= 20) {
    score += 5;
  } else if (rig.boneCount < 10) {
    recommendations.push(
      "Consider a more detailed character skeleton.",
    );
  } else {
    score += 2;
  }

  score = Math.min(100, score);

  let level: QualityResult["level"];

  if (score >= 85) {
    level = "Excellent";
  } else if (score >= 65) {
    level = "Good";
  } else if (score >= 40) {
    level = "Basic";
  } else {
    level = "Limited";
  }

  return {
    score,
    level,
    recommendations,
  };
}

export default function CinematicAnimationQualityPanel({
  enabled = true,
}: {
  enabled?: boolean;
}) {
  const [rigs, setRigs] = useState<CharacterRigCapabilities[]>([]);

  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setRigs([]);
      return;
    }

    const refresh = () => {
      setRigs(getAllRigCapabilities());
    };

    refresh();

    const unsubscribe = subscribeToRigCapabilities(refresh);

    return () => unsubscribe();
  }, [enabled]);

  const results = useMemo(
    () =>
      rigs.map((rig) => ({
        rig,
        quality: calculateAnimationQuality(rig),
      })),
    [rigs],
  );

  const averageScore = useMemo(() => {
    if (results.length === 0) return 0;

    return Math.round(
      results.reduce(
        (total, item) => total + item.quality.score,
        0,
      ) / results.length,
    );
  }, [results]);

  if (!enabled) return null;

  return (
    <section
      style={{
        width: "100%",
        maxWidth: 520,
        margin: "12px auto",
        padding: 16,
        borderRadius: 14,
        background: "#101820",
        color: "#ffffff",
        border: "1px solid #34434d",
        fontFamily: "Arial, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <button
        onClick={() => setExpanded((value) => !value)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "transparent",
          border: 0,
          color: "white",
          cursor: "pointer",
          fontSize: 15,
          fontWeight: 700,
          padding: 0,
        }}
      >
        <span>🎬 ANIMATION QUALITY</span>
        <span>{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: "#9caeb9" }}>
                Average character score
              </div>

              <div
                style={{
                  fontSize: 34,
                  fontWeight: 800,
                  marginTop: 4,
                }}
              >
                {averageScore}
                <span style={{ fontSize: 15, color: "#9caeb9" }}>
                  /100
                </span>
              </div>
            </div>

            <div
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                background: "#1c303a",
                color: "#72d9c0",
                fontSize: 12,
              }}
            >
              {results.length} Characters
            </div>
          </div>

          <div
            style={{
              height: 8,
              borderRadius: 10,
              background: "#283640",
              overflow: "hidden",
              marginBottom: 18,
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${averageScore}%`,
                background: "#36c9a2",
                transition: "width 0.3s ease",
              }}
            />
          </div>

          {results.length === 0 ? (
            <div
              style={{
                padding: 18,
                textAlign: "center",
                color: "#a7b7c2",
                fontSize: 13,
              }}
            >
              Waiting for character rig analysis...
            </div>
          ) : (
            results.map(({ rig, quality }) => (
              <div
                key={rig.characterId}
                style={{
                  padding: 12,
                  marginBottom: 10,
                  borderRadius: 10,
                  background: "#1a2730",
                  border: "1px solid #34434d",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <strong style={{ fontSize: 13 }}>
                    {rig.characterId}
                  </strong>

                  <span
                    style={{
                      color:
                        quality.score >= 65
                          ? "#65dfb7"
                          : "#f4bd68",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {quality.score}/100 · {quality.level}
                  </span>
                </div>

                <div
                  style={{
                    height: 5,
                    background: "#34434d",
                    borderRadius: 10,
                    marginTop: 10,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${quality.score}%`,
                      background: "#36c9a2",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 7,
                    marginTop: 12,
                    fontSize: 11,
                    color: "#c5d0d7",
                  }}
                >
                  <span>
                    Skeleton: {rig.hasSkeleton ? "✓" : "✕"}
                  </span>

                  <span>
                    Facial: {rig.hasFacialMorphs ? "✓" : "✕"}
                  </span>

                  <span>
                    Lip-sync: {rig.hasVisemeMorphs ? "✓" : "✕"}
                  </span>

                  <span>
                    Blinking: {rig.hasBlinkSupport ? "✓" : "✕"}
                  </span>

                  <span>
                    Eye bones: {rig.hasEyeBones ? "✓" : "✕"}
                  </span>

                  <span>
                    Ear bones: {rig.hasEarBones ? "✓" : "✕"}
                  </span>

                  <span>
                    Tail bones: {rig.hasTailBones ? "✓" : "✕"}
                  </span>

                  <span>
                    Bones: {rig.boneCount}
                  </span>
                </div>

                {quality.recommendations.length > 0 && (
                  <details style={{ marginTop: 12 }}>
                    <summary
                      style={{
                        cursor: "pointer",
                        color: "#72d9c0",
                        fontSize: 12,
                      }}
                    >
                      Improvement recommendations
                    </summary>

                    <ul
                      style={{
                        paddingLeft: 18,
                        color: "#aebdc7",
                        fontSize: 11,
                        lineHeight: 1.7,
                      }}
                    >
                      {quality.recommendations.map(
                        (recommendation, index) => (
                          <li key={index}>{recommendation}</li>
                        ),
                      )}
                    </ul>
                  </details>
                )}
              </div>
            ))
          )}

          <div
            style={{
              marginTop: 12,
              fontSize: 10,
              color: "#82949f",
              lineHeight: 1.6,
            }}
          >
            Scores measure detected rig capabilities, not actual
            animation realism or visual quality.
          </div>
        </div>
      )}
    </section>
  );
    }
