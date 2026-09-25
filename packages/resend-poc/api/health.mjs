export default {
  async fetch() {
    return Response.json({
      ok: true,
      poc: 10,
      provider: "resend",
      purpose: "webhook-health",
    });
  },
};
