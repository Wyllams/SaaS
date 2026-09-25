import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const expected = new Map([
  ["apps/web", "@saas/web"],
  ["apps/mobile", "@saas/mobile"],
  ["packages/api-client", "@saas/api-client"],
  ["packages/config", "@saas/config"],
  ["packages/db", "@saas/db"],
  ["packages/design-tokens", "@saas/design-tokens"],
  ["packages/domain-types", "@saas/domain-types"],
  ["packages/observability", "@saas/observability"],
  ["packages/ui-web", "@saas/ui-web"],
  ["packages/validation", "@saas/validation"],
]);

const rootPackage = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
if (rootPackage.name !== "saas-platform") throw new Error("root package name must remain brand-neutral");
if (rootPackage.packageManager !== "pnpm@12.6.0") throw new Error("pnpm must be pinned to 12.6.0");
if (rootPackage.devDependencies?.turbo !== "2.11.4") throw new Error("Turborepo must be pinned to 2.11.4");

for (const [directory, packageName] of expected) {
  await access(resolve(root, directory, "package.json"));
  const pkg = JSON.parse(await readFile(resolve(root, directory, "package.json"), "utf8"));
  if (pkg.name !== packageName) throw new Error(`${directory}: expected ${packageName}, got ${pkg.name}`);
  if (!pkg.private) throw new Error(`${packageName} must remain private`);
}

await access(resolve(root, "supabase/functions/identity-me/index.ts"));
await access(resolve(root, "supabase/config.toml"));
await access(resolve(root, "supabase/migrations/20260925201500_enable_supabase_async_infrastructure.sql"));

console.log(`Foundation structure verified: ${expected.size} workspaces + Supabase backend runtime.`);
