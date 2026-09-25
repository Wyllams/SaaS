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

let contextManager: AsyncLocalStorageContextManager | undefined;

export function initializeTraceContext() {
  if (!contextManager) {
    contextManager = new AsyncLocalStorageContextManager();
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
  }

  return {
    shutdown() {
      contextManager?.disable();
      contextManager = undefined;
    },
  };
}

export function getTracer(service: string, version = "0.0.0") {
  return trace.getTracer(service, version);
}
