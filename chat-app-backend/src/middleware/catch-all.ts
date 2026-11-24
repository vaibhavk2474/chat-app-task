import type { NextFunction, Request, Response } from "express";

function catchAll(req: Request, res: Response) {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

export default catchAll;