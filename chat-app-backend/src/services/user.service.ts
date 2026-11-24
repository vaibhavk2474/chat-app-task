import { AppError } from "../middleware/errors.js";
import { getUserChats, userExists } from "../repositories/user.repository.js";
import type { UserChatRow } from "../types/chat.js";

export async function getListUserChatService(userId: string): Promise<UserChatRow[]> {
    const exists = await userExists(userId);
    if (!exists) {
        throw new AppError(404, "User not found");
    }

    const chats = await getUserChats(userId);
    return chats;
}
