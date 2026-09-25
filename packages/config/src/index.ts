export const appEnvironments = [
  "development",
  "staging",
  "production",
] as const;

export type AppEnvironment = (typeof appEnvironments)[number];

export function parseAppEnvironment(
  value: string | undefined,
): AppEnvironment {
  const candidate = value ?? "development";

  if (appEnvironments.includes(candidate as AppEnvironment)) {
    return candidate as AppEnvironment;
  }

  throw new Error(`Unsupported APP_ENV: ${candidate}`);
}
