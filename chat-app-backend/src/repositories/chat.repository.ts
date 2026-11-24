import { pool } from "../config/db.js";

export function buildDirectKey(userAId: string, userBId: string): string {
    return [userAId, userBId].sort().join(":");
}

export async function createOrGetDirectChat(
    userAId: string,
    userBId: string
): Promise<string> {
    const directKey = buildDirectKey(userAId, userBId);
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Try to create the chat. If direct_key already exists, do nothing.
        const inserted = await client.query<{ id: string }>(
            `INSERT INTO chats (type, direct_key)
       VALUES ('direct', $1)
       ON CONFLICT (direct_key) DO NOTHING
       RETURNING id`,
            [directKey]
        );

        let chatId: string;
        const newChat = inserted.rows[0];

        if (newChat) {
            // New chat: add both members
            chatId = newChat.id;
            await client.query(
                `INSERT INTO chat_members (chat_id, user_id)
         VALUES ($1, $2), ($1, $3)`,
                [chatId, userAId, userBId]
            );
        } else {
            // Chat already existed: fetch its id
            const existing = await client.query<{ id: string }>(
                `SELECT id FROM chats WHERE direct_key = $1`,
                [directKey]
            );
            const row = existing.rows[0];
            if (!row) {
                throw new Error("Chat not found after conflict");
            }
            chatId = row.id;
        }

        await client.query("COMMIT");
        return chatId;
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}