import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "./Button.js";
import { Input } from "./Input.js";
import { StatusBadge } from "./StatusBadge.js";

describe("CrewCommand UI foundation", () => {
  it("renders loading state with accessible busy semantics", () => {
    const html = renderToStaticMarkup(<Button loading>Save Changes</Button>);
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("disabled");
    expect(html).toContain("Saving");
  });

  it("renders input label, invalid semantics and error relationship", () => {
    const html = renderToStaticMarkup(
      <Input id="email" label="Email address" error="Enter a valid email address." />,
    );
    expect(html).toContain('for="email"');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('aria-describedby="email-description"');
    expect(html).toContain('role="alert"');
  });

  it("renders status with text in addition to color", () => {
    const html = renderToStaticMarkup(<StatusBadge status="delayed" />);
    expect(html).toContain("Delayed");
    expect(html).toContain('data-status="delayed"');
    expect(html).toContain("--cc-status-delayed-bg");
  });

  it("supports longer localized labels without a fixed-width button contract", () => {
    const html = renderToStaticMarkup(
      <Button size="large">Salvar alterações e continuar</Button>,
    );
    expect(html).toContain("Salvar alterações e continuar");
    expect(html).not.toMatch(/\bw-\d+/);
  });
});
