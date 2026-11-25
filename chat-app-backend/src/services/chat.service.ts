import { AppError } from "../middleware/errors.js";
import { chatExists, createOrGetDirectChat, isChatMember } from "../repositories/chat.repository.js";
import { createMessage, deleteMessage, findMessageCursor, isMessageSender, listMessages, markMessageRead, updateLastSeen, updateMessage } from "../repositories/message.repository.js";
import type { LastSeenUpdate, MessagePage } from "../repositories/message.repository.js";
import { countExistingUsers } from "../repositories/user.repository.js";
import type { CreateChatInput } from "../validators/chat.validator.js";
import type { DeleteMessageInput, EditMessageInput, GetMessagesInput, MarkMessageReadInput, SendMessageInput, UpdateLastSeenInput } from "../validators/message.validator.js";

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

export async function markChatMessageRead(input: MarkMessageReadInput): Promise<void> {
    const { chatId, messageId } = input.params;
    const { userId } = input.body;

    if (!(await isChatMember(chatId, userId))) {
        throw new AppError(403, "User is not a member of this chat");
    }

    const result = await markMessageRead(chatId, messageId, userId);
    if (result === "message-not-found") {
        throw new AppError(404, "Message not found");
    }
    if (result === "own-message") {
        throw new AppError(400, "Users cannot mark their own messages as read");
    }
}

export async function updateChatLastSeen(input: UpdateLastSeenInput): Promise<LastSeenUpdate> {
    const { chatId } = input.params;
    const { userId, messageId } = input.body;

    if (!(await isChatMember(chatId, userId))) {
        throw new AppError(403, "User is not a member of this chat");
    }

    const result = await updateLastSeen(chatId, userId, messageId);
    if (result === "message-not-found") {
        throw new AppError(404, "Message not found");
    }
    if (result === "invalid-message-timestamp") {
        throw new AppError(500, "Message has no valid creation timestamp");
    }

    return result;
}

export async function editChatMessage(input: EditMessageInput): Promise<string> {
    const { chatId, messageId } = input.params;
    const { senderId, text } = input.body;

    if (!(await isChatMember(chatId, senderId))) {
        throw new AppError(403, "This user is not a member of this chat");
    }
    if (!(await isMessageSender(chatId, messageId, senderId))) {
        throw new AppError(403, "This user is not the sender of this message or message does not exist in this chat");
    }

    return updateMessage(chatId, messageId, senderId, text);
}

export async function deleteChatMessage(input: DeleteMessageInput): Promise<string> {
    const { chatId, messageId } = input.params;
    const { senderId } = input.body;

    if (!(await isChatMember(chatId, senderId))) {
        throw new AppError(403, "This user is not a member of this chat");
    }

    return deleteMessage(chatId, messageId, senderId);
}