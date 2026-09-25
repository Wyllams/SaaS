export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
}

export interface HealthResponse {
  status: "ok";
  service: string;
}
