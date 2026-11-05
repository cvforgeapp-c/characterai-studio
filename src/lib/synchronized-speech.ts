export interface SynchronizedSpeechOptions {
language?: string;
rate?: number;
pitch?: number;
volume?: number;
onStart?: () => void;
onEnd?: () => void;
onError?: (error: string) => void;
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

let activeResolve: (() => void) | null = null;

export function stopSynchronizedSpeech() {
if (typeof window === "undefined") return;

window.speechSynthesis.cancel();

activeUtterance = null;

if (activeResolve) {
activeResolve();
activeResolve = null;
}
}

export function speakSynchronized(
text: string,
options: SynchronizedSpeechOptions = {}
): Promise<void> {
if (
typeof window === "undefined" ||
!("speechSynthesis" in window)
) {
options.onError?.("Speech synthesis is unavailable.");
return Promise.resolve();
}

stopSynchronizedSpeech();

const utterance = new SpeechSynthesisUtterance(text);

utterance.lang = options.language ?? "en-US";
utterance.rate = options.rate ?? 1;
utterance.pitch = options.pitch ?? 1;
utterance.volume = options.volume ?? 1;

return new Promise<void>((resolve) => {
let completed = false;

const finish = () => {
  if (completed) return;

  completed = true;

  if (activeUtterance === utterance) {
    activeUtterance = null;
  }

  activeResolve = null;

  resolve();
};

activeUtterance = utterance;
activeResolve = finish;

utterance.onstart = () => {
  options.onStart?.();
};

utterance.onend = () => {
  options.onEnd?.();
  finish();
};

utterance.onerror = (event) => {
  options.onError?.(event.error);
  finish();
};

window.speechSynthesis.speak(utterance);

});
}
