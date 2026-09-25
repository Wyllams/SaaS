import {
  context,
  propagation,
  trace,
} from "@opentelemetry/api";
import { AsyncLocalStorageContextManager } from "@opentelemetry/context-async-hooks";
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from "@opentelemetry/core";
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
  TracerProvider,
} from "@opentelemetry/sdk-trace";

export function createObservabilityRuntime() {
  const exporter = new InMemorySpanExporter();

  const provider = new TracerProvider({
    spanProcessors: [
      new SimpleSpanProcessor({
        exporter,
      }),
    ],
  });

  trace.setGlobalTracerProvider(provider);

  const contextManager = new AsyncLocalStorageContextManager();
  contextManager.enable();
  context.setGlobalContextManager(contextManager);

  propagation.setGlobalPropagator(
    new CompositePropagator({
      propagators: [
        new W3CTraceContextPropagator(),
        new W3CBaggagePropagator(),
      ],
    }),
  );

  return {
    exporter,
    provider,
    tracer: trace.getTracer("observability-poc", "0.0.0"),
    async flush() {
      await provider.forceFlush();
    },
    async shutdown() {
      await provider.shutdown();
      contextManager.disable();
    },
  };
}
