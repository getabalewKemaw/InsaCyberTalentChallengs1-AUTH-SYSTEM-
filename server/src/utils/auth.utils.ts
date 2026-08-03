import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { UnauthorizedError } from "../errors/unauthorized.error.js";

export const getUserId = (req: AuthenticatedRequest): string => {
  const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedError("User is not authenticated");
  }
  return userId;
};
