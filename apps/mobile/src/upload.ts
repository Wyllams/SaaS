import { fetch } from "expo/fetch";
import { File } from "expo-file-system";
import { buildUploadPlan } from "./upload-plan";

export async function uploadCapturedMedia(input: {
  uri: string;
  endpoint: string;
}): Promise<{ status: number }> {
  const plan = buildUploadPlan(input);
  const file = new File(plan.uri);

  const response = await fetch(plan.endpoint, {
    method: plan.method,
    body: file,
  });

  if (!response.ok) {
    throw new Error(`upload failed with HTTP ${response.status}`);
  }

  return {
    status: response.status,
  };
}
