import pool from "../db/dbConnection.js";
import bcrypt from "bcrypt";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {
  signAccessToken,
  issueRefreshToken,
  hashToken,
  refreshCookieOptions,
} from "../utils/tokens.js";

const DUMMY_HASH = await bcrypt.hash("dummy-password", 12);

const registerUser = asyncHandler(async (req, res) => {
  const { email, password, full_name } = req.body;

  // check if a user with this email already exists
  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email],
  );

  if (existingUser.rows.length > 0) {
    throw new ApiError(409, "User with this email already exists");
  }

  // hash the password before storing
  const hashedPassword = await bcrypt.hash(password, 12);

  let createdUser;
  // insert the new user
  try {
    const newUser = await pool.query(
      `INSERT INTO users (email, password_hash, full_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, full_name, created_at`,
      [email, hashedPassword, full_name],
    );
    createdUser = newUser.rows[0];
  } catch (err) {
    // 23505 = Postgres unique_violation (two requests raced past the check above)
    if (err.code === "23505") {
      throw new ApiError(409, "User with this email already exists");
    }
    throw err;
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: createdUser },
        "User registered successfully",
      ),
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email],
  );

  const user = existingUser.rows[0];

  const isPasswordValid =
    user &&
    (await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH));

  if (!user || !isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const accessToken = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user.id);

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, refreshCookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: { id: user.id, email: user.email, full_name: user.full_name },
          accessToken,
        },
        "Login successful",
      ),
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incoming = req.cookies?.refreshToken;
  if (!incoming) throw new ApiError(401, "Refresh token missing");

  const tokenHash = hashToken(incoming);

  // atomically claim the token: only one concurrent request can succeed
  const { rows } = await pool.query(
    `UPDATE refresh_tokens
     SET revoked_at = NOW()
     WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()
     RETURNING user_id`,
    [tokenHash],
  );

  if (rows.length === 0) {
    // claim failed: unknown, expired, or already used
    const { rows: old } = await pool.query(
      "SELECT user_id, revoked_at FROM refresh_tokens WHERE token_hash = $1",
      [tokenHash],
    );

    if (old[0]?.revoked_at) {
      // a revoked token was presented again: probably stolen, kill all sessions
      await pool.query(
        "UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL",
        [old[0].user_id],
      );
      throw new ApiError(
        401,
        "Refresh token reuse detected, please log in again",
      );
    }
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const userResult = await pool.query(
    "SELECT id, email, full_name FROM users WHERE id = $1",
    [rows[0].user_id],
  );
  const user = userResult.rows[0];
  if (!user) throw new ApiError(401, "User no longer exists");

  const newRefreshToken = await issueRefreshToken(user.id);

  return res
    .status(200)
    .cookie("refreshToken", newRefreshToken, refreshCookieOptions)
    .json(
      new ApiResponse(
        200,
        { accessToken: signAccessToken(user) },
        "Token refreshed",
      ),
    );

  // This still doesn’t fully fix two parallel requests from the same browser, because the second one will still hit the reuse path. So on the frontend, keep one in-flight refresh promise that all failed requests wait on, instead of each calling /refresh themselves.
});

const logoutUser = asyncHandler(async (req, res) => {
  const incoming = req.cookies?.refreshToken;
  if (incoming) {
    await pool.query(
      "UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL",
      [hashToken(incoming)],
    );
  }
  const { maxAge, ...clearOptions } = refreshCookieOptions;
  return res
    .status(200)
    .clearCookie("refreshToken", clearOptions)
    .json(new ApiResponse(200, null, "Logged out"));
});

export { registerUser, loginUser, refreshAccessToken, logoutUser };
