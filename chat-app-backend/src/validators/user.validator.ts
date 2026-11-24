import { z } from "zod";

export const getListUserChatsSchema = z.object({
    params: z.object({
        userId: z.uuid("Invalid userId format"),
    }),
});

export type GetListUserChatsInput = z.infer<typeof getListUserChatsSchema>;
