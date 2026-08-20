// src/services/markdown.ts
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config.js';
import { BadRequestError } from '../middleware/errorHandler.js';
import type { SaveMarkdownResponse } from '../types.js';

const SAFE_FILENAME_PATTERN = /^[a-zA-Z0-9._-]+\.md$/;

/**
 * `filename` comes straight from the request body -- an untrusted client
 * input that ends up as part of a filesystem path. Without validation,
 * something like `filename: "../../etc/cron.d/evil"` would let a caller
 * write outside `outputs/` entirely. `SAFE_FILENAME_PATTERN` rejects any
 * path separator, `..`, or anything but a plain `name.md`, and the
 * resolved path is double-checked to still be inside `outputsDir` before
 * writing, rather than trusting the regex alone.
 *
 * Both checks throw `BadRequestError`, not a plain `Error` -- caught
 * directly: a first version threw plain `Error` here, and a path-traversal
 * attempt that was correctly *blocked* still came back as an HTTP 500
 * ("something went wrong on the server") instead of a 400 ("your request
 * was invalid"). The write was refused either way, but a 500 on a
 * correctly-rejected malicious input is the wrong status code -- it's the
 * client's request that's bad, not a server-side failure.
 */
export async function saveMarkdown(filename: string, content: string): Promise<SaveMarkdownResponse> {
  if (!SAFE_FILENAME_PATTERN.test(filename)) {
    throw new BadRequestError(
      'filename must be a plain name ending in .md, with no path separators or ".." (e.g. "brief_2026-08-03.md").',
    );
  }

  await mkdir(config.outputsDir, { recursive: true });

  const resolvedDir = path.resolve(config.outputsDir);
  const resolvedPath = path.resolve(config.outputsDir, filename);
  if (!resolvedPath.startsWith(resolvedDir + path.sep) && resolvedPath !== resolvedDir) {
    throw new BadRequestError('Resolved path escapes the outputs directory.');
  }

  await writeFile(resolvedPath, content, 'utf-8');
  return { path: resolvedPath };
}
