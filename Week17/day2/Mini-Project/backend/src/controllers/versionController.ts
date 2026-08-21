/**
 * Version history: list, view, diff and restore.
 *
 * "Only the author of the story can see and restore versions" -- so every handler
 * here re-checks authorship rather than relying on the collaborator-level rule that
 * governs ordinary edits.
 */
import type { Request, Response } from "express";
import { ApiError } from "../helpers/ApiError";
import { diffLines, diffStats } from "../helpers/diff";
import { parseId } from "../helpers/validation";
import { getStoryById, updateStory } from "../models/storyModel";
import { getPreviousVersion, getVersionById, listVersions } from "../models/versionModel";

/** Loads the story and asserts the caller wrote it. */
async function requireAuthoredStory(storyId: number, userId: number) {
  const story = await getStoryById(storyId);
  if (!story) throw ApiError.notFound("Story not found.");
  if (story.author_id !== userId) {
    throw ApiError.forbidden("Only the author can view this story's history.");
  }
  return story;
}

/** GET /api/stories/:id/versions */
export async function index(req: Request, res: Response): Promise<void> {
  const storyId = parseId(req.params.id, "story id");
  await requireAuthoredStory(storyId, req.user!.id);
  res.json(await listVersions(storyId));
}

/**
 * GET /api/versions/:id
 * Returns the snapshot plus a diff against the version before it, so the UI can show
 * a git-style view of what that save changed.
 */
export async function show(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id, "version id");

  const version = await getVersionById(id);
  if (!version) throw ApiError.notFound("Version not found.");

  await requireAuthoredStory(version.story_id, req.user!.id);

  const previous = await getPreviousVersion(version.story_id, version.id, version.timestamp);
  // With no earlier version, everything in this one is new -- diff against "".
  const lines = diffLines(previous?.content ?? "", version.content);

  res.json({ version, previous_id: previous?.id ?? null, diff: lines, stats: diffStats(lines) });
}

/**
 * GET /api/versions/:id/diff?against=<versionId>
 * Diffs any two versions of the same story.
 */
export async function diff(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id, "version id");
  const againstId = parseId(req.query.against, "version id");

  const [version, against] = await Promise.all([getVersionById(id), getVersionById(againstId)]);
  if (!version || !against) throw ApiError.notFound("Version not found.");

  if (version.story_id !== against.story_id) {
    throw ApiError.badRequest("Both versions must belong to the same story.");
  }
  await requireAuthoredStory(version.story_id, req.user!.id);

  // Order by timestamp so "added"/"removed" always read oldest -> newest, no matter
  // which id the client passed first.
  const [older, newer] =
    new Date(against.timestamp) <= new Date(version.timestamp)
      ? [against, version]
      : [version, against];

  const lines = diffLines(older.content, newer.content);
  res.json({ older_id: older.id, newer_id: newer.id, diff: lines, stats: diffStats(lines) });
}

/**
 * POST /api/versions/:id/restore
 *
 * Restoring is an ordinary save of the old text, not a deletion of history: it goes
 * through updateStory, which first snapshots the current state. So you can always
 * undo a restore by restoring the version it just created.
 */
export async function restore(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id, "version id");

  const version = await getVersionById(id);
  if (!version) throw ApiError.notFound("Version not found.");

  await requireAuthoredStory(version.story_id, req.user!.id);

  const story = await updateStory(
    version.story_id,
    { title: version.title, content: version.content },
    req.user!.id,
  );
  if (!story) throw ApiError.notFound("Story not found.");

  res.json(story);
}
