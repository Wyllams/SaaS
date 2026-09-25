import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const tracked = execFileSync("git", ["ls-files", "-z"], {
  encoding: "utf8",
})
  .split("\0")
  .filter(Boolean);

const forbiddenEnvFiles = tracked.filter(
  (path) =>
    /(^|\/)\.env(?:\.|$)/.test(path) &&
    !path.endsWith(".env.example"),
);

if (forbiddenEnvFiles.length > 0) {
  throw new Error(
    `Tracked environment files are forbidden: ${forbiddenEnvFiles.join(", ")}`,
  );
}

const patterns = [
  { name: "Stripe secret", regex: /sk_(?:live|test)_[A-Za-z0-9]{16,}/g },
  { name: "Stripe webhook secret", regex: /whsec_[A-Za-z0-9]{16,}/g },
  {
    name: "private key",
    regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  },
];

const scanTargets = tracked.filter(
  (path) =>
    /^(apps|packages|scripts|\.github)\//.test(path) ||
    path === "package.json" ||
    path === "pnpm-workspace.yaml",
);

const findings = [];

for (const path of scanTargets) {
  let content;
  try {
    content = readFileSync(path, "utf8");
  } catch {
    continue;
  }

  for (const { name, regex } of patterns) {
    regex.lastIndex = 0;
    if (regex.test(content)) {
      findings.push(`${name}: ${path}`);
    }
  }
}

if (findings.length > 0) {
  throw new Error(`Potential committed secrets detected:\n${findings.join("\n")}`);
}

console.log(
  `Secret baseline verified: ${scanTargets.length} tracked implementation files scanned.`,
);
