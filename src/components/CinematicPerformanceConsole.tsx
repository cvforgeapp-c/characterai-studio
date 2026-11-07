import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

import CinematicDialoguePlayback, {
  type DialoguePlaybackLine,
} from "./CinematicDialoguePlayback";

import type {
  CinematicActingSettings,
} from "./CinematicActingPanel";

import {
  useCinematicPerformance,
} from "./CinematicPerformanceContext";

interface Props {
  lines: DialoguePlaybackLine[];

  onLineChange?: (
    line: DialoguePlaybackLine | null
  ) => void;

  onPlaybackChange?: (
    playing: boolean
  ) => void;

  onSpeak?: (
    line: DialoguePlaybackLine
  ) => void | Promise<void>;

  onStopSpeaking?: () => void;
}

export default function CinematicPerformanceConsole({
  lines,
  onLineChange,
  onPlaybackChange,
  onSpeak,
  onStopSpeaking,
}: Props) {
  const performance = useCinematicPerformance();

  const previousCharacterIds = useRef<string[]>([]);

  // Collect unique dialogue characters.
  const characterIds = useMemo(
    () =>
      Array.from(
        new Set(
          lines
            .map((line) => line.characterId)
            .filter(Boolean)
        )
      ),
    [lines]
  );

  // Register dialogue characters with the shared provider.
  useEffect(() => {
    if (characterIds.length === 0) {
      return;
    }

    performance.registerCharacters(characterIds);

    previousCharacterIds.current = characterIds;
  }, [
    characterIds,
    performance.registerCharacters,
  ]);

  // Synchronize individual character acting instructions.
  const handleActingChange = useCallback(
    (
      characterId: string,
      settings: CinematicActingSettings
    ) => {
      performance.updatePerformance(
        characterId,
        settings
      );
    },
    [performance.updatePerformance]
  );

  // Forward speech requests to the synchronized speech engine.
  const handleSpeak = useCallback(
    async (line: DialoguePlaybackLine) => {
      if (!onSpeak) {
        return;
      }

      await onSpeak(line);
    },
    [onSpeak]
  );

  // Stop speech when playback stops.
  const handleStopSpeaking = useCallback(() => {
    onStopSpeaking?.();
  }, [onStopSpeaking]);

  const connectedCharacters = characterIds.length;

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 18,
        borderRadius: 16,
        background:
          "linear-gradient(145deg, #111827, #0b1220)",
        border: "1px solid rgba(148,163,184,0.16)",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: "#ffffff",
              fontSize: 19,
              fontWeight: 800,
              letterSpacing: "-0.4px",
            }}
          >
            Character Performance Director
          </h2>

          <p
            style={{
              margin: "6px 0 0",
              color: "#929bad",
              fontSize: 12,
            }}
          >
            Live dialogue-driven character acting
          </p>
        </div>

        {/* Connection status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 13px",
            borderRadius: 20,
            background:
              connectedCharacters > 0
                ? "rgba(22,101,52,0.25)"
                : "rgba(148,163,184,0.10)",
            border:
              connectedCharacters > 0
                ? "1px solid rgba(74,222,128,0.25)"
                : "1px solid rgba(148,163,184,0.15)",
            color:
              connectedCharacters > 0
                ? "#66e6ae"
                : "#9ca3af",
            fontSize: 11,
            fontWeight: 800,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background:
                connectedCharacters > 0
                  ? "#4ade80"
                  : "#64748b",
              boxShadow:
                connectedCharacters > 0
                  ? "0 0 10px rgba(74,222,128,0.65)"
                  : "none",
            }}
          />

          {connectedCharacters} CHARACTERS CONNECTED
        </div>
      </div>

      {/* Character connection information */}
      {connectedCharacters > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 7,
          }}
        >
          {characterIds.map((characterId) => (
            <span
              key={characterId}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                background: "rgba(59,130,246,0.10)",
                border:
                  "1px solid rgba(59,130,246,0.20)",
                color: "#93c5fd",
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              ● {characterId}
            </span>
          ))}
        </div>
      )}

      {/* Dialogue playback and acting controller */}
      {lines.length > 0 ? (
        <CinematicDialoguePlayback
          lines={lines}
          onActingChange={handleActingChange}
          onLineChange={onLineChange}
          onPlaybackChange={onPlaybackChange}
          onSpeak={handleSpeak}
          onStopSpeaking={handleStopSpeaking}
        />
      ) : (
        <div
          style={{
            padding: 28,
            borderRadius: 12,
            background: "rgba(255,255,255,0.03)",
            border:
              "1px dashed rgba(148,163,184,0.25)",
            textAlign: "center",
            color: "#94a3b8",
          }}
        >
          <div
            style={{
              fontSize: 28,
              marginBottom: 10,
            }}
          >
            🎬
          </div>

          <strong
            style={{
              display: "block",
              color: "#e2e8f0",
              fontSize: 13,
              marginBottom: 5,
            }}
          >
            No dialogue available
          </strong>

          <span style={{ fontSize: 11 }}>
            Generate a comedy script to start character
            performances.
          </span>
        </div>
      )}
    </div>
  );
}
