/**
 * Public share links.
 */
import type { Request, Response } from "express";
import type { ShareLinkResponse } from "@storyapp/types";
import { config } from "../config/env";
import { ApiError } from "../helpers/ApiError";
import { parseId, parseShareToken } from "../helpers/validation";
import { clearShareToken, ensureShareToken, getSharedStory, getStoryById } from "../models/storyModel";

/**
 * POST /api/stories/:id/share -- create (or return) the link. Author only.
 * Idempotent: calling it twice hands back the same token rather than invalidating
 * a link the author may already have sent to someone.
 */
export async function create(req: Request, res: Response): Promise<void> {
  const storyId = parseId(req.params.id, "story id");

  const story = await getStoryById(storyId);
  if (!story) throw ApiError.notFound("Story not found.");
  if (story.author_id !== req.user!.id) {
    throw ApiError.forbidden("Only the author can share this story.");
  }

  const token = await ensureShareToken(storyId);
  if (!token) throw ApiError.notFound("Story not found.");

  const body: ShareLinkResponse = {
    share_token: token,
    // Built from a configured origin, never from the request's Host header -- an
    // attacker who can set Host would otherwise get us to mint links pointing at
    // their own domain.
    url: `${config.publicAppUrl}/shared/${token}`,
  };
  res.status(201).json(body);
}

/** DELETE /api/stories/:id/share -- revoke the link. Author only. */
export async function destroy(req: Request, res: Response): Promise<void> {
  const storyId = parseId(req.params.id, "story id");

  const story = await getStoryById(storyId);
  if (!story) throw ApiError.notFound("Story not found.");
  if (story.author_id !== req.user!.id) {
    throw ApiError.forbidden("Only the author can unshare this story.");
  }

  await clearShareToken(storyId);
  res.status(204).send();
}

/**
 * GET /api/shared/:token -- PUBLIC. Deliberately mounted before `authenticate`.
 *
 * Returns only title, body, author display name and timestamp (see getSharedStory),
 * so an anonymous reader learns nothing about ids, emails or collaborators.
 */
export async function show(req: Request, res: Response): Promise<void> {
  const token = parseShareToken(req.params.token);

  const story = await getSharedStory(token);
  // Same 404 for "no such token" and "token revoked": distinguishing them would let
  // someone probe which tokens once existed.
  if (!story) throw ApiError.notFound("This share link is no longer valid.");

  res.json(story);
}
