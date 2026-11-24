import type { NextFunction, Request, Response } from "express";
import { createChatSchema } from "../validators/chat.validator.js";
import { createOrGetChat, sendChatMessage } from "../services/chat.service.js";
import { sendMessageSchema } from "../validators/message.validator.js";

// does three things: validate the request body, call the service, send the response. 
// Any error goes to next(err), 
// which will reach the central error handler
export async function createChat(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const input = createChatSchema.parse(req.body);
        const chatId = await createOrGetChat(input);
        res.json({ chatId });
    } catch (err) {
        next(err);
    }
}

export async function sendMessage(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const input = sendMessageSchema.parse({
            params: req.params,
            body: req.body,
        });
        const messageId = await sendChatMessage(input);
        res.status(201).json({ messageId });
    } catch (err) {
        next(err);
    }
}
