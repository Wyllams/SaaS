import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parsePoc11DeepLink, POC11_SCHEME } from "../src/deep-link.ts";
import { buildUploadPlan } from "../src/upload-plan.ts";

test("deep link maps to the expected file-based route", () => {
  const parsed = parsePoc11DeepLink(`${POC11_SCHEME}://jobs/job-123`);

  assert.deepEqual(parsed, {
    route: "/jobs/[jobId]",
    params: { jobId: "job-123" },
  });
});

test("deep link rejects an unexpected scheme", () => {
  assert.throws(
    () => parsePoc11DeepLink("https://example.test/jobs/job-123"),
    /unexpected deep-link scheme/,
  );
});

test("upload contract requires HTTPS and preserves the captured file URI", () => {
  assert.deepEqual(
    buildUploadPlan({
      uri: "file:///cache/photo.jpg",
      endpoint: "https://upload.example.test/media",
    }),
    {
      uri: "file:///cache/photo.jpg",
      endpoint: "https://upload.example.test/media",
      method: "POST",
    },
  );

  assert.throws(
    () =>
      buildUploadPlan({
        uri: "file:///cache/photo.jpg",
        endpoint: "http://upload.example.test/media",
      }),
    /must use HTTPS/,
  );
});

test("Expo config and routes preserve the POC contract", async () => {
  const config = JSON.parse(await readFile(new URL("../app.json", import.meta.url), "utf8"));
  const camera = await readFile(new URL("../app/camera.tsx", import.meta.url), "utf8");
  const deepLinkRoute = await readFile(
    new URL("../app/jobs/[jobId].tsx", import.meta.url),
    "utf8",
  );

  assert.equal(config.expo.scheme, POC11_SCHEME);
  assert.ok(config.expo.plugins.some((plugin) => plugin === "expo-router"));
  assert.match(camera, /CameraView/);
  assert.match(camera, /takePictureAsync/);
  assert.match(deepLinkRoute, /useLocalSearchParams/);
});
