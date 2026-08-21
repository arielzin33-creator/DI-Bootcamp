/**
 * User profiles and avatars.
 */
import crypto from "node:crypto";
import type { Request, Response } from "express";
import type { Profile } from "@storyapp/types";
import { config } from "../config/env";
import { ApiError } from "../helpers/ApiError";
import { parseId, validateProfileUpdate } from "../helpers/validation";
import { countCommentsByUser } from "../models/commentModel";
import { listContributedStories, listStories } from "../models/storyModel";
import { findUserById, updateUser } from "../models/userModel";

/** GET /api/users/:id/profile */
export async function show(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id, "user id");

  const user = await findUserById(id);
  if (!user) throw ApiError.notFound("User not found.");

  const [authored, contributed, commentCount] = await Promise.all([
    listStories(id),
    listContributedStories(id),
    countCommentsByUser(id),
  ]);

  const profile: Profile = {
    user,
    authored,
    contributed,
    stats: {
      authored_count: authored.length,
      contributed_count: contributed.length,
      comment_count: commentCount,
    },
  };

  res.json(profile);
}

/** PATCH /api/users/me -- change your own username or avatar. */
export async function update(req: Request, res: Response): Promise<void> {
  const patch = validateProfileUpdate(req.body);

  const user = await updateUser(req.user!.id, patch);
  if (!user) throw ApiError.notFound("User not found.");

  res.json(user);
}

/**
 * POST /api/users/me/avatar/signature
 *
 * Returns a short-lived signature for a direct browser -> Cloudinary upload.
 *
 * Why signed direct upload rather than proxying the file through this API:
 *   - the image never occupies our request pipeline or disk, so a 10 MB upload does
 *     not tie up a Node process (Render's free tier has very little memory);
 *   - CLOUDINARY_API_SECRET never leaves the server -- an unsigned preset would let
 *     anyone on the internet upload into the account.
 *
 * The browser POSTs the file straight to Cloudinary with these fields, then sends the
 * resulting secure_url back via PATCH /users/me.
 */
export async function avatarUploadSignature(req: Request, res: Response): Promise<void> {
  const { cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret } = config;

  if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
    // A clear, actionable message rather than a confusing crash when the optional
    // Cloudinary variables were never configured.
    throw new ApiError(
      503,
      "Avatar uploads are not configured on this server. Set CLOUDINARY_CLOUD_NAME, " +
        "CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET, or paste an image URL instead.",
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  // Scope every upload to one folder, and name it after the user so a new avatar
  // replaces the old one instead of accumulating orphans.
  const publicId = `avatar_${req.user!.id}`;
  const folder = "storyapp/avatars";

  // Cloudinary's rule: sort the signed params alphabetically, join as a query string,
  // append the API secret, then SHA-1 the result.
  const paramsToSign = `folder=${folder}&overwrite=true&public_id=${publicId}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(paramsToSign + cloudinaryApiSecret)
    .digest("hex");

  res.json({
    cloud_name: cloudinaryCloudName,
    api_key: cloudinaryApiKey,
    timestamp,
    public_id: publicId,
    folder,
    overwrite: true,
    signature,
    upload_url: `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
  });
}
