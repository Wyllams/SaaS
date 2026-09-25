"use client";

import { useState } from "react";

export function InteractionProbe() {
  const [count, setCount] = useState(0);

  return (
    <button
      type="button"
      className="rounded-[var(--radius-control)] bg-primary px-4 py-2 text-primary-foreground"
      onClick={() => setCount((value) => value + 1)}
    >
      Client interaction: {count}
    </button>
  );
}
