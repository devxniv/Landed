import express from "express";
import cors from "cors";
import helmet from "helmet";
import { ApiError } from "./utils/apiError.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", 1);
app.use(helmet());
app.use(express.json({ limit: "10kb" })); // also caps oversized request bodies

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

import healthCheckRouter from "./routes/healthcheck.route.js";
import authRouter from "./routes/auth.routes.js";

app.use("/v1/healthcheck", healthCheckRouter);
app.use("/v1/auth", authRouter);

// Express only treats a function as an error handler if it declares all four parameters(err, req, res, next)
app.use((err, req, res, next) => {
  if (!(err instanceof ApiError)) {
    // malformed JSON body etc.
    const status = err.status || err.statusCode || 500;
    err = new ApiError(
      status,
      status === 500 ? "Internal server error" : err.message,
    );
    if (status === 500) console.error(err);
  }
  return res.status(err.statusCode).json({
    statusCode: err.statusCode,
    success: false,
    message: err.message,
    errors: err.errors,
    data: null,
  });
});
export default app;
