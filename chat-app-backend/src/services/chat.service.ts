import { AppError } from "../middleware/errors.js";
import { chatExists, createOrGetDirectChat, isChatMember } from "../repositories/chat.repository.js";
import { createMessage, findMessageCursor, listMessages } from "../repositories/message.repository.js";
import type { MessagePage } from "../repositories/message.repository.js";
import { countExistingUsers } from "../repositories/user.repository.js";
import type { CreateChatInput } from "../validators/chat.validator.js";
import type { GetMessagesInput, SendMessageInput } from "../validators/message.validator.js";

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

export async function getChatMessages(input: GetMessagesInput): Promise<MessagePage> {
    const { chatId } = input.params;
    const { limit, cursor } = input.query;

    if (!(await chatExists(chatId))) {
        throw new AppError(404, "Chat not found");
    }

    const cursorSnapshot = cursor
        ? await findMessageCursor(chatId, cursor)
        : undefined;

    if (cursor && !cursorSnapshot) {
        throw new AppError(400, "Cursor message was not found in this chat");
    }

    return listMessages(chatId, limit, cursorSnapshot ?? undefined);
}
