import "dotenv/config";
import app from "./app.js";
import pool from "./db/dbConnection.js";

const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

const startServer = async () => {
  try {
    // make sure the database is reachable before accepting requests
    await pool.query("SELECT 1");
    console.log("Database connected");

    app.listen(PORT, () => {
      console.log(`App listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
};

startServer();
