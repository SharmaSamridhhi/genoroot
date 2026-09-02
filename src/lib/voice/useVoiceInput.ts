"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SpeechRecognitionLike } from "./speechRecognitionTypes";

export interface UseVoiceInputResult {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
}

function getRecognitionConstructor() {
  if (typeof window === "undefined") return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

/**
 * Thin wrapper around the browser's native Web Speech API — zero cost, zero
 * API key, runs entirely client-side. Support is inconsistent across browsers
 * (notably Firefox desktop and some mobile browsers), so `isSupported` must
 * always be checked before offering a mic affordance; see MicButton.
 */
export function useVoiceInput(): UseVoiceInputResult {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const isSupported = getRecognitionConstructor() !== undefined;

  const start = useCallback(() => {
    const Ctor = getRecognitionConstructor();
    if (!Ctor || isListening) return;

    setError(null);
    setTranscript("");

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang =
      typeof navigator !== "undefined" ? navigator.language : "en-US";

    recognition.onresult = (event) => {
      let combined = "";
      for (let i = 0; i < event.results.length; i++) {
        combined += event.results[i][0].transcript;
      }
      setTranscript(combined);
    };

    recognition.onerror = (event) => {
      setError(
        event.error === "not-allowed" || event.error === "permission-denied"
          ? "Mic access denied — you can type instead"
          : "Couldn't hear that — you can type instead"
      );
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    // Set listening before calling start() (not after): some environments can
    // invoke onerror/onend synchronously within start(), and those handlers
    // must always have the last word on isListening, not get clobbered by a
    // setIsListening(true) that runs afterward.
    setIsListening(true);
    recognition.start();
  }, [isListening]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return { isSupported, isListening, transcript, error, start, stop };
}
