import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  DEFAULT_ACTING_SETTINGS,
  type CinematicActingSettings,
} from "./CinematicActingPanel";

interface Props {
  dialogue: string;
  characterName?: string;
  enabled?: boolean;
  onSettingsChange: (settings: CinematicActingSettings) => void;
}

type PerformancePreset = {
  emotion: CinematicActingSettings["emotion"];
  gesture: CinematicActingSettings["gesture"];
  eyeFocus: CinematicActingSettings["eyeFocus"];
  intensity: number;
};

const PERFORMANCE_PRESETS: Record<string, PerformancePreset> = {
  excited: {
    emotion: "excited",
    gesture: "celebrate",
    eyeFocus: "camera",
    intensity: 0.95,
  },

  surprised: {
    emotion: "surprised",
    gesture: "react",
    eyeFocus: "camera",
    intensity: 0.95,
  },

  angry: {
    emotion: "angry",
    gesture: "argue",
    eyeFocus: "partner",
    intensity: 0.85,
  },

  sad: {
    emotion: "sad",
    gesture: "cry",
    eyeFocus: "down",
    intensity: 0.75,
  },

  suspicious: {
    emotion: "suspicious",
    gesture: "think",
    eyeFocus: "partner",
    intensity: 0.8,
  },

  confident: {
    emotion: "confident",
    gesture: "explain",
    eyeFocus: "camera",
    intensity: 0.8,
  },

  laughing: {
    emotion: "happy",
    gesture: "laugh",
    eyeFocus: "camera",
    intensity: 1,
  },

  thinking: {
    emotion: "curious",
    gesture: "think",
    eyeFocus: "down",
    intensity: 0.65,
  },

  neutral: {
    emotion: "neutral",
    gesture: "idle",
    eyeFocus: "camera",
    intensity: 0.4,
  },
};

function detectPerformance(
  text: string
): PerformancePreset {
  const value = text.toLowerCase();

  const rules: Array<{
    key: keyof typeof PERFORMANCE_PRESETS;
    words: string[];
  }> = [
    {
      key: "surprised",
      words: [
        "what?!",
        "what?",
        "no way",
        "seriously",
        "unbelievable",
        "oh my",
        "wow",
        "really?",
      ],
    },
    {
      key: "angry",
      words: [
        "angry",
        "hate",
        "stop",
        "shut up",
        "leave me",
        "ridiculous",
        "furious",
        "enough",
      ],
    },
    {
      key: "sad",
      words: [
        "sad",
        "sorry",
        "miss you",
        "lonely",
        "heartbroken",
        "cry",
        "lost",
        "disappointed",
      ],
    },
    {
      key: "suspicious",
      words: [
        "really?",
        "are you sure",
        "i don't trust",
        "suspicious",
        "secret",
        "lying",
        "what are you hiding",
      ],
    },
    {
      key: "laughing",
      words: [
        "haha",
        "lol",
        "hahaha",
        "funny",
        "joke",
        "laugh",
        "lmao",
      ],
    },
    {
      key: "excited",
      words: [
        "amazing",
        "awesome",
        "fantastic",
        "let's go",
        "yes!",
        "incredible",
        "finally",
        "wonderful",
      ],
    },
    {
      key: "confident",
      words: [
        "trust me",
        "i can do it",
        "i am the best",
        "i know",
        "watch me",
        "no problem",
      ],
    },
    {
      key: "thinking",
      words: [
        "hmm",
        "let me think",
        "maybe",
        "perhaps",
        "i wonder",
        "what if",
      ],
    },
  ];

  for (const rule of rules) {
    if (
      rule.words.some((word) =>
        value.includes(word)
      )
    ) {
      return PERFORMANCE_PRESETS[rule.key];
    }
  }

  if (/[!?]{2,}/.test(text) || text.includes("!")) {
    return PERFORMANCE_PRESETS.excited;
  }

  return PERFORMANCE_PRESETS.neutral;
}

