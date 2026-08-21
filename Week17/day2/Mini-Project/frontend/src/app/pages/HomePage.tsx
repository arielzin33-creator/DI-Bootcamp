import { useEffect, useState } from "react";
import {
  createStory,
  clearStoriesError,
  fetchStories,
  setOnlyMine,
} from "../../features/stories/storiesSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import ErrorAlert from "../components/ErrorAlert";
import Spinner from "../components/Spinner";
import StoryCard from "../components/StoryCard";

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { items, status, error, onlyMine } = useAppSelector((state) => state.stories);
  const currentUser = useAppSelector((state) => state.auth.user);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  /**
   * A legitimate effect: synchronising with an external system (the API) when the
   * screen opens or the filter changes. The filter itself is applied server-side --
   * `?mine=true` -- rather than by fetching everything and hiding rows in the browser.
   */
  useEffect(() => {
    void dispatch(fetchStories(onlyMine));
  }, [dispatch, onlyMine]);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    const result = await dispatch(createStory({ title: title.trim(), content: content.trim() }));
    if (createStory.fulfilled.match(result)) {
      setTitle("");
      setContent("");
      setShowForm(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Stories</h1>
          <p className="text-sm opacity-70">Write together, one paragraph at a time.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* The brief's "filter for user's own stories". */}
          <label className="label cursor-pointer gap-2">
            <span className="label-text text-sm">Only mine</span>
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-sm"
              checked={onlyMine}
              onChange={(event) => dispatch(setOnlyMine(event.target.checked))}
            />
          </label>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setShowForm((visible) => !visible)}
          >
            {showForm ? "Cancel" : "New story"}
          </button>
        </div>
      </header>

      <ErrorAlert message={error} onDismiss={() => dispatch(clearStoriesError())} />

      {showForm && (
        <form onSubmit={handleCreate} className="card bg-base-200 mb-8">
          <div className="card-body gap-3">
            <h2 className="card-title text-lg">Start a new story</h2>
            <input
              className="input input-bordered w-full"
              placeholder="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={255}
              required
            />
            <textarea
              className="textarea textarea-bordered w-full"
              rows={6}
              placeholder="Once upon a time..."
              value={content}
              onChange={(event) => setContent(event.target.value)}
              required
            />
            <div className="card-actions justify-end">
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={!title.trim() || !content.trim()}
              >
                Publish
              </button>
            </div>
          </div>
        </form>
      )}

      {status === "loading" && items.length === 0 ? (
        <Spinner label="Loading stories..." />
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg opacity-70">
            {onlyMine ? "You haven't written anything yet." : "No stories yet."}
          </p>
          <p className="text-sm opacity-50 mt-1">Hit &ldquo;New story&rdquo; to begin.</p>
        </div>
      ) : (
        // Responsive: one column on phones, two on tablets, three on desktops.
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((story) => (
            <StoryCard key={story.id} story={story} isMine={story.author_id === currentUser?.id} />
          ))}
        </div>
      )}
    </div>
  );
}
