import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { db } from "../config/firebase.js";
import { AppError } from "../middleware/errors.js";

export interface ChatMessage {
    id: string;
    senderId: string;
    text: string;
    createdAt: string | null;
}

export interface MessagePage {
    messages: ChatMessage[];
    nextCursor: string | null;
}

export type MarkMessageReadResult = "message-not-found" | "own-message" | "marked";

export interface LastSeenUpdate {
    lastSeenMessageId: string;
    updated: boolean;
}

export type UpdateLastSeenResult = LastSeenUpdate | "message-not-found" | "invalid-message-timestamp";

export async function createMessage(
    chatId: string,
    senderId: string,
    text: string
): Promise<string> {
    const messageRef = db.collection("chats").doc(chatId).collection("messages").doc();

    await messageRef.set({
        senderId,
        text,
        createdAt: FieldValue.serverTimestamp(),
    });

    return messageRef.id;
}

export async function findMessageCursor(
    chatId: string,
    cursor: string
): Promise<QueryDocumentSnapshot | null> {
    const snapshot = await db.collection("chats").doc(chatId)
        .collection("messages").doc(cursor).get();

    return snapshot.exists ? snapshot as QueryDocumentSnapshot : null;
}

export async function listMessages(
    chatId: string,
    limit: number,
    cursorSnapshot?: QueryDocumentSnapshot
): Promise<MessagePage> {
    const messagesRef = db.collection("chats").doc(chatId).collection("messages");
    let query = messagesRef
        .orderBy("createdAt", "desc");

    if (cursorSnapshot) {
        query = query.startAfter(cursorSnapshot);
    }

    const snapshot = await query.limit(limit + 1).get();
    const hasMore = snapshot.docs.length > limit;
    const pageDocs = snapshot.docs.slice(0, limit);
    const nextCursor = hasMore ? pageDocs[pageDocs.length - 1]?.id ?? null : null;

    const messages = pageDocs.reverse().map((document): ChatMessage => {
        const data = document.data();
        const createdAt = data.createdAt;

        return {
            id: document.id,
            senderId: data.senderId as string,
            text: data.text as string,
            createdAt: createdAt && typeof createdAt.toDate === "function"
                ? createdAt.toDate().toISOString()
                : null,
        };
    });

    return { messages, nextCursor };
}

export async function markMessageRead(
    chatId: string,
    messageId: string,
    userId: string
): Promise<MarkMessageReadResult> {
    const messageRef = db.collection("chats").doc(chatId)
        .collection("messages").doc(messageId);
    const receiptRef = messageRef.collection("receipts").doc(userId);

    return db.runTransaction(async (transaction): Promise<MarkMessageReadResult> => {
        const messageSnapshot = await transaction.get(messageRef);
        if (!messageSnapshot.exists) {
            return "message-not-found";
        }

        if (messageSnapshot.get("senderId") === userId) {
            return "own-message";
        }

        const receiptSnapshot = await transaction.get(receiptRef);
        if (!receiptSnapshot.exists) {
            transaction.create(receiptRef, {
                userId,
                readAt: FieldValue.serverTimestamp(),
            });
        }

        return "marked";
    });
}

export async function updateLastSeen(
    chatId: string,
    userId: string,
    messageId: string
): Promise<UpdateLastSeenResult> {
    const chatRef = db.collection("chats").doc(chatId);
    const messageRef = chatRef.collection("messages").doc(messageId);
    const memberRef = chatRef.collection("members").doc(userId);

    return db.runTransaction(async (transaction): Promise<UpdateLastSeenResult> => {
        const messageSnapshot = await transaction.get(messageRef);
        if (!messageSnapshot.exists) {
            return "message-not-found";
        }

        const messageCreatedAt = messageSnapshot.get("createdAt");
        if (!(messageCreatedAt instanceof Timestamp)) {
            return "invalid-message-timestamp";
        }

        const memberSnapshot = await transaction.get(memberRef);
        const currentMessageId = memberSnapshot.get("lastSeenMessageId");
        const currentMessageCreatedAt = memberSnapshot.get("lastSeenMessageCreatedAt");

        if (
            typeof currentMessageId === "string" &&
            currentMessageCreatedAt instanceof Timestamp
        ) {
            const sameTimestamp =
                messageCreatedAt.seconds === currentMessageCreatedAt.seconds &&
                messageCreatedAt.nanoseconds === currentMessageCreatedAt.nanoseconds;
            const earlierTimestamp =
                messageCreatedAt.seconds < currentMessageCreatedAt.seconds ||
                (messageCreatedAt.seconds === currentMessageCreatedAt.seconds &&
                    messageCreatedAt.nanoseconds < currentMessageCreatedAt.nanoseconds);
            const sameTimeEarlierId = sameTimestamp && messageId <= currentMessageId;

            if (earlierTimestamp || sameTimeEarlierId) {
                return { lastSeenMessageId: currentMessageId, updated: false };
            }
        }

        transaction.set(memberRef, {
            lastSeenMessageId: messageId,
            lastSeenMessageCreatedAt: messageCreatedAt,
            updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        return { lastSeenMessageId: messageId, updated: true };
    });
}

export async function isMessageSender(
    chatId: string,
    messageId: string,
    userId: string
): Promise<boolean> {
    const message = await db
        .collection("chats")
        .doc(chatId)
        .collection("messages")
        .doc(messageId)
        .get();

    return message.exists && message.get("senderId") === userId;
}

export async function updateMessage(
    chatId: string,
    messageId: string,
    senderId: string,
    text: string
): Promise<string> {
    const messageRef = db.collection("chats").doc(chatId).collection("messages").doc(messageId);

    const snap = await messageRef.get()
    if (!snap.exists) {
        throw new AppError(404, "Message not found");
    }

    if (snap.get("senderId") !== senderId) {
        throw new AppError(403, "Unauthorized: you can only edit your own messages");
    }

    await messageRef.update({
        text,
        updatedAt: FieldValue.serverTimestamp(),
    });

    return messageRef.id;
}

export async function deleteMessage(
    chatId: string,
    messageId: string,
    senderId: string
): Promise<string> {
    const messageRef = db.collection("chats").doc(chatId).collection("messages").doc(messageId);

    const snap = await messageRef.get();
    if (!snap.exists) {
        throw new AppError(404, "Message not found");
    }

    if (snap.get("senderId") !== senderId) {
        throw new AppError(403, "Unauthorized: you can only delete your own messages");
    }

    await messageRef.delete();

    return messageRef.id;
}