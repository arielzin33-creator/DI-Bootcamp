/**
 * CRUD for stories. Every handler here runs behind `authenticate`.
 */
import type { Request, Response } from "express";
import { ApiError } from "../helpers/ApiError";
import { parseId, validateStory, validateStoryUpdate } from "../helpers/validation";
import {
  createStory,
  deleteStory,
  getStoryById,
  listStories,
  updateStory,
} from "../models/storyModel";
import { broadcastSaved } from "../realtime/wsServer";

/**
 * GET /api/stories
 * Optional `?mine=true` powers the homepage's "my stories" filter.
 */
export async function index(req: Request, res: Response): Promise<void> {
  const onlyMine = req.query.mine === "true";
  const stories = await listStories(onlyMine ? req.user!.id : undefined);
  res.json(stories);
}

/** GET /api/stories/:id */
export async function show(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id, "story id");
  const story = await getStoryById(id);
  if (!story) throw ApiError.notFound("Story not found.");
  res.json(story);
}

/** POST /api/stories */
export async function create(req: Request, res: Response): Promise<void> {
  const { title, content } = validateStory(req.body);
  const story = await createStory(title, content, req.user!.id);
  res.status(201).json(story);
}

/**
 * PATCH /api/stories/:id
 * `requireStoryEditor` has already confirmed the caller is the author or a collaborator.
 *
 * Saving snapshots the previous state into `versions` (handled in the model, inside a
 * transaction) and then tells everyone else editing this story live that the canonical
 * copy changed.
 */
export async function update(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id, "story id");
  const patch = validateStoryUpdate(req.body);

  // Only the author may switch comments off -- collaborators can edit the text but
  // not change how the story is published.
  if (patch.comments_enabled !== undefined && req.story?.author_id !== req.user!.id) {
    throw ApiError.forbidden("Only the author can enable or disable comments.");
  }

  const story = await updateStory(id, patch, req.user!.id);
  if (!story) throw ApiError.notFound("Story not found.");

  broadcastSaved(id, story);

  res.json(story);
}

/**
 * DELETE /api/stories/:id
 * `requireStoryAuthor` has already confirmed the caller is the author.
 */
export async function destroy(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id, "story id");
  const deleted = await deleteStory(id);
  if (!deleted) throw ApiError.notFound("Story not found.");
  res.status(204).send();
}
