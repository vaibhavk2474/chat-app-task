import "dotenv/config";
import { pool } from "../config/db.js";

async function seed(): Promise<void> {
    const { rows } = await pool.query<{ id: string; name: string }>(
        `INSERT INTO users (name)
     VALUES ('Rahul'), ('Priya'), ('Neha')
     RETURNING id, name`
    );
    console.table(rows);
}

seed()
    .catch((err: unknown) => {
        console.error("Seed failed:", err);
        process.exitCode = 1;
    })
    .finally(() => pool.end());