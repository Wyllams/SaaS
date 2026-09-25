import { Button } from "@saas/ui-web";

export default function FoundationPage() {
  return (
    <main className="min-h-screen bg-app-page p-6 text-app-foreground">
      <section className="mx-auto grid max-w-3xl gap-5 rounded-[var(--radius-surface)] border border-app-border bg-app-surface p-6">
        <div className="grid gap-2">
          <p className="text-sm text-app-muted">Epic 0 · Foundation</p>
          <h1 className="text-3xl font-semibold">Web foundation is ready for validation.</h1>
        </div>
        <p className="max-w-2xl text-app-muted">
          This is an infrastructure validation surface only. Product features start
          after the Epic 0 exit gate.
        </p>
        <div>
          <Button disabled>Feature work not started</Button>
        </div>
      </section>
    </main>
  );
}
