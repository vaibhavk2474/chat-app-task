import { pool } from "../config/db.js";

export async function countExistingUsers(userIds: string[]): Promise<number> {
    const result = await pool.query<{ count: string }>(
        `SELECT COUNT(*) AS count FROM users WHERE id = ANY($1::uuid[])`,
        [userIds]
    );
    return Number(result.rows[0]?.count ?? 0);
}