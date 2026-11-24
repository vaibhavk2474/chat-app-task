import "dotenv/config";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { pool } from "../config/db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate(): Promise<void> {
    const sql = await readFile(join(__dirname, "schema.sql"), "utf-8");
    await pool.query(sql);
    console.log("Migration done: tables are ready");
}

migrate()
    .catch((err: unknown) => {
        console.error("Migration failed:", err);
        process.exitCode = 1;
    })
    .finally(() => pool.end());