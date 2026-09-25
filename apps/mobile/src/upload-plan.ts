export type UploadPlanInput = {
  uri: string;
  endpoint: string;
};

export type UploadPlan = {
  uri: string;
  endpoint: string;
  method: "POST";
};

export function buildUploadPlan(input: UploadPlanInput): UploadPlan {
  const uri = input.uri.trim();
  const endpoint = input.endpoint.trim();

  if (!uri) {
    throw new Error("file uri is required");
  }

  if (!endpoint.startsWith("https://")) {
    throw new Error("POC upload endpoint must use HTTPS");
  }

  return {
    uri,
    endpoint,
    method: "POST",
  };
}
