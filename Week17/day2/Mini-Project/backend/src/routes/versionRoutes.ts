import { Router } from "express";
import * as versionController from "../controllers/versionController";
import { asyncHandler } from "../helpers/asyncHandler";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

// `/:id/diff` before `/:id` so the more specific route is matched first.
router.get("/:id/diff", asyncHandler(versionController.diff));
router.get("/:id", asyncHandler(versionController.show));
router.post("/:id/restore", asyncHandler(versionController.restore));

export default router;
