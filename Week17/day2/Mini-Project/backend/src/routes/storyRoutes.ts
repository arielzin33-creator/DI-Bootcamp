import { Router } from "express";
import * as shareController from "../controllers/shareController";
import * as storyController from "../controllers/storyController";
import * as versionController from "../controllers/versionController";
import { asyncHandler } from "../helpers/asyncHandler";
import { authenticate } from "../middleware/authenticate";
import { requireStoryAuthor, requireStoryEditor } from "../middleware/authorize";

const router = Router();

// Every story route requires a valid access token.
router.use(authenticate);

router.get("/", asyncHandler(storyController.index));
router.post("/", asyncHandler(storyController.create));
router.get("/:id", asyncHandler(storyController.show));

// Author OR a listed collaborator may edit.
router.patch("/:id", requireStoryEditor, asyncHandler(storyController.update));

// Only the author may delete.
router.delete("/:id", requireStoryAuthor, asyncHandler(storyController.destroy));

// Version history -- author only, enforced inside the controller.
router.get("/:id/versions", asyncHandler(versionController.index));

// Share links -- author only, enforced inside the controller.
router.post("/:id/share", asyncHandler(shareController.create));
router.delete("/:id/share", asyncHandler(shareController.destroy));

export default router;
