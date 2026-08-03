import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import authRoutes from "../routes/auth.routes.js";
import userRoutes from "../routes/user.routes.js";
import documentRoutes from "../routes/document.routes.js";
import { errorHandler } from "../middlewares/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: (_origin, callback) => callback(null, true), // Allow all in dev
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With", "Accept"],
    exposedHeaders: ["Set-Cookie"],
  })
);

app.get("/", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "SyncWrite server is running" });
});

app.use("/api/auth", authRoutes);
app.use(express.json());
app.use("/api/user", userRoutes);
app.use("/api/v1/documents", documentRoutes);
app.use(errorHandler);

export default app;
