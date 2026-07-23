"use client";

import { useState } from "react";
import { Mic, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceInput } from "@/lib/smartmatch/useVoiceInput";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");

  const { isSupported, isListening, error, start, stop } = useVoiceInput({
    // Live-type the words into the input as they're recognized.
    onInterim: (transcript) => setValue(transcript),
    onResult: (transcript) => {
      // Show the final recognized text in the field, then fire the SmartMatch
      // query. Results only appear once the match API call also finishes.
      setValue(transcript);
      onSubmit(transcript);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSubmit(value.trim());
    setValue("");
  }

  function toggleListening() {
    if (isListening) {
      stop();
    } else {
      start();
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm"
      >
        {isSupported && (
          <Button
            type="button"
            variant="ghost"
            size="icon-touch"
            disabled={disabled}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
            aria-pressed={isListening}
            onClick={toggleListening}
            className={cn(
              "shrink-0 rounded-full text-muted-foreground",
              isListening && "bg-destructive/10 text-destructive hover:bg-destructive/20",
            )}
          >
            <Mic className={cn("h-5 w-5", isListening && "animate-pulse")} />
          </Button>
        )}
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={
            isListening ? "Listening…" : "Describe what you need — subject, budget, location..."
          }
          disabled={disabled}
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <Button
          type="submit"
          size="icon-touch"
          disabled={disabled || !value.trim()}
          className="shrink-0 rounded-full bg-brand-indigo hover:bg-brand-indigo-dark"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
      {isListening && (
        <p className="px-2 text-xs text-destructive">Listening… speak your request.</p>
      )}
      {error && <p className="px-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
