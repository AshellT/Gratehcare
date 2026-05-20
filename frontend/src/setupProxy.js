const { createProxyMiddleware } = require("http-proxy-middleware");

/**
 * Dev-only: forward /api/* to the NestJS backend so relative API URLs
 * (e.g. SSE /api/v1/notifications/stream) work on the CRA dev server port.
 */
module.exports = function setupProxy(app) {
  const raw =
    process.env.REACT_APP_API_URL?.replace(/\/api\/v1\/?$/, "") ||
    "http://localhost:4000";

  app.use(
    "/api",
    createProxyMiddleware({
      target: raw,
      changeOrigin: true,
    }),
  );
};
