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

export const getMessagesSchema = z.object({
    params: z.object({
        chatId: z.uuid("Invalid chatId format"),
    }),
    query: z.object({
        limit: z.coerce.number().int().min(1).max(100).default(50),
        cursor: z.string().min(1).max(1500).refine((value) => !value.includes("/"), {
            message: "Invalid cursor",
        }).optional(),
    }),
});

export type GetMessagesInput = z.infer<typeof getMessagesSchema>;

export const markMessageReadSchema = z.object({
    params: z.object({
        chatId: z.uuid("Invalid chatId format"),
        messageId: z.string().min(1).max(1500).refine((value) => !value.includes("/"), {
            message: "Invalid messageId",
        }),
    }),
    body: z.object({
        userId: z.uuid("Invalid userId format"),
    }),
});

export type MarkMessageReadInput = z.infer<typeof markMessageReadSchema>;

export const updateLastSeenSchema = z.object({
    params: z.object({
        chatId: z.uuid("Invalid chatId format"),
    }),
    body: z.object({
        userId: z.uuid("Invalid userId format"),
        messageId: z.string().min(1).max(1500).refine((value) => !value.includes("/"), {
            message: "Invalid messageId",
        }),
    }),
});

export type UpdateLastSeenInput = z.infer<typeof updateLastSeenSchema>;

export const editMessageSchema = z.object({
    params: z.object({
        chatId: z.uuid("Invalid chatId format"),
        messageId: z.string().min(1).max(1500).refine((value) => !value.includes("/"), {
            message: "Invalid messageId",
        }),
    }),
    body: z.object({
        senderId: z.uuid("Invalid senderId format"),
        text: z.string().trim()
            .min(1, "Message cannot be empty")
            .max(2000, "Message must be 2000 characters or fewer"),
    }),
});

export type EditMessageInput = z.infer<typeof editMessageSchema>;


export const deleteMessageSchema = z.object({
    params: z.object({
        chatId: z.uuid("Invalid chatId format"),
        messageId: z.string().min(1).max(1500).refine((value) => !value.includes("/"), {
            message: "Invalid messageId",
        }),
    }),
    body: z.object({
        senderId: z.uuid("Invalid senderId format"),
    }),
});

export type DeleteMessageInput = z.infer<typeof deleteMessageSchema>;