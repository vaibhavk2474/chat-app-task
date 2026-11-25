import { AppError } from "../middleware/errors.js";
import { createUser, getUserById, getUserChats, userExists } from "../repositories/user.repository.js";
import type { UserChatRow } from "../types/chat.js";
import type { UserRecord } from "../types/user.js";

export async function getListUserChatService(userId: string): Promise<UserChatRow[]> {
    const exists = await userExists(userId);
    if (!exists) {
        throw new AppError(404, "User not found");
    }

    const chats = await getUserChats(userId);
    return chats;
}

export async function createUserService({ name }: { name: string }): Promise<{ userId: string; }> {
    // Implementation for creating or updating a user
    const user = await createUser(name);
    if (!user) {
        throw new AppError(404, "User not found");
    }
    return { userId: user.id };
}

export async function getUserService({ userId }: { userId: string }): Promise<{ user: UserRecord }> {
    // Implementation for creating or updating a user
    const user = await getUserById(userId);
    if (!user) {
        throw new AppError(404, "User not found");
    }
    return { user };
}


