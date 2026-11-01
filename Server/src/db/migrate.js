import "dotenv/config";
import pool from "./dbConnection.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(dirname, "migrations");

const runMigrations = async () => {
  const client = await pool.connect();
  try {
    // table that tracks which migration files have already run
    await client.query(`
      create table if not exists migrations(
        id serial primary key,
        name varchar(255) unique not null,
        run_at timestamp default now()
      )
    `);

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const { rows } = await client.query(
        "select 1 from migrations where name = $1",
        [file],
      );

      if (rows.length > 0) {
        console.log(`Skipping ${file} (already run)`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");

      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("INSERT INTO migrations (name) VALUES ($1)", [file]);
        await client.query("COMMIT");
        console.log(`Ran ${file}`);
      } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(`${file} failed: ${err.message}`);
      }
    }

    console.log("All migrations up to date");
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

runMigrations();
