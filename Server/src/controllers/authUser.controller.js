import pool from "../db/dbConnection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

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
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // insert the new user
  const newUser = await pool.query(
    `INSERT INTO users (email, password_hash, full_name)
     VALUES ($1, $2, $3)
     RETURNING id, email, full_name, created_at`,
    [email, hashedPassword, full_name],
  );

  const createdUser = newUser.rows[0];

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

  if (existingUser.rows.length === 0) {
    throw new ApiError(404, "User does not exist");
  }

  const user = existingUser.rows[0];

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: { id: user.id, email: user.email, full_name: user.full_name },
        token,
      },
      "Login successful",
    ),
  );
});

export { registerUser, loginUser };
