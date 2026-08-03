import type { Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import * as shareService from "../services/share.service.js";
import { shareDocumentSchema } from "../schemas/documents.schema.js";
import { asyncHandler } from "../middlewares/async-handler.middleware.js";
import { validate } from "../utils/validation.utils.js";
import { success } from "../utils/response.utils.js";

export const shareDocument = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const data = validate(shareDocumentSchema, req.body);
  const shared = await shareService.shareDocument(id, data.email, data.permissionLevel);
  return success(res, shared);
});
