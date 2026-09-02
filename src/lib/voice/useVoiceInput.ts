"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SpeechRecognitionLike } from "./speechRecognitionTypes";

export interface UseVoiceInputResult {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  error: string | null;
  /** 0–1 live mic input level, for a visualizer. Stays 0 whenever the
   * separate getUserMedia stream this needs couldn't be opened (permission
   * denied, no device, etc.) — dictation itself doesn't depend on it, since
   * SpeechRecognition manages its own mic access independently. */
  level: number;
  start: () => void;
  stop: () => void;
}

function getRecognitionConstructor() {
  if (typeof window === "undefined") return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

function getAudioContextConstructor() {
  if (typeof window === "undefined") return undefined;
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  );
}

/**
 * Thin wrapper around the browser's native Web Speech API — zero cost, zero
 * API key, runs entirely client-side. Support is inconsistent across browsers
 * (notably Firefox desktop and some mobile browsers), so `isSupported` must
 * always be checked before offering a mic affordance; see MicButton.
 *
 * The live `level` meter is a second, independent mic acquisition
 * (getUserMedia + AnalyserNode) run alongside SpeechRecognition — the Speech
 * API never exposes raw audio/amplitude data, only transcripts, so there's no
 * way to drive a visualizer off it directly.
 */
export function useVoiceInput(): UseVoiceInputResult {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  const isSupported = getRecognitionConstructor() !== undefined;

  const stopVisualizer = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    micStreamRef.current?.getTracks().forEach((track) => track.stop());
    micStreamRef.current = null;
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setLevel(0);
  }, []);

  const startVisualizer = useCallback(async () => {
    const Ctor = getAudioContextConstructor();
    if (!Ctor || typeof navigator === "undefined" || !navigator.mediaDevices)
      return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      micStreamRef.current = stream;
      const audioContext = new Ctor();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sumSquares = 0;
        for (let i = 0; i < data.length; i++) {
          const normalized = (data[i] - 128) / 128;
          sumSquares += normalized * normalized;
        }
        const rms = Math.sqrt(sumSquares / data.length);
        setLevel(Math.min(1, rms * 4));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // No visualizer this session — dictation itself is unaffected.
    }
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionConstructor();
    if (!Ctor || isListening) return;

    setError(null);
    setTranscript("");
    startVisualizer();

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
      stopVisualizer();
    };

    recognition.onend = () => {
      setIsListening(false);
      stopVisualizer();
    };

    recognitionRef.current = recognition;
    // Set listening before calling start() (not after): some environments can
    // invoke onerror/onend synchronously within start(), and those handlers
    // must always have the last word on isListening, not get clobbered by a
    // setIsListening(true) that runs afterward.
    setIsListening(true);
    recognition.start();
  }, [isListening, startVisualizer, stopVisualizer]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    stopVisualizer();
  }, [stopVisualizer]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      stopVisualizer();
    };
  }, [stopVisualizer]);

  return { isSupported, isListening, transcript, error, level, start, stop };
}
