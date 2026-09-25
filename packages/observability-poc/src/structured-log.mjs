import { context, trace } from "@opentelemetry/api";

const SECRET_KEY_PATTERN =
  /authorization|cookie|password|secret|token|api[_-]?key|dsn/i;

function redact(value, key = "") {
  if (SECRET_KEY_PATTERN.test(key)) {
    return "[REDACTED]";
  }

  if (Array.isArray(value)) {
    return value.map((item) => redact(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([childKey, childValue]) => [
        childKey,
        redact(childValue, childKey),
      ]),
    );
  }

  return value;
}

export function createStructuredLogger({ service, sink }) {
  if (!service) throw new Error("service is required");
  if (typeof sink !== "function") throw new Error("sink must be a function");

  function write(level, message, fields = {}) {
    const activeSpan = trace.getSpan(context.active());
    const spanContext = activeSpan?.spanContext();

    const record = {
      timestamp: new Date().toISOString(),
      level,
      service,
      message,
      ...redact(fields),
    };

    if (spanContext?.traceId) {
      record.trace_id = spanContext.traceId;
      record.span_id = spanContext.spanId;
    }

    sink(record);
    return record;
  }

  return {
    info(message, fields) {
      return write("info", message, fields);
    },
    error(message, fields) {
      return write("error", message, fields);
    },
  };
}
