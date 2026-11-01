import crypto from "crypto";
import jwt from "jsonwebtoken";
import pool from "../db/dbConnection.js";

const REFRESH_DAYS = 7;

export const signAccessToken = (user) =>
  jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    subject: String(user.id),
    expiresIn: "15m",
  });

const hash = (token) => crypto.createHash("sha256").update(token).digest("hex");

export const issueRefreshToken = async (userId) => {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);

  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, hash(token), expiresAt],
  );

  return token;
};

export const hashToken = hash;

export const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict", // use "none" (with secure: true) if your frontend is on a different site
  path: "/v1/auth",
  maxAge: REFRESH_DAYS * 24 * 60 * 60 * 1000,
};
