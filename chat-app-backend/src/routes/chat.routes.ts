import { Router } from "express";
import { createChat, getMessages, sendMessage } from "../controllers/chat.controller.js";

export const chatRouter = Router();

chatRouter.post("/create", createChat);
chatRouter.post("/:chatId/message/send", sendMessage);
chatRouter.get("/:chatId/messages", getMessages);
