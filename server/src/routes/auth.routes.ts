import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../config/auth.config.js";
import { validatePasswordMiddleware } from "../middlewares/validate.middleware.js";
const router = Router();
router.post("/sign-up/email", validatePasswordMiddleware);
router.post("/change-password", validatePasswordMiddleware);

router.use(toNodeHandler(auth));

export default router;
