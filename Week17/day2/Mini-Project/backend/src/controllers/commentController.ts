/**
 * Comments and comment reactions.
 *
 * Endpoint shape follows the advanced brief: POST /comments, GET /comments/:story_id,
 * PATCH /comments/:id, DELETE /comments/:id.
 */
import type { Request, Response } from "express";
import { ApiError } from "../helpers/ApiError";
import { parseId, validateComment, validateEmoji } from "../helpers/validation";
import {
  createComment,
  deleteComment,
  findCommentOwnership,
  getCommentById,
  getCommentsForStory,
  toggleReaction,
  updateComment,
} from "../models/commentModel";
import { getStoryById } from "../models/storyModel";

/** GET /api/comments/:story_id */
export async function index(req: Request, res: Response): Promise<void> {
  const storyId = parseId(req.params.story_id, "story id");

  const story = await getStoryById(storyId);
  if (!story) throw ApiError.notFound("Story not found.");

  res.json(await getCommentsForStory(storyId, req.user!.id));
}

/** POST /api/comments  body: { story_id, comment_text } */
export async function create(req: Request, res: Response): Promise<void> {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const storyId = parseId(body.story_id, "story_id");
  const commentText = validateComment(body.comment_text);

  const story = await getStoryById(storyId);
  if (!story) throw ApiError.notFound("Story not found.");

  // The author can switch comments off for a story. Enforced here, not just by
  // hiding the form -- otherwise a direct POST would sail straight past the UI.
  if (!story.comments_enabled) {
    throw ApiError.forbidden("Comments are disabled for this story.");
  }

  const comment = await createComment(storyId, req.user!.id, commentText);
  res.status(201).json(comment);
}

/**
 * PATCH /api/comments/:id
 * "Only the author of the comment should be able to edit a comment."
 */
export async function update(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id, "comment id");
  const body = (req.body ?? {}) as Record<string, unknown>;
  const commentText = validateComment(body.comment_text);

  const ownership = await findCommentOwnership(id);
  if (!ownership) throw ApiError.notFound("Comment not found.");

  // Note: the story's author is deliberately NOT allowed here. They may delete a
  // comment to moderate it, but putting words in someone else's mouth is different.
  if (ownership.user_id !== req.user!.id) {
    throw ApiError.forbidden("You can only edit your own comments.");
  }

  const comment = await updateComment(id, commentText, req.user!.id);
  if (!comment) throw ApiError.notFound("Comment not found.");

  res.json(comment);
}

/**
 * DELETE /api/comments/:id
 * "Only the author of the comment or the author of the story."
 */
export async function destroy(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id, "comment id");

  const ownership = await findCommentOwnership(id);
  if (!ownership) throw ApiError.notFound("Comment not found.");

  const isCommentAuthor = ownership.user_id === req.user!.id;
  const isStoryAuthor = ownership.story_author_id === req.user!.id;

  if (!isCommentAuthor && !isStoryAuthor) {
    throw ApiError.forbidden("You can only delete your own comments.");
  }

  await deleteComment(id);
  res.status(204).send();
}

/**
 * POST /api/comments/:id/reactions   body: { emoji }
 *
 * Toggles: reacting twice with the same emoji removes the reaction. Returns the
 * authoritative tallies so the client can reconcile its optimistic update -- and
 * roll back cleanly if this request failed.
 */
export async function react(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id, "comment id");
  const body = (req.body ?? {}) as Record<string, unknown>;
  const emoji = validateEmoji(body.emoji);

  const ownership = await findCommentOwnership(id);
  if (!ownership) throw ApiError.notFound("Comment not found.");

  const reactions = await toggleReaction(id, req.user!.id, emoji);
  res.json(reactions);
}

/** GET /api/comments/detail/:id -- a single comment, used after a failed optimistic update. */
export async function show(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id, "comment id");
  const comment = await getCommentById(id, req.user!.id);
  if (!comment) throw ApiError.notFound("Comment not found.");
  res.json(comment);
}
