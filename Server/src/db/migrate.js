import pool from "./dbConnection.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(dirname, "migrations");
const runMigrations = async () => {
  try {
    //table that tracks which migration files have already run
    await pool.query(`
    create table if not exists migrations(
    id serial primary key,
    name varchar(255) unique not null,
    run_at timestamp default now()
    )
    `);

    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
      const { rows } = await pool.query(
        `select 1 from migrations where name = $1`,
        [file],
      );

      if (rows.length > 0) {
        console.log(`Skipping ${file} (already run)`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
      await pool.query(sql);
      await pool.query("INSERT INTO migrations (name) VALUES ($1)", [file]);
      console.log(`Ran ${file}`);
    }

    console.log("All migrations up to date");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

runMigrations();
