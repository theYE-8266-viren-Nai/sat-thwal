export function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 px-5 md:px-8">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-card px-4 shadow-sm">
        {children}
      </div>
    </section>
  );
}

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
