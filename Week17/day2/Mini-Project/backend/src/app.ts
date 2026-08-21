import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { config } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import routes from "./routes";

export function createApp(): express.Express {
  const app = express();

  // Render terminates TLS at its proxy and forwards over http. Without trusting the
  // proxy, Express thinks the connection is insecure and refuses to set `Secure`
  // cookies -- which would silently break the refresh-token cookie in production.
  if (config.isProduction) {
    app.set("trust proxy", 1);
  }

  app.use(
    cors({
      // A credentialed request cannot use "*", so the allowed origins are listed
      // explicitly via CORS_ORIGIN. Requests with no Origin header (curl, health
      // checks, server-to-server) are allowed through.
      origin(origin, callback) {
        if (!origin || config.corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error(`Origin ${origin} is not allowed by CORS.`));
      },
      // Required for the browser to send and accept the refresh-token cookie.
      credentials: true,
    }),
  );

  // Cap the body size: without a limit, a single large POST can exhaust memory.
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler); // must be last, and must keep its 4 parameters

  return app;
}
