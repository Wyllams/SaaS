import { context, trace } from "@opentelemetry/api";
import { redactSensitive } from "./redact.js";

export type LogLevel = "info" | "error";

export interface StructuredLoggerOptions {
  service: string;
  sink?: (record: Record<string, unknown>) => void;
}

export function createStructuredLogger({
  service,
  sink = (record) => process.stdout.write(JSON.stringify(record) + "\n"),
}: StructuredLoggerOptions) {
  function write(
    level: LogLevel,
    message: string,
    fields: Record<string, unknown> = {},
  ) {
    const activeSpan = trace.getSpan(context.active());
    const spanContext = activeSpan?.spanContext();

    const record: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      level,
      service,
      message,
      ...(redactSensitive(fields) as Record<string, unknown>),
    };

    if (spanContext?.traceId) {
      record.trace_id = spanContext.traceId;
      record.span_id = spanContext.spanId;
    }

    sink(record);
    return record;
  }

  return {
    info(message: string, fields?: Record<string, unknown>) {
      return write("info", message, fields);
    },
    error(message: string, fields?: Record<string, unknown>) {
      return write("error", message, fields);
    },
  };
}
