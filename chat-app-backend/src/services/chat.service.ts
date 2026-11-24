import { AppError } from "../middleware/errors.js";
import { createOrGetDirectChat } from "../repositories/chat.repository.js";
import { countExistingUsers } from "../repositories/user.repository.js";
import type { CreateChatInput } from "../validators/chat.validator.js";

export async function createOrGetChat(input: CreateChatInput): Promise<string> {
    const existing = await countExistingUsers([input.userAId, input.userBId]);
    if (existing !== 2) {
        throw new AppError(404, "One or both users do not exist");
    }

    return createOrGetDirectChat(input.userAId, input.userBId);
}