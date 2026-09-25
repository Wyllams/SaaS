export const POC11_SCHEME = "saaspoc11";

export type ParsedPocLink = {
  route: "/jobs/[jobId]";
  params: {
    jobId: string;
  };
};

export function parsePoc11DeepLink(value: string): ParsedPocLink {
  const url = new URL(value);

  if (url.protocol !== `${POC11_SCHEME}:`) {
    throw new Error("unexpected deep-link scheme");
  }

  const segments = [url.hostname, ...url.pathname.split("/").filter(Boolean)];

  if (segments[0] !== "jobs" || !segments[1]) {
    throw new Error("unsupported deep-link target");
  }

  return {
    route: "/jobs/[jobId]",
    params: {
      jobId: decodeURIComponent(segments[1]),
    },
  };
}
