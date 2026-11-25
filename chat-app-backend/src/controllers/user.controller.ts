import type { NextFunction, Request, Response } from "express";
import { createOrUpdateUserSchema, getListUserChatsSchema, getUserSchema, } from "../validators/user.validator.js";
import { createUserService, getListUserChatService, getUserService } from "../services/user.service.js";

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


export async function createUser(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const input = createOrUpdateUserSchema.parse({
            body: req.body,
        });
        const { name } = input.body;
        const user = await createUserService({ name });
        res.json(user);
    } catch (err) {
        next(err);
    }
}

export async function getUser(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const input = getUserSchema.parse({
            params: req.params,
        });
        const { userId } = input.params;
        const user = await getUserService({ userId });
        res.json(user);
    } catch (err) {
        next(err);
    }
}