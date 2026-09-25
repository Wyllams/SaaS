import { Button } from "@saas/ui-web";

export default function FoundationPage() {
  return (
    <main className="min-h-screen bg-page p-6 text-foreground">
      <section className="mx-auto grid max-w-3xl gap-5 rounded-[var(--radius-surface)] border border-border bg-surface p-6">
        <div className="grid gap-2">
          <p className="text-sm text-muted-foreground">Epic 0 · Foundation</p>
          <h1 className="text-3xl font-semibold">Web foundation is ready for validation.</h1>
        </div>
        <p className="max-w-2xl text-muted-foreground">
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
