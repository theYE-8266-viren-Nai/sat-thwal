const PROMPTS = [
  "Find a tutor for Data Structures",
  "Find a hostel under 150,000 MMK",
  "Find meals under 5,000 MMK",
  "Find transportation from Hledan to UIT",
];

export function SuggestedPrompts({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-muted-foreground">Try asking</h3>
      <div className="flex flex-wrap gap-2">
        {PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelect(prompt)}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:border-brand-indigo hover:text-brand-indigo"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
