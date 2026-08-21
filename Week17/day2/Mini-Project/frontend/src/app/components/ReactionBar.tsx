import type { Reaction } from "@storyapp/types";
import { toggleReaction } from "../../features/comments/commentsSlice";
import { useAppDispatch } from "../hooks";

/**
 * The emoji palette. Must match ALLOWED_EMOJI in the backend's validation helper --
 * the server rejects anything else, so an emoji added here alone would just 400.
 */
const PALETTE = ["\u{1F44D}", "❤️", "\u{1F602}", "\u{1F62E}", "\u{1F389}", "\u{1F914}"];

/**
 * Reaction buttons for one comment.
 *
 * Clicking dispatches an optimistic toggle: the count changes immediately and is
 * rolled back if the server rejects it (see commentsSlice).
 */
export default function ReactionBar({
  commentId,
  reactions,
}: {
  commentId: number;
  reactions: Reaction[];
}) {
  const dispatch = useAppDispatch();

  function handleToggle(emoji: string) {
    // Snapshot the current tallies so the thunk can restore them on failure.
    dispatch(toggleReaction({ commentId, emoji, previous: reactions }));
  }

  const byEmoji = new Map(reactions.map((reaction) => [reaction.emoji, reaction]));

  return (
    <div className="flex flex-wrap items-center gap-1 mt-2">
      {PALETTE.map((emoji) => {
        const tally = byEmoji.get(emoji);
        const count = tally?.count ?? 0;
        const reacted = tally?.reacted ?? false;

        return (
          <button
            key={emoji}
            type="button"
            onClick={() => handleToggle(emoji)}
            aria-label={`React with ${emoji}`}
            aria-pressed={reacted}
            className={`btn btn-xs gap-1 ${reacted ? "btn-primary" : "btn-ghost"} ${
              count === 0 ? "opacity-50 hover:opacity-100" : ""
            }`}
          >
            <span aria-hidden="true">{emoji}</span>
            {count > 0 && <span className="tabular-nums">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
