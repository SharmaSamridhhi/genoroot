"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SpeechRecognitionLike } from "./speechRecognitionTypes";

const VISUALIZER_BAR_COUNT = 24;

export interface UseVoiceInputResult {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  error: string | null;
  /** 0–1 per-band live mic levels (low to high frequency), for a proper
   * equalizer-style visualizer — one independent value per bar rather than
   * a single aggregate, so it actually reads as reacting to speech instead
   * of a single pulsing blob. Stays all-zero whenever the separate
   * getUserMedia stream this needs couldn't be opened (permission denied,
   * no device, etc.) — dictation itself doesn't depend on it, since
   * SpeechRecognition manages its own mic access independently. */
  levels: number[];
  /** Single 0–1 level (the average of `levels`) for simpler uses, e.g. a
   * glow on the mic button itself. */
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
  const [levels, setLevels] = useState<number[]>(() =>
    new Array(VISUALIZER_BAR_COUNT).fill(0)
  );
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
    setLevels(new Array(VISUALIZER_BAR_COUNT).fill(0));
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
      // A larger FFT than a simple RMS meter needs — gives enough frequency
      // bins to bucket into VISUALIZER_BAR_COUNT independent bands instead
      // of one aggregate number repeated everywhere, which is what actually
      // makes this read as "reacting to your voice" instead of a single pulse.
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.75;
      source.connect(analyser);

      const freqData = new Uint8Array(analyser.frequencyBinCount);
      // Voice energy concentrates in roughly the lower half of the spectrum;
      // restricting to that range (instead of spreading bars evenly across
      // the full 0–22kHz analyser range) means every bar is actually driven
      // by voice-relevant frequencies, not mostly-silent high bins.
      const usableBins = Math.floor(freqData.length * 0.5);
      const binsPerBar = Math.max(
        1,
        Math.floor(usableBins / VISUALIZER_BAR_COUNT)
      );

      const tick = () => {
        analyser.getByteFrequencyData(freqData);
        const bars: number[] = [];
        for (let i = 0; i < VISUALIZER_BAR_COUNT; i++) {
          const start = i * binsPerBar;
          const end = Math.min(usableBins, start + binsPerBar);
          let sum = 0;
          for (let j = start; j < end; j++) sum += freqData[j];
          const avg = end > start ? sum / (end - start) : 0;
          // Byte data (0–255) from a typical speaking volume rarely gets
          // anywhere near the top of that range — a plain linear map barely
          // moves. A square-root curve boosts quiet-to-moderate levels
          // (matching perceived loudness better than linear does anyway),
          // so normal speech visibly drives the bars instead of needing to
          // shout at the mic to see anything happen.
          bars.push(Math.min(1, Math.pow(avg / 255, 0.5) * 1.35));
        }
        setLevels(bars);
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

  const level =
    levels.length > 0
      ? levels.reduce((sum, v) => sum + v, 0) / levels.length
      : 0;

  return {
    isSupported,
    isListening,
    transcript,
    error,
    levels,
    level,
    start,
    stop,
  };
}
