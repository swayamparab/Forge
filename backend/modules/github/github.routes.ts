import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { connectGithubController, githubCallbackController } from "./github.controller.js";

const router = Router();

router.get("/connect", requireAuth, connectGithubController);
router.get("/callback", githubCallbackController);

export default router;