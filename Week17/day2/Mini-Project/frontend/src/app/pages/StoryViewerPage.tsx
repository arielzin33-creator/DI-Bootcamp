import { useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { clearComments, fetchComments } from "../../features/comments/commentsSlice";
import {
  cancelEditing,
  clearCurrent,
  clearStoriesError,
  draftChanged,
  fetchStory,
  removeStory,
  saveStory,
  startEditing,
} from "../../features/stories/storiesSlice";
import {
  connected,
  connecting,
  disconnected,
  joined,
  peerCursorMoved,
  peerJoined,
  peerLeft,
  realtimeError,
  remoteEditApplied,
  remoteEditReceived,
} from "../../features/realtime/realtimeSlice";
import { clearVersions } from "../../features/versions/versionsSlice";
import {
  connectSocket,
  disconnectSocket,
  joinStory,
  leaveStory,
  sendCursor,
  sendEdit,
} from "../api/socket";
import { useAppDispatch, useAppSelector } from "../hooks";
import Avatar from "../components/Avatar";
import CommentsSection from "../components/CommentsSection";
import ContributorsPanel from "../components/ContributorsPanel";
import ErrorAlert from "../components/ErrorAlert";
import PresenceBar from "../components/PresenceBar";
import ShareButtons from "../components/ShareButtons";
import Spinner from "../components/Spinner";
import VersionHistory from "../components/VersionHistory";

export default function StoryViewerPage() {
  const { id } = useParams<{ id: string }>();
  const storyId = Number(id);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { current, draft, status, saving, error } = useAppSelector((state) => state.stories);
  const currentUser = useAppSelector((state) => state.auth.user);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const lastRemoteEdit = useAppSelector((state) => state.realtime.lastRemoteEdit);

  const contentRef = useRef<HTMLTextAreaElement>(null);

  // ---- load the story, its comments, and reset panels on navigation ----
  useEffect(() => {
    if (!Number.isInteger(storyId) || storyId <= 0) return;

    void dispatch(fetchStory(storyId));
    void dispatch(fetchComments(storyId));

    return () => {
      dispatch(clearCurrent());
      dispatch(clearComments());
      dispatch(clearVersions());
    };
  }, [dispatch, storyId]);

  // ---- live collaboration ----
  useEffect(() => {
    if (!accessToken || !Number.isInteger(storyId) || storyId <= 0) return;

    dispatch(connecting());

    // Every server frame is translated into a plain Redux action here, which keeps
    // all socket knowledge in this one place.
    connectSocket(accessToken, (message) => {
      switch (message.type) {
        case "connected":
          dispatch(connected());
          joinStory(storyId);
          break;
        case "joined":
          dispatch(joined({ storyId: message.storyId, peers: message.peers }));
          break;
        case "peer-joined":
          dispatch(peerJoined(message.peer));
          break;
        case "peer-left":
          dispatch(peerLeft(message.userId));
          break;
        case "cursor":
          dispatch(peerCursorMoved({ userId: message.userId, cursor: message.cursor }));
          break;
        case "edit":
          dispatch(
            remoteEditReceived({
              userId: message.userId,
              title: message.title,
              content: message.content,
            }),
          );
          break;
        case "saved":
          // Someone persisted the story -- take the server's copy as canonical.
          void dispatch(fetchStory(message.storyId));
          break;
        case "error":
          dispatch(realtimeError(message.message));
          break;
      }
    });

    return () => {
      leaveStory(storyId);
      disconnectSocket();
      dispatch(disconnected());
    };
  }, [dispatch, accessToken, storyId]);

  // ---- fold an incoming remote edit into the local draft ----
  useEffect(() => {
    if (!lastRemoteEdit) return;
    // Only while editing: if we are just reading, the "saved" message refetches
    // instead, so we never overwrite the reader's view mid-scroll.
    if (draft) {
      dispatch(
        draftChanged({
          title: lastRemoteEdit.title,
          content: lastRemoteEdit.content,
        }),
      );
    }
    dispatch(remoteEditApplied());
  }, [dispatch, lastRemoteEdit, draft]);

  if (!Number.isInteger(storyId) || storyId <= 0) {
    return <p className="p-8 text-center">That story link is not valid.</p>;
  }

  if (status === "loading" && !current) return <Spinner label="Loading story..." />;

  if (!current) {
    return (
      <div className="p-8 text-center">
        <ErrorAlert message={error} onDismiss={() => dispatch(clearStoriesError())} />
        <Link to="/" className="btn btn-sm mt-4">
          Back to stories
        </Link>
      </div>
    );
  }

  // These mirror the backend's rules exactly (see middleware/authorize.ts). The UI
  // hides what you cannot do; the API is what actually enforces it.
  const isAuthor = current.author_id === currentUser?.id;
  const isCollaborator = current.contributors.some(
    (contributor) => contributor.id === currentUser?.id,
  );
  const canEdit = isAuthor || isCollaborator;

  async function handleDelete() {
    if (!window.confirm("Delete this story permanently?")) return;
    const result = await dispatch(removeStory(storyId));
    if (removeStory.fulfilled.match(result)) navigate("/", { replace: true });
  }

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!draft) return;
    void dispatch(saveStory({ id: storyId, update: draft }));
  }

  /** Local typing: update the draft AND tell the room, so peers see it live. */
  function handleContentChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const content = event.target.value;
    dispatch(draftChanged({ content }));
    sendEdit(storyId, { content });
  }

  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const title = event.target.value;
    dispatch(draftChanged({ title }));
    sendEdit(storyId, { title });
  }

  /** Report the caret so collaborators can see where we are working. */
  function handleCursor() {
    const element = contentRef.current;
    if (!element) return;
    sendCursor(storyId, element.selectionStart, element.selectionEnd - element.selectionStart);
  }

  function handleToggleComments() {
    void dispatch(
      saveStory({ id: storyId, update: { comments_enabled: !current!.comments_enabled } }),
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between gap-4 mb-4">
        <Link to="/" className="btn btn-ghost btn-sm">
          &larr; All stories
        </Link>
        {canEdit && <PresenceBar />}
      </div>

      <ErrorAlert message={error} onDismiss={() => dispatch(clearStoriesError())} />

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <main>
          {draft ? (
            <form onSubmit={handleSave} className="space-y-3">
              <input
                className="input input-bordered w-full text-xl font-bold"
                value={draft.title}
                onChange={handleTitleChange}
                maxLength={255}
                required
              />
              <textarea
                ref={contentRef}
                className="textarea textarea-bordered w-full font-mono text-sm"
                rows={18}
                value={draft.content}
                onChange={handleContentChange}
                onSelect={handleCursor}
                onKeyUp={handleCursor}
                onClick={handleCursor}
                required
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => dispatch(cancelEditing())}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          ) : (
            <article>
              <h1 className="text-2xl sm:text-3xl font-bold">{current.title}</h1>

              <div className="flex items-center gap-2 mt-2">
                <Avatar user={current.author} size="sm" linkToProfile />
                <p className="text-sm opacity-70">
                  by {current.author?.username ?? "Unknown"} &middot; updated{" "}
                  {new Date(current.updated_at).toLocaleString()}
                </p>
              </div>

              <div className="story-content mt-6 leading-relaxed">{current.content}</div>

              <div className="flex flex-wrap gap-2 mt-6">
                {canEdit && (
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => dispatch(startEditing())}
                  >
                    Edit
                  </button>
                )}
                {isAuthor && (
                  <>
                    <button type="button" className="btn btn-sm" onClick={handleToggleComments}>
                      {current.comments_enabled ? "Disable comments" : "Enable comments"}
                    </button>
                    <button type="button" className="btn btn-error btn-sm" onClick={handleDelete}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            </article>
          )}

          {/* Version history is author-only, matching the API. */}
          {isAuthor && <VersionHistory storyId={storyId} />}

          <CommentsSection
            storyId={storyId}
            storyAuthorId={current.author_id}
            commentsEnabled={current.comments_enabled}
          />
        </main>

        <div>
          <ContributorsPanel
            storyId={storyId}
            contributors={current.contributors}
            isAuthor={isAuthor}
          />
          {isAuthor && <ShareButtons storyId={storyId} title={current.title} />}
        </div>
      </div>
    </div>
  );
}
