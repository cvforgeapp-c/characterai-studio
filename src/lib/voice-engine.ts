export interface VoiceSettings {
  language: string;
  rate: number;
  pitch: number;
  volume: number;
  voiceName?: string;
}

export interface AvailableVoice {
  name: string;
  language: string;
  default: boolean;
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  language: "en-US",
  rate: 1,
  pitch: 1.15,
  volume: 1
};

export const SUPPORTED_VOICE_LANGUAGES = [
  { code: "en-US", name: "English (US)" },
  { code: "en-GB", name: "English (UK)" },
  { code: "am-ET", name: "Amharic" },
  { code: "ar-SA", name: "Arabic" },
  { code: "fr-FR", name: "French" },
  { code: "es-ES", name: "Spanish" },
  { code: "de-DE", name: "German" },
  { code: "it-IT", name: "Italian" },
  { code: "pt-BR", name: "Portuguese" },
  { code: "hi-IN", name: "Hindi" },
  { code: "zh-CN", name: "Chinese" },
  { code: "ja-JP", name: "Japanese" },
  { code: "ko-KR", name: "Korean" },
  { code: "sw-KE", name: "Swahili" },
  { code: "tr-TR", name: "Turkish" }
];

export function isSpeechSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  );
}

export function getAvailableVoices(): AvailableVoice[] {
  if (!isSpeechSupported()) {
    return [];
  }

  return window.speechSynthesis
    .getVoices()
    .map((voice) => ({
      name: voice.name,
      language: voice.lang,
      default: voice.default
    }));
}

export function getVoicesForLanguage(
  language: string
): AvailableVoice[] {
  const languagePrefix = language.split("-")[0].toLowerCase();

  return getAvailableVoices().filter((voice) =>
    voice.language
      .toLowerCase()
      .startsWith(languagePrefix)
  );
}

export function speakText(
  text: string,
  settings: VoiceSettings = DEFAULT_VOICE_SETTINGS
): boolean {
  if (!isSpeechSupported() || !text.trim()) {
    return false;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = settings.language;
  utterance.rate = Math.max(0.5, Math.min(2, settings.rate));
  utterance.pitch = Math.max(0, Math.min(2, settings.pitch));
  utterance.volume = Math.max(0, Math.min(1, settings.volume));

  if (settings.voiceName) {
    const selectedVoice = window.speechSynthesis
      .getVoices()
      .find((voice) => voice.name === settings.voiceName);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
  }

  window.speechSynthesis.speak(utterance);

  return true;
}

export function stopSpeaking(): void {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}

export function pauseSpeaking(): void {
  if (isSpeechSupported()) {
    window.speechSynthesis.pause();
  }
}

export function resumeSpeaking(): void {
  if (isSpeechSupported()) {
    window.speechSynthesis.resume();
  }
}

export function isSpeaking(): boolean {
  return (
    isSpeechSupported() &&
    window.speechSynthesis.speaking
  );
}
