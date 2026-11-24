import type { NextFunction, Request, Response } from "express";
import { getListUserChatsSchema } from "../validators/user.validator.js";
import { getListUserChatService } from "../services/user.service.js";

export async function getListUserChats(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const input = getListUserChatsSchema.parse({
            params: req.params,
        });
        const userId = input.params.userId;
        const userChats = await getListUserChatService(userId);
        res.json({ userId, userChats });
    } catch (err) {
        next(err);
    }
}
