import { z } from "zod";

export const sendMessageSchema = z.object({
    params: z.object({
        chatId: z.uuid("Invalid chatId format"),
    }),
    body: z.object({
        senderId: z.uuid("Invalid senderId format"),
        text: z.string().trim()
            .min(1, "Message cannot be empty")
            .max(2000, "Message must be 2000 characters or fewer"),
    }),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
