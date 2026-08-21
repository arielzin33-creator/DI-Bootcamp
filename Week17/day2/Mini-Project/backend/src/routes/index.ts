import { Router } from "express";
import * as shareController from "../controllers/shareController";
import { asyncHandler } from "../helpers/asyncHandler";
import authRoutes from "./authRoutes";
import commentRoutes from "./commentRoutes";
import contributorRoutes from "./contributorRoutes";
import storyRoutes from "./storyRoutes";
import userRoutes from "./userRoutes";
import versionRoutes from "./versionRoutes";

const router = Router();

/** Liveness probe. Render pings this to decide whether the service came up. */
router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

/**
 * PUBLIC. Mounted before every authenticated router, because the whole point of a
 * share link is that the recipient does not need an account.
 */
router.get("/shared/:token", asyncHandler(shareController.show));

router.use("/auth", authRoutes);
router.use("/stories", storyRoutes);
router.use("/contributors", contributorRoutes);
router.use("/comments", commentRoutes);
router.use("/versions", versionRoutes);
router.use("/users", userRoutes);

export default router;
