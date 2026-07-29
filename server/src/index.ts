import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import { config } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
const app = express();

const allowedOrigins = Array.from(
  new Set(["http://localhost:3000", "http://127.0.0.1:3000", config.clientUrl])
).filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Dev fallback
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cookie",
      "X-Requested-With",
      "Accept",
    ],
    exposedHeaders: ["Set-Cookie"],
  })
);


app.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Server is running with Better Auth & Clean Layered Architecture",
  });
});

app.use("/api/auth", authRoutes);

app.use(express.json());

app.use("/api/user", userRoutes);


app.use(errorHandler);


app.listen(config.port, () => {
  console.log(`Server is running at http://localhost:${config.port}`);
});
export default app;
