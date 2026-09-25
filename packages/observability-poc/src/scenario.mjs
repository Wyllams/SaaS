import {
  context,
  propagation,
  SpanKind,
  SpanStatusCode,
} from "@opentelemetry/api";
import { createStructuredLogger } from "./structured-log.mjs";

export async function runEndToEndScenario(runtime) {
  const logs = [];
  const apiLogger = createStructuredLogger({
    service: "api",
    sink: (record) => logs.push(record),
  });
  const workerLogger = createStructuredLogger({
    service: "worker",
    sink: (record) => logs.push(record),
  });

  const carrier = {};

  await runtime.tracer.startActiveSpan(
    "api.request",
    {
      kind: SpanKind.SERVER,
      attributes: {
        "http.request.method": "POST",
        "app.operation": "poc-observability",
      },
    },
    async (requestSpan) => {
      apiLogger.info("request.accepted", {
        request_id: "req-poc-12",
        authorization: "Bearer should-never-reach-logs",
      });

      await runtime.tracer.startActiveSpan(
        "queue.publish",
        {
          kind: SpanKind.PRODUCER,
          attributes: {
            "messaging.system": "queue",
            "messaging.operation.name": "publish",
          },
        },
        async (publishSpan) => {
          propagation.inject(context.active(), carrier);
          apiLogger.info("job.enqueued", {
            job_id: "job-poc-12",
          });
          publishSpan.setStatus({ code: SpanStatusCode.OK });
          publishSpan.end();
        },
      );

      const workerContext = propagation.extract(context.active(), carrier);

      await context.with(workerContext, async () => {
        await runtime.tracer.startActiveSpan(
          "worker.job",
          {
            kind: SpanKind.CONSUMER,
            attributes: {
              "messaging.system": "queue",
              "messaging.operation.name": "process",
              "job.id": "job-poc-12",
            },
          },
          async (workerSpan) => {
            workerLogger.info("job.started", {
              job_id: "job-poc-12",
            });

            await runtime.tracer.startActiveSpan(
              "provider.call",
              {
                kind: SpanKind.CLIENT,
                attributes: {
                  "server.address": "provider.example.test",
                },
              },
              async (providerSpan) => {
                try {
                  throw new Error("controlled provider failure");
                } catch (error) {
                  providerSpan.recordException(error);
                  providerSpan.setStatus({
                    code: SpanStatusCode.ERROR,
                    message: "controlled provider failure",
                  });

                  workerLogger.error("provider.failed", {
                    job_id: "job-poc-12",
                    password: "should-never-reach-logs",
                    nested: {
                      api_token: "also-secret",
                    },
                  });
                } finally {
                  providerSpan.end();
                }
              },
            );

            workerSpan.setStatus({ code: SpanStatusCode.OK });
            workerSpan.end();
          },
        );
      });

      requestSpan.setStatus({ code: SpanStatusCode.OK });
      requestSpan.end();
    },
  );

  await runtime.flush();

  return {
    logs,
    carrier,
    spans: runtime.exporter.getFinishedSpans(),
  };
}
