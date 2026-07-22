"use client";

import { useState } from "react";
import { Mic, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSubmit(value.trim());
    setValue("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 rounded-full text-muted-foreground"
        aria-label="Voice input"
        onClick={() => toast("Voice input isn't available in this prototype yet.")}
      >
        <Mic className="h-5 w-5" />
      </Button>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Describe what you need — subject, budget, location..."
        disabled={disabled}
        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      <Button
        type="submit"
        size="icon"
        disabled={disabled || !value.trim()}
        className="shrink-0 rounded-full bg-brand-indigo hover:bg-brand-indigo-dark"
        aria-label="Send"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
