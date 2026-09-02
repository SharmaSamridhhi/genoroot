// Minimal ambient typing for the Web Speech API's SpeechRecognition — not part
// of TypeScript's standard DOM lib, and support is inconsistent across browsers
// (see useVoiceInput.ts's isSupported check), so this only declares the shape
// this app actually uses rather than the full spec.

export interface SpeechRecognitionResultLike {
  0: { transcript: string };
  isFinal: boolean;
}

export interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

export interface SpeechRecognitionErrorEventLike {
  error: string;
}

export interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

export type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}
