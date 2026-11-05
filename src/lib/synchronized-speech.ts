export type SpeechPerformanceEventType =
  | "start"
  | "boundary"
  | "end"
  | "error"
  | "cancel";

export interface SpeechPerformanceEvent {
  type: SpeechPerformanceEventType;
  characterId?: string;
  text: string;
  charIndex?: number;
  charLength?: number;
  elapsedTime?: number;
}

export interface SynchronizedSpeechOptions {
  characterId?: string;
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;

  onStart?: () => void;
  onBoundary?: (event: SpeechPerformanceEvent) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

interface ActiveSpeech {
  utterance: SpeechSynthesisUtterance;
  finish: () => void;
  characterId?: string;
  text: string;
  startedAt: number;
}

type SpeechListener = (
  event: SpeechPerformanceEvent
) => void;

let activeSpeech: ActiveSpeech | null = null;

const listeners = new Set<SpeechListener>();

/* ---------------------------------------
SUBSCRIBE TO SPEECH PERFORMANCE EVENTS
--------------------------------------- */

export function subscribeToSpeechPerformance(
  listener: SpeechListener
): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/* ---------------------------------------
EMIT PERFORMANCE EVENTS
--------------------------------------- */

function emitSpeechEvent(
  event: SpeechPerformanceEvent
): void {
  listeners.forEach((listener) => {
    try {
      listener(event);
    } catch (error) {
      console.error(
        "Speech performance listener failed:",
        error
      );
    }
  });
}

/* ---------------------------------------
STOP ACTIVE SPEECH
--------------------------------------- */

export function stopSynchronizedSpeech(): void {
  const previous = activeSpeech;

  if (!previous) {
    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }

    return;
  }

  // Clear reference before cancellation.
  activeSpeech = null;

  emitSpeechEvent({
    type: "cancel",
    characterId: previous.characterId,
    text: previous.text,
    elapsedTime: previous.startedAt
      ? (Date.now() - previous.startedAt) / 1000
      : 0,
  });

  if (
    typeof window !== "undefined" &&
    "speechSynthesis" in window
  ) {
    window.speechSynthesis.cancel();
  }

  previous.finish();
}

/* ---------------------------------------
SYNCHRONIZED SPEECH
--------------------------------------- */

export function speakSynchronized(
  text: string,
  options: SynchronizedSpeechOptions = {}
): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("Speech synthesis is unavailable.")
    );
  }

  if (!("speechSynthesis" in window)) {
    return Promise.reject(
      new Error(
        "This browser does not support speech synthesis."
      )
    );
  }

  const cleanText = text.trim();

  if (!cleanText) {
    return Promise.resolve();
  }

  // Only one character speaks at a time.
  stopSynchronizedSpeech();

  return new Promise<void>((resolve) => {
    const utterance = new SpeechSynthesisUtterance(
      cleanText
    );

    utterance.lang = options.language || "en-US";

    utterance.rate = Math.max(
      0.5,
      Math.min(2, options.rate ?? 1)
    );

    utterance.pitch = Math.max(
      0,
      Math.min(2, options.pitch ?? 1)
    );

    utterance.volume = Math.max(
      0,
      Math.min(1, options.volume ?? 1)
    );

    let finished = false;
    let startedAt = 0;

    const finish = () => {
      if (finished) return;

      finished = true;

      if (activeSpeech?.utterance === utterance) {
        activeSpeech = null;
      }

      resolve();
    };

    activeSpeech = {
      utterance,
      finish,
      characterId: options.characterId,
      text: cleanText,
      startedAt: 0,
    };

    /* ACTUAL SPEECH START */

    utterance.onstart = () => {
      if (activeSpeech?.utterance !== utterance) {
        return;
      }

      startedAt = Date.now();

      activeSpeech.startedAt = startedAt;

      options.onStart?.();

      emitSpeechEvent({
        type: "start",
        characterId: options.characterId,
        text: cleanText,
        elapsedTime: 0,
      });
    };

    /* WORD / SENTENCE BOUNDARY */

    utterance.onboundary = (event) => {
      if (activeSpeech?.utterance !== utterance) {
        return;
      }

      const boundaryEvent: SpeechPerformanceEvent = {
        type: "boundary",
        characterId: options.characterId,
        text: cleanText,
        charIndex: event.charIndex,
        charLength: event.charLength,
        elapsedTime: startedAt
          ? (Date.now() - startedAt) / 1000
          : 0,
      };

      options.onBoundary?.(boundaryEvent);

      emitSpeechEvent(boundaryEvent);
    };

    /* ACTUAL SPEECH END */

    utterance.onend = () => {
      if (activeSpeech?.utterance !== utterance) {
        finish();
        return;
      }

      emitSpeechEvent({
        type: "end",
        characterId: options.characterId,
        text: cleanText,
        elapsedTime: startedAt
          ? (Date.now() - startedAt) / 1000
          : 0,
      });

      options.onEnd?.();

      finish();
    };

    /* SPEECH ERROR */

    utterance.onerror = (event) => {
      if (activeSpeech?.utterance !== utterance) {
        finish();
        return;
      }

      const message =
        event.error || "Speech playback failed.";

      emitSpeechEvent({
        type: "error",
        characterId: options.characterId,
        text: cleanText,
        elapsedTime: startedAt
          ? (Date.now() - startedAt) / 1000
          : 0,
      });

      options.onError?.(message);

      finish();
    };

    /* START BROWSER SPEECH */

    try {
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to start speech.";

      options.onError?.(message);

      emitSpeechEvent({
        type: "error",
        characterId: options.characterId,
        text: cleanText,
      });

      finish();
    }
  });
}
