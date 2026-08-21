import { useState } from "react";
import {
  addComment,
  clearCommentsError,
  editComment,
  removeComment,
  startEditingComment,
  stopEditingComment,
} from "../../features/comments/commentsSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import Avatar from "./Avatar";
import ErrorAlert from "./ErrorAlert";
import ReactionBar from "./ReactionBar";

/** The comments section of the Story Viewer page. */
export default function CommentsSection({
  storyId,
  storyAuthorId,
  commentsEnabled,
}: {
  storyId: number;
  storyAuthorId: number;
  commentsEnabled: boolean;
}) {
  const dispatch = useAppDispatch();
  const { items, status, error, editingId } = useAppSelector((state) => state.comments);
  const currentUser = useAppSelector((state) => state.auth.user);

  // Local state is right here: this text belongs to the form, not to the app.
  const [draft, setDraft] = useState("");
  const [editDraft, setEditDraft] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const commentText = draft.trim();
    if (!commentText) return;

    const result = await dispatch(addComment({ storyId, commentText }));
    // Only clear the box if the comment actually saved, so a failed post doesn't
    // silently discard what the user wrote.
    if (addComment.fulfilled.match(result)) setDraft("");
  }

  async function handleSaveEdit(event: React.FormEvent, id: number) {
    event.preventDefault();
    const commentText = editDraft.trim();
    if (!commentText) return;
    await dispatch(editComment({ id, commentText }));
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold mb-4">Comments ({items.length})</h2>

      <ErrorAlert message={error} onDismiss={() => dispatch(clearCommentsError())} />

      {commentsEnabled ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            className="textarea textarea-bordered w-full"
            rows={3}
            placeholder="Add a comment..."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={2000}
          />
          <div className="flex justify-end mt-2">
            <button type="submit" className="btn btn-primary btn-sm" disabled={!draft.trim()}>
              Post comment
            </button>
          </div>
        </form>
      ) : (
        <div className="alert mb-6">
          <span>Comments are turned off for this story.</span>
        </div>
      )}

      {status === "loading" && <p className="text-sm opacity-70">Loading comments...</p>}

      {items.length === 0 && status !== "loading" ? (
        <p className="text-sm opacity-70">No comments yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((comment) => {
            const isCommentAuthor = currentUser?.id === comment.user_id;
            const isStoryAuthor = currentUser?.id === storyAuthorId;
            // Editing is author-only; deleting is also allowed to the story's author
            // (moderation). Mirrors exactly what the API enforces.
            const canEdit = isCommentAuthor;
            const canDelete = isCommentAuthor || isStoryAuthor;
            const isEditing = editingId === comment.id;

            return (
              <li key={comment.id} className="bg-base-200 rounded-box p-4">
                <div className="flex gap-3">
                  <Avatar user={comment.author} size="sm" linkToProfile />

                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start gap-3">
                      <p className="font-semibold text-sm">
                        {comment.author?.username ?? "Unknown"}
                        <span className="font-normal opacity-60 ml-2">
                          {new Date(comment.timestamp).toLocaleString()}
                        </span>
                        {comment.edited_at && (
                          <span className="font-normal opacity-50 ml-2 italic">(edited)</span>
                        )}
                      </p>

                      {!isEditing && (
                        <div className="flex gap-1 shrink-0">
                          {canEdit && (
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs"
                              onClick={() => {
                                setEditDraft(comment.comment_text);
                                dispatch(startEditingComment(comment.id));
                              }}
                            >
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs text-error"
                              onClick={() => dispatch(removeComment(comment.id))}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <form onSubmit={(event) => handleSaveEdit(event, comment.id)} className="mt-2">
                        <textarea
                          className="textarea textarea-bordered w-full text-sm"
                          rows={3}
                          value={editDraft}
                          onChange={(event) => setEditDraft(event.target.value)}
                          maxLength={2000}
                        />
                        <div className="flex gap-2 justify-end mt-2">
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs"
                            onClick={() => dispatch(stopEditingComment())}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="btn btn-primary btn-xs"
                            disabled={!editDraft.trim()}
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    ) : (
                      <p className="story-content text-sm mt-1">{comment.comment_text}</p>
                    )}

                    {!isEditing && (
                      <ReactionBar commentId={comment.id} reactions={comment.reactions} />
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
