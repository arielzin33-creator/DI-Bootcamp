/**
 * Managing the collaborators on a story.
 */
import type { Request, Response } from "express";
import { ApiError } from "../helpers/ApiError";
import { parseId } from "../helpers/validation";
import {
  addContributor,
  findContributorById,
  getContributorsForStory,
  removeContributor,
} from "../models/contributorModel";
import { getStoryById } from "../models/storyModel";
import { findUserById } from "../models/userModel";

/**
 * POST /api/contributors   body: { story_id, user_id }
 *
 * The brief describes this endpoint as only requiring story_id and user_id, but the
 * permission rule has to be enforced here too: without it any logged-in user could add
 * themselves as a collaborator on someone else's story and gain edit rights. Because
 * the story id arrives in the *body* rather than the URL, the route cannot reuse the
 * `requireStoryAuthor` middleware (which reads req.params), so the same check is done
 * explicitly below.
 */
export async function create(req: Request, res: Response): Promise<void> {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const storyId = parseId(body.story_id, "story_id");
  const userId = parseId(body.user_id, "user_id");

  const story = await getStoryById(storyId);
  if (!story) throw ApiError.notFound("Story not found.");

  if (story.author_id !== req.user!.id) {
    throw ApiError.forbidden("Only the author can add contributors to this story.");
  }

  const user = await findUserById(userId);
  if (!user) throw ApiError.notFound("User not found.");

  if (user.id === story.author_id) {
    throw ApiError.badRequest("The author is already able to edit this story.");
  }

  const inserted = await addContributor(storyId, userId);
  if (!inserted) {
    // ON CONFLICT DO NOTHING returned no row -> they were already a contributor.
    throw ApiError.conflict("That user is already a contributor on this story.");
  }

  res.status(201).json(await getContributorsForStory(storyId));
}

/**
 * GET /api/contributors/:story_id
 * Uses the same shared helper as the story serialiser and the edit-permission check.
 */
export async function index(req: Request, res: Response): Promise<void> {
  const storyId = parseId(req.params.story_id, "story id");

  const story = await getStoryById(storyId);
  if (!story) throw ApiError.notFound("Story not found.");

  res.json(await getContributorsForStory(storyId));
}

/**
 * DELETE /api/contributors/:id
 *
 * `:id` is the contributors row id, not a user id -- so we look the row up first to
 * discover which story it belongs to, and only then check that the caller authors it.
 */
export async function destroy(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id, "contributor id");

  const contributor = await findContributorById(id);
  if (!contributor) throw ApiError.notFound("Contributor not found.");

  const story = await getStoryById(contributor.story_id);
  if (!story) throw ApiError.notFound("Story not found.");

  if (story.author_id !== req.user!.id) {
    throw ApiError.forbidden("Only the author can remove contributors from this story.");
  }

  await removeContributor(id);
  res.status(204).send();
}
