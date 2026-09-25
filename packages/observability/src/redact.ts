const secretKeyPattern =
  /authorization|cookie|password|secret|token|api[_-]?key|dsn/i;

export function redactSensitive(value: unknown, key = ""): unknown {
  if (secretKeyPattern.test(key)) {
    return "[REDACTED]";
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitive(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(
        ([childKey, childValue]) => [
          childKey,
          redactSensitive(childValue, childKey),
        ],
      ),
    );
  }

  return value;
}
