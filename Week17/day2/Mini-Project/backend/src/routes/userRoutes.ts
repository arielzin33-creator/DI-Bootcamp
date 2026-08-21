import { Router } from "express";
import * as profileController from "../controllers/profileController";
import { asyncHandler } from "../helpers/asyncHandler";
import { authenticate } from "../middleware/authenticate";
import { searchUsers } from "../models/userModel";

const router = Router();

router.use(authenticate);

/** GET /api/users?search=... -- backs the "add a contributor" picker. */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const term = typeof req.query.search === "string" ? req.query.search.trim() : "";
    if (term.length < 2) {
      // Refuse to return the entire user table for an empty search box.
      res.json([]);
      return;
    }
    res.json(await searchUsers(term, req.user!.id));
  }),
);

// `me` routes come before `/:id/...` so the literal segment is not read as an id.
router.patch("/me", asyncHandler(profileController.update));
router.post("/me/avatar/signature", asyncHandler(profileController.avatarUploadSignature));

router.get("/:id/profile", asyncHandler(profileController.show));

export default router;
