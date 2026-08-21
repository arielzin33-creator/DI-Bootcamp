import { Router } from "express";
import * as contributorController from "../controllers/contributorController";
import { asyncHandler } from "../helpers/asyncHandler";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

router.post("/", asyncHandler(contributorController.create));
router.get("/:story_id", asyncHandler(contributorController.index));
router.delete("/:id", asyncHandler(contributorController.destroy));

export default router;
