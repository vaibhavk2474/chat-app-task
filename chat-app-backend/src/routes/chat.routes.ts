import { Router } from "express";
import { createChat } from "../controllers/chat.controller.js";

export const chatRouter = Router();

chatRouter.post("/create", createChat);