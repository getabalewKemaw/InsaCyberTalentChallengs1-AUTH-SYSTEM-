import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  getProfile,
  getSessions,
  revokeSession,
  revokeOtherSessions,
  getLoginActivity,
} from "../controllers/user.controller.js";
const router = Router();
router.use(requireAuth);
router.get("/me", getProfile);
router.get("/sessions", getSessions);
router.post("/sessions/revoke", revokeSession);
router.post("/sessions/revoke-others", revokeOtherSessions);
router.get("/login-activity", getLoginActivity);
export default router;