export default function CinematicDialogueDirector({
  dialogue,
  characterName = "Character",
  enabled = true,
  onSettingsChange,
}: Props) {
  const [automatic, setAutomatic] = useState(true);

  const [manualSettings, setManualSettings] =
    useState<CinematicActingSettings>(
      DEFAULT_ACTING_SETTINGS
    );

  const detected = useMemo(
    () => detectPerformance(dialogue),
    [dialogue]
  );

  const automaticSettings =
    useMemo<CinematicActingSettings>(
      () => ({
        ...DEFAULT_ACTING_SETTINGS,
        emotion: detected.emotion,
        gesture: detected.gesture,
        eyeFocus: detected.eyeFocus,
        intensity: detected.intensity,
        speaking: true,
      }),
      [detected]
    );

  const activeSettings = automatic
    ? automaticSettings
    : manualSettings;

  useEffect(() => {
    if (!enabled || !dialogue.trim()) return;

    onSettingsChange(activeSettings);
  }, [
    activeSettings,
    dialogue,
    enabled,
    onSettingsChange,
  ]);

  const applyManualPreset = (
    preset: PerformancePreset
  ) => {
    const next: CinematicActingSettings = {
      ...DEFAULT_ACTING_SETTINGS,
      emotion: preset.emotion,
      gesture: preset.gesture,
      eyeFocus: preset.eyeFocus,
      intensity: preset.intensity,
      speaking: true,
    };

    setManualSettings(next);
    setAutomatic(false);
    onSettingsChange(next);
  };

  return (
    <section className="w-full space-y-4 rounded-2xl border border-white/10 bg-[#10141f] p-4 text-white">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold">
            Dialogue Performance Director
          </h3>

          <p className="mt-1 text-xs text-gray-400">
            Automatic acting direction for {characterName}.
          </p>
        </div>

        <span className="rounded-full bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-300">
          STAGE 22
        </span>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/25 p-3">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
          Current dialogue
        </p>

        <p className="text-sm leading-relaxed text-gray-200">
          {dialogue.trim() || "Waiting for dialogue..."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            setAutomatic(true);
            onSettingsChange(automaticSettings);
          }}
          className={`rounded-xl border px-3 py-3 text-xs font-bold ${
            automatic
              ? "border-purple-400 bg-purple-500/20 text-purple-200"
              : "border-white/10 bg-white/5 text-gray-300"
          }`}
        >
          ✨ AUTO DIRECT
        </button>

        <button
          type="button"
          onClick={() => setAutomatic(false)}
          className={`rounded-xl border px-3 py-3 text-xs font-bold ${
            !automatic
              ? "border-purple-400 bg-purple-500/20 text-purple-200"
              : "border-white/10 bg-white/5 text-gray-300"
          }`}
        >
          MANUAL CONTROL
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-[10px] uppercase tracking-wider text-gray-500">
            Detected emotion
          </p>

          <p className="mt-1 text-sm font-bold capitalize text-purple-300">
            {detected.emotion}
          </p>
        </div>

        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-[10px] uppercase tracking-wider text-gray-500">
            Suggested gesture
          </p>

          <p className="mt-1 text-sm font-bold capitalize text-emerald-300">
            {detected.gesture.replace("-", " ")}
          </p>
        </div>
      </div>

      {!automatic && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Object.entries(PERFORMANCE_PRESETS).map(
            ([name, preset]) => (
              <button
                key={name}
                type="button"
                onClick={() => applyManualPreset(preset)}
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-3 text-xs font-semibold capitalize text-gray-300 transition hover:border-purple-400 hover:bg-purple-500/10"
              >
                {name}
              </button>
            )
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs">
        <span className="text-gray-400">
          Performance intensity
        </span>

        <span className="font-bold text-purple-300">
          {Math.round(activeSettings.intensity * 100)}%
        </span>
      </div>

      <p className="text-[10px] leading-relaxed text-gray-500">
        Automatic direction uses dialogue keyword and punctuation
        detection. It is a lightweight local director, not a
        full AI emotion-understanding model.
      </p>
    </section>
  );
}
