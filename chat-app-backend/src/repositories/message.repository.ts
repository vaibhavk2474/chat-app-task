import { FieldValue } from "firebase-admin/firestore";
import { db } from "../config/firebase.js";

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
