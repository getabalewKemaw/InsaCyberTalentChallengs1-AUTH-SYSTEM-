import { Router } from "express";
import {
  createDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
} from "../controllers/document.controller.js";
import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import {
  getRevisions,
  restoreRevision,
} from "../controllers/revision.controller.js";
import { shareDocument } from "../controllers/share.controller.js";
import { duplicateDocument } from "../controllers/duplicate.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { authorizeDocument } from "../middlewares/authorize.middleware.js";

const router = Router();

router.use(requireAuth);

router.post("/", createDocument);
router.get("/", getDocuments);
router.get("/:id", authorizeDocument("viewer"), getDocument);
router.patch("/:id", authorizeDocument("editor"), updateDocument);
router.delete("/:id", deleteDocument);
router.get("/:id/comments", authorizeDocument("viewer"), getComments);
router.post("/:id/comments", authorizeDocument("commenter"), addComment);
router.patch("/comments/:commentId", authorizeDocument("commenter"), updateComment);
router.delete("/comments/:commentId", authorizeDocument("commenter"), deleteComment);

// revisions
router.get("/:id/revisions", authorizeDocument("viewer"), getRevisions);
router.post("/:id/revisions/:revId/restore", authorizeDocument("editor"), restoreRevision);

// sharing & Duplication
router.post("/:id/share", shareDocument); // Controller verifies ownerId
router.post("/:id/duplicate", authorizeDocument("viewer"), duplicateDocument);

export default router;
