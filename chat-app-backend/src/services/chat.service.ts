import { AppError } from "../middleware/errors.js";
import { createOrGetDirectChat, isChatMember } from "../repositories/chat.repository.js";
import { createMessage } from "../repositories/message.repository.js";
import { countExistingUsers } from "../repositories/user.repository.js";
import type { CreateChatInput } from "../validators/chat.validator.js";
import type { SendMessageInput } from "../validators/message.validator.js";

export async function createOrGetChat(input: CreateChatInput): Promise<string> {
    const existing = await countExistingUsers([input.userAId, input.userBId]);
    if (existing !== 2) {
        throw new AppError(404, "One or both users do not exist");
    }

    return createOrGetDirectChat(input.userAId, input.userBId);
}

export async function sendChatMessage(input: SendMessageInput): Promise<string> {
    const { chatId } = input.params;
    const { senderId, text } = input.body;

    if (!(await isChatMember(chatId, senderId))) {
        throw new AppError(403, "Sender is not a member of this chat");
    }

    return createMessage(chatId, senderId, text);
}
