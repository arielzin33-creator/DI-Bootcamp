/**
 * Resource-level permission checks, run after `authenticate`.
 *
 * The two rules the brief states:
 *   "only the author of a story should be able to delete it, while only the author and
 *    the collaborators should be able to edit it."
 *
 * Both middlewares load the story once and stash it on `req.story`, so the controller
 * that runs next does not repeat the lookup.
 *
 * Note the brief's own example middleware references a `story` variable that it never
 * fetches, and reads `user.id` without checking that `req.user` exists -- these load the
 * story for real and treat a missing user as a 401.
 */
import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../helpers/ApiError";
import { asyncHandler } from "../helpers/asyncHandler";
import { parseId } from "../helpers/validation";
import { getStoryById } from "../models/storyModel";

/**
 * Loads the story named by :id (or :story_id) and rejects if it does not exist.
 * Returns the story so the callers below can apply their own rule to it.
 */
async function loadStory(req: Request) {
  const rawId = req.params.id ?? req.params.story_id;
  const storyId = parseId(rawId, "story id");
  const story = await getStoryById(storyId);
  if (!story) throw ApiError.notFound("Story not found.");
  return story;
}

function requireUser(req: Request): { id: number } {
  if (!req.user) {
    // Only reachable if this middleware is mounted without `authenticate` in front.
    throw ApiError.unauthorized();
  }
  return req.user;
}

/** Author only -- used for DELETE /stories/:id and contributor management. */
export const requireStoryAuthor = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const user = requireUser(req);
    const story = await loadStory(req);

    if (story.author_id !== user.id) {
      throw ApiError.forbidden("Only the author can perform this action on this story.");
    }

    req.story = story;
    next();
  },
);

/** Author or listed collaborator -- used for PATCH /stories/:id. */
export const requireStoryEditor = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const user = requireUser(req);
    const story = await loadStory(req);

    // `story.contributors` comes from getContributorsForStory -- the same single source
    // of truth that the GET /contributors/:story_id endpoint returns to the UI, so what
    // the user sees and what the server enforces can never drift apart.
    const isAuthor = story.author_id === user.id;
    const isCollaborator = story.contributors.some((contributor) => contributor.id === user.id);

    if (!isAuthor && !isCollaborator) {
      throw ApiError.forbidden("You are not authorized to edit this story.");
    }

    req.story = story;
    next();
  },
);
