import { Router } from "express";
import * as authController from "../controllers/authController";
import { asyncHandler } from "../helpers/asyncHandler";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));
router.post("/refresh", asyncHandler(authController.refresh));
router.post("/logout", asyncHandler(authController.logout));
router.get("/me", authenticate, asyncHandler(authController.me));

export default router;
