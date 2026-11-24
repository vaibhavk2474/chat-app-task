import { z } from "zod";

export const createChatSchema = z
    .object({
        userAId: z.uuid(),
        userBId: z.uuid(),
    })
    .refine((data) => data.userAId !== data.userBId, {
        message: "userAId and userBId must be different",
        path: ["userBId"],
    });

export type CreateChatInput = z.infer<typeof createChatSchema>;