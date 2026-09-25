import { InteractionProbe } from "../components/interaction-probe";

export default function HomePage() {
  const renderedAt = new Date().toISOString();

  return (
    <main className="min-h-screen bg-page p-6 text-foreground">
      <section className="mx-auto grid max-w-3xl gap-5 rounded-2xl border border-border bg-panel p-6">
        <div>
          <p className="text-sm text-muted-foreground">Framework validation</p>
          <h1 className="text-3xl font-semibold">Next.js App Router</h1>
        </div>
        <p className="text-muted-foreground">
          This route is rendered as a Server Component by default.
        </p>
        <code className="text-xs text-muted-foreground">{renderedAt}</code>
        <InteractionProbe />
      </section>
    </main>
  );
}
