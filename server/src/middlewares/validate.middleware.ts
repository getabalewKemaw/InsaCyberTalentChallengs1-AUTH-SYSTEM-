import type { Request, Response, NextFunction } from "express";
import { validatePasswordStrength } from "../validators/auth.validator.js";
export function validatePasswordMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { password } = req.body || {};
  if (password) {
    const validation = validatePasswordStrength(password);
    if (!validation.valid) {
      res.status(400).json({
        error: "Weak Password,Please make the password strong",
        message: validation.message,
      });
      return;
    }
  }
  next();
}
