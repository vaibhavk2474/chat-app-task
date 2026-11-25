import { pool } from "../config/db.js";
import type { UserChatRow } from "../types/chat.js";
import type { UserRecord } from "../types/user.js";

export async function countExistingUsers(userIds: string[]): Promise<number> {
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM users WHERE id = ANY($1::uuid[])`,
    [userIds]
  );
  return Number(result.rows[0]?.count ?? 0);
}

export async function userExists(userId: string): Promise<boolean> {
  const result = await pool.query<{ userExists: boolean }>(
    `SELECT EXISTS (SELECT 1 FROM users WHERE id = $1) AS "userExists"`,
    [userId]
  );
  return result.rows[0]?.userExists ?? false;
}

export async function getUserChats(userId: string): Promise<UserChatRow[]> {
  const query = `
    SELECT
      c.id,
      c.type,
      c.created_at AS "createdAt",
      json_agg(
        json_build_object(
          'id', u.id,
          'name', u.name
        )
        ORDER BY u.name ASC
      ) AS "members"
    FROM chat_members cm_user
    JOIN chats c ON c.id = cm_user.chat_id
    JOIN chat_members cm_all ON cm_all.chat_id = c.id
    JOIN users u ON u.id = cm_all.user_id
    WHERE cm_user.user_id = $1
    GROUP BY c.id, c.type, c.created_at
    ORDER BY c.created_at DESC;
  `;

  const { rows } = await pool.query<UserChatRow>(query, [userId]);

  return rows
}


export async function createUser(name: string): Promise<UserRecord> {
  const result = await pool.query<UserRecord>(
    `INSERT INTO users (name)
     VALUES ($1)
     RETURNING id, name, created_at AS "createdAt"`,
    [name]
  );

  const user = result.rows[0];
  if (!user) {
    throw new Error("User could not be created");
  }

  return user;
}

export async function getUserById(userId: string): Promise<UserRecord | null> {
  const result = await pool.query<UserRecord>(
    `SELECT id, name, created_at AS "createdAt"
     FROM users
     WHERE id = $1`,
    [userId]
  );

  return result.rows[0] ?? null;
}