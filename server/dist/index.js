import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
const app = express();
const allowedOrigins = Array.from(new Set(["http://localhost:3000", "http://127.0.0.1:3000", config.clientUrl])).filter(Boolean);
// CORS middleware applied globally
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin or whitelisted origin
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
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
}));
// Health Check
app.get("/", (_req, res) => {
    res.json({
        status: "ok",
        message: "Server is running with Better Auth & Clean Layered Architecture",
    });
});
// Better Auth routes (must receive raw unconsumed request streams)
app.use("/api/auth", authRoutes);
// JSON body parser for custom API routes
app.use(express.json());
// User management routes
app.use("/api/user", userRoutes);
// Global Error Middleware
app.use(errorHandler);
// Process Safety Protection
process.on("uncaughtException", (err) => {
    console.error("[Uncaught Exception]:", err);
});
process.on("unhandledRejection", (reason) => {
    console.error("[Unhandled Rejection]:", reason);
});
app.listen(config.port, () => {
    console.log(`Server is running at http://localhost:${config.port}`);
});
export default app;
//# sourceMappingURL=index.js.map