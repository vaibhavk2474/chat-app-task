import express from "express";
import { chatRouter } from "./routes/chat.routes.js";
import { errorHandler } from "./middleware/error-handler.js";
import catchAll from "./middleware/catch-all.js";

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ status: "Server is running" });
});
app.get('/api/v1/health', (req, res) => {
    res.json({ status: "ok" });
});

app.use("/api/v1/chat", chatRouter);


// 404 catch-all: must come after all routes, before the error handler
app.use(catchAll);

// Must be last, after all routes
app.use(errorHandler);

export default app;