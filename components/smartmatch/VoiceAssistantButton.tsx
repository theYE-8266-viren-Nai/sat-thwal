"use client";

import { Mic, PhoneOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVapiCall } from "@/lib/vapi/useVapiCall";
import { buildResultsSummary } from "@/lib/smartmatch/voiceSummary";
import type { ServiceCardData } from "@/types/domain";

interface VoiceAssistantButtonProps {
  query: string;
  results: ServiceCardData[];
}

export function VoiceAssistantButton({ query, results }: VoiceAssistantButtonProps) {
  const { callStatus, isAssistantSpeaking, errorMessage, start, stop } = useVapiCall();

  function handleStart() {
    void start({ query, resultsSummary: buildResultsSummary(results) });
  }

  if (callStatus === "idle" || callStatus === "error") {
    return (
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          size="touch"
          className="w-fit rounded-xl border-brand-indigo/30 text-brand-indigo hover:bg-brand-indigo/10"
          onClick={handleStart}
        >
          <Mic className="h-4 w-4" />
          Listen to results
        </Button>
        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-brand-indigo/20 bg-brand-indigo/5 p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-indigo text-white">
        <Volume2 className={isAssistantSpeaking ? "h-4 w-4 animate-pulse" : "h-4 w-4"} />
      </span>
      <p className="flex-1 text-sm text-foreground">
        {callStatus === "connecting" && "Connecting to the voice assistant..."}
        {callStatus === "active" && (isAssistantSpeaking ? "Speaking..." : "Listening...")}
        {callStatus === "ended" && "Call ended."}
      </p>
      {(callStatus === "connecting" || callStatus === "active") && (
        <Button variant="destructive" size="sm" className="rounded-xl" onClick={stop}>
          <PhoneOff className="h-4 w-4" />
          Stop
        </Button>
      )}
    </div>
  );
}
