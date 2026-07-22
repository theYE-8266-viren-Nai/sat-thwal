import { AIAvatar } from "@/components/smartmatch/AIAvatar";

export function LoadingIndicator() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <AIAvatar className="h-9 w-9 shrink-0" />
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 animate-bounce rounded-full bg-brand-indigo [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-brand-indigo [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-brand-indigo" />
        <span className="ml-2 text-sm text-muted-foreground">
          SmartMatch AI is finding your matches...
        </span>
      </div>
    </div>
  );
}
