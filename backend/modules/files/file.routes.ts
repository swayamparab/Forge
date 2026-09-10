import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { createFileController, deleteFileController, getFileController, getFilesController, updateFileController } from "./file.controller.js";

const router = Router();

router.post("/projects/:projectId/files", requireAuth, createFileController);
router.get("/projects/:projectId/files", requireAuth, getFilesController);
router.get("/projects/:projectId/files/:fileId", requireAuth, getFileController);
router.patch("/projects/:projectId/files/:fileId", requireAuth, updateFileController);
router.delete("/projects/:projectId/files/:fileId", requireAuth, deleteFileController);

export default router;