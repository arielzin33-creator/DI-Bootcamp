import { Router } from "express";
import * as commentController from "../controllers/commentController";
import { asyncHandler } from "../helpers/asyncHandler";
import { authenticate } from "../middleware/authenticate";

/** Endpoint shape per the advanced brief: flat /comments routes. */
const router = Router();

router.use(authenticate);

router.post("/", asyncHandler(commentController.create));
// `/detail/:id` is declared before `/:story_id` so the literal segment wins; otherwise
// Express would match "detail" as a story id and reject it as invalid.
router.get("/detail/:id", asyncHandler(commentController.show));
router.get("/:story_id", asyncHandler(commentController.index));
router.patch("/:id", asyncHandler(commentController.update));
router.delete("/:id", asyncHandler(commentController.destroy));
router.post("/:id/reactions", asyncHandler(commentController.react));

export default router;
