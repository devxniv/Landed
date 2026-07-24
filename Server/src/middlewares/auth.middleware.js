import jwt from "jsonwebtoken";
import pool from "../db/dbConnection.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized request");
  }

  const token = authHeader.split(" ")[1];

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }

  const result = await pool.query(
    "SELECT id, email, full_name FROM users WHERE id = $1",
    [decodedToken.id],
  );

  if (result.rows.length === 0) {
    throw new ApiError(401, "User no longer exists");
  }

  req.user = result.rows[0];
  next();
});

export { verifyJWT };
