import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware.js";
import { createProjectController, deleteProjectController, getProjectByIdController, getUserProjectsController, updateProjectController } from "./project.controller.js";

const router = Router();

router.post("/", requireAuth, createProjectController);
router.get("/", requireAuth, getUserProjectsController);
router.get("/:projectId", requireAuth, getProjectByIdController);
router.patch("/:projectId", requireAuth, updateProjectController);
router.delete("/:projectId", requireAuth, deleteProjectController);

export default router;