import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/apiError.js";

const handler = (req, res, next) => {
  next(new ApiError(429, "Too many requests, please try again later"));
};

// general limiter for the whole API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

// strict limiter for login and register
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});
