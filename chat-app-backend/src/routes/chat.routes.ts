import { Router } from "express";
import { createChat, deleteMessage, editMessage, getMessages, markMessageReadController, sendMessage, updateLastSeenController } from "../controllers/chat.controller.js";

export const chatRouter = Router();

chatRouter.post("/create", createChat);
chatRouter.post("/:chatId/message/send", sendMessage);
chatRouter.get("/:chatId/messages", getMessages);
chatRouter.post("/:chatId/message/:messageId/read", markMessageReadController);
chatRouter.post("/:chatId/lastseen", updateLastSeenController);

// Additional
chatRouter.patch("/:chatId/message/:messageId", editMessage);
chatRouter.delete("/:chatId/message/:messageId", deleteMessage);
