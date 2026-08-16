"use client";

interface LoadingOverlayProps {
  show: boolean;
  title: string;
  description?: string;
}

export function LoadingOverlay({ show, title, description }: LoadingOverlayProps) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/10 px-5 backdrop-blur-[2px]"
      role="alertdialog"
      aria-modal="true"
      aria-live="assertive"
      aria-label={title}
    >
      <div className="w-full max-w-[20rem] rounded-2xl border border-border/80 bg-card/95 p-5 text-center shadow-2xl ring-1 ring-white/70">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <div className="relative h-11 w-11" aria-hidden="true">
            <div className="absolute inset-0 rounded-full border-[3px] border-brand-indigo/15" />
            <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-brand-indigo border-r-brand-indigo" />
            <div className="absolute inset-3 rounded-full bg-brand-indigo/10" />
          </div>
        </div>
        <div className="mt-4 space-y-1.5">
          <p className="text-base font-semibold leading-6 text-foreground">{title}</p>
          {description && <p className="mx-auto max-w-[15rem] text-sm leading-5 text-muted-foreground">{description}</p>}
        </div>
      </div>
    </div>
  );
}
