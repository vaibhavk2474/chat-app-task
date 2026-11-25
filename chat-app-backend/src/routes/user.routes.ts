import { Router } from "express";
import { createUser, getListUserChats, getUser } from "../controllers/user.controller.js";

export const userRouter = Router();

userRouter.get("/:userId/chats", getListUserChats);

// additional user routes for users only
userRouter.post("/", createUser)
userRouter.get("/:userId", getUser)