"use client";

import { useEffect, useRef } from "react";
import { useVapiCall } from "@/lib/vapi/useVapiCall";
import { buildResultsSummary } from "@/lib/smartmatch/voiceSummary";
import type { ServiceCardData } from "@/types/domain";

interface VoiceResultReaderProps {
  query: string;
  results: ServiceCardData[];
  /**
   * Called when the results should be revealed — the moment the assistant
   * starts speaking, or as a fallback if the voice can't play (unconfigured,
   * blocked autoplay, or an error) so results never stay hidden forever.
   */
  onReveal: () => void;
}

// Time to wait for the voice to start before revealing results anyway.
const REVEAL_FALLBACK_MS = 6000;

/**
 * Headless component: auto-reads the SmartMatch results out loud and signals
 * (via onReveal) when the results should become visible, so the list and the
 * voice appear in sync. Renders nothing.
 */
export function VoiceResultReader({ query, results, onReveal }: VoiceResultReaderProps) {
  const { callStatus, isAssistantSpeaking, start } = useVapiCall();
  const startedKeyRef = useRef<string | null>(null);
  const revealedRef = useRef(false);
  const onRevealRef = useRef(onReveal);

  useEffect(() => {
    onRevealRef.current = onReveal;
  }, [onReveal]);

  function reveal() {
    if (revealedRef.current) return;
    revealedRef.current = true;
    onRevealRef.current();
  }

  // Start reading each new result set once, with a fallback timer so results
  // still reveal even if the voice never starts speaking.
  useEffect(() => {
    if (results.length === 0) return;
    const key = `${query}|${results.map((r) => r.id).join(",")}`;
    if (startedKeyRef.current === key) return;
    startedKeyRef.current = key;
    revealedRef.current = false;

    void start({ query, resultsSummary: buildResultsSummary(results) });

    const fallback = setTimeout(reveal, REVEAL_FALLBACK_MS);
    return () => clearTimeout(fallback);
  }, [query, results, start]);

  // Reveal the moment the assistant starts speaking.
  useEffect(() => {
    if (isAssistantSpeaking) reveal();
  }, [isAssistantSpeaking]);

  // Reveal immediately if the voice call fails.
  useEffect(() => {
    if (callStatus === "error") reveal();
  }, [callStatus]);

  return null;
}
