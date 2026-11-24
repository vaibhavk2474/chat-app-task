import { FieldValue } from "firebase-admin/firestore";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { db } from "../config/firebase.js";

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
