import app from "./app.js";
import pool from "./db/dbConnection.js";

const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`App listening at port http://localhost:${PORT}`);
});
