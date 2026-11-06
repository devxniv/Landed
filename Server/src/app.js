import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { ApiError } from "./utils/apiError.js";
import { apiLimiter } from "./middlewares/rateLimiter.middleware.js";
import healthCheckRouter from "./routes/healthcheck.route.js";
import authRouter from "./routes/auth.routes.js";

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "10kb" })); // also caps oversized request bodies
app.use(cookieParser());

app.use("/v1", apiLimiter);
app.use("/v1/healthcheck", healthCheckRouter);
app.use("/v1/auth", authRouter);

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Landed API is running" });
});

// unknown routes -> JSON 404
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
});

// Express only treats a function as an error handler if it declares all four parameters(err, req, res, next)
app.use((err, req, res, next) => {
  if (!(err instanceof ApiError)) {
    const status = err.status || err.statusCode || 500;
    if (status === 500) console.error(err); // log the original error before replacing it
    err = new ApiError(
      status,
      status === 500 ? "Internal server error" : err.message,
    );
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
