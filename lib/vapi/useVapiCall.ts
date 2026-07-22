"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";

export type VapiCallStatus = "idle" | "connecting" | "active" | "ended" | "error";

export function useVapiCall() {
  const vapiRef = useRef<Vapi | null>(null);
  const [callStatus, setCallStatus] = useState<VapiCallStatus>("idle");
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function getVapi() {
    if (!vapiRef.current) {
      const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
      if (!publicKey) {
        throw new Error("Voice assistant is not configured yet.");
      }
      const vapi = new Vapi(publicKey);
      vapi.on("call-start", () => setCallStatus("active"));
      vapi.on("call-end", () => {
        setCallStatus("ended");
        setIsAssistantSpeaking(false);
      });
      vapi.on("speech-start", () => setIsAssistantSpeaking(true));
      vapi.on("speech-end", () => setIsAssistantSpeaking(false));
      vapi.on("error", (error) => {
        console.error("Vapi call error", error);
        setErrorMessage("The voice assistant ran into a problem. Please try again.");
        setCallStatus("error");
        setIsAssistantSpeaking(false);
      });
      vapiRef.current = vapi;
    }
    return vapiRef.current;
  }

  const start = useCallback(async (variableValues: Record<string, string>) => {
    setErrorMessage(null);
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
    if (!assistantId) {
      setErrorMessage("Voice assistant is not configured yet.");
      setCallStatus("error");
      return;
    }

    try {
      setCallStatus("connecting");
      console.log("[Vapi] starting call", { assistantId, variableValues });
      await getVapi().start(assistantId, { variableValues });
    } catch (error) {
      console.error("Could not start Vapi call", error);
      setErrorMessage("Couldn't start the voice assistant. Please try again.");
      setCallStatus("error");
    }
  }, []);

  const stop = useCallback(() => {
    vapiRef.current?.stop();
    setCallStatus("ended");
    setIsAssistantSpeaking(false);
  }, []);

  useEffect(() => {
    return () => {
      vapiRef.current?.stop();
    };
  }, []);

  return { callStatus, isAssistantSpeaking, errorMessage, start, stop };
}
