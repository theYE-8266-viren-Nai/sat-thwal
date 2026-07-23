"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Minimal typings for the Web Speech API (SpeechRecognition). This ships in
// Chrome/Edge as `webkitSpeechRecognition` and is powered by Google's speech
// service, so it gives us "Google voice input" without any API keys.
interface SpeechRecognitionAlternative {
  transcript: string;
}
interface SpeechRecognitionResult {
  readonly length: number;
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

interface UseVoiceInputOptions {
  /** Called with the final transcript once the user stops speaking. */
  onResult: (transcript: string) => void;
  /** Called repeatedly with the live (in-progress) transcript while speaking. */
  onInterim?: (transcript: string) => void;
  lang?: string;
}

export function useVoiceInput({ onResult, onInterim, lang = "en-US" }: UseVoiceInputOptions) {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const onResultRef = useRef(onResult);
  const onInterimRef = useRef(onInterim);
  const [isSupported, setIsSupported] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep the latest callbacks without re-creating the recognition instance.
  useEffect(() => {
    onResultRef.current = onResult;
    onInterimRef.current = onInterim;
  }, [onResult, onInterim]);

  useEffect(() => {
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      // Capability detection must run after mount: `window` is undefined during
      // SSR, so defaulting to `true` keeps server/client markup in sync and we
      // only hide the mic here once we know the browser lacks support.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSupported(false);
      return;
    }

    const recognition = new Recognition();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) final += transcript;
        else interim += transcript;
      }
      // Stream the in-progress words into the input so it "types" as you speak.
      if (interim) onInterimRef.current?.(interim);
      // Only the final transcript triggers the actual SmartMatch query, so
      // results still appear only after both the voice and match calls finish.
      if (final.trim()) onResultRef.current(final.trim());
    };
    recognition.onerror = (event) => {
      setError(
        event.error === "not-allowed" || event.error === "service-not-allowed"
          ? "Microphone access was blocked. Enable it to use voice input."
          : "Voice input didn't catch that. Please try again.",
      );
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
      recognitionRef.current = null;
    };
  }, [lang]);

  const start = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    setError(null);
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      // start() throws if already running; ignore and keep current state.
    }
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isSupported, isListening, error, start, stop };
}
