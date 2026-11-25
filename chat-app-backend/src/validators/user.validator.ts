import { z } from "zod";

export const getListUserChatsSchema = z.object({
    params: z.object({
        userId: z.uuid("Invalid userId format"),
    }),
});

export type GetListUserChatsInput = z.infer<typeof getListUserChatsSchema>;


export const createOrUpdateUserSchema = z.object({
    body: z.object({
        name: z.string().min(2).max(100),
    }),
});

export type CreateOrUpdateUserInput = z.infer<typeof createOrUpdateUserSchema>;



export const getUserSchema = z.object({
    params: z.object({
        userId: z.uuid("Invalid userId format"),
    }),
});

export type GetUserInput = z.infer<typeof getUserSchema>;

