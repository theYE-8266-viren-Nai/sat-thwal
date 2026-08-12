import type { LucideIcon } from "lucide-react";

interface DetailInfoSectionProps {
  icon: LucideIcon;
  title: string;
  lines: string[];
}

export function DetailInfoSection({ icon: Icon, title, lines }: DetailInfoSectionProps) {
  return (
    <div className="flex gap-3 border-b border-border py-3 last:border-none">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
        <Icon className="h-4 w-4 text-brand-indigo" />
      </div>
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {lines.map((line, i) => (
          <p key={i} className="text-sm text-muted-foreground">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
