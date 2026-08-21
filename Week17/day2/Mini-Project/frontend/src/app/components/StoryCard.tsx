import type { Story } from "@storyapp/types";
import { Link } from "react-router-dom";

/** One story in the homepage list. */
export default function StoryCard({ story, isMine }: { story: Story; isMine: boolean }) {
  const preview = story.content.length > 180 ? `${story.content.slice(0, 180)}...` : story.content;

  return (
    <article className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow h-full">
      <div className="card-body">
        <h2 className="card-title text-base sm:text-lg">
          {story.title}
          {isMine && <span className="badge badge-primary badge-sm">Mine</span>}
        </h2>

        <p className="text-sm text-base-content/70">
          by {story.author?.username ?? "Unknown"} &middot;{" "}
          {new Date(story.updated_at).toLocaleDateString()}
        </p>

        <p className="story-content text-sm mt-2">{preview}</p>

        {story.contributors.length > 0 && (
          <p className="text-xs text-base-content/60 mt-2">
            {story.contributors.length} collaborator
            {story.contributors.length === 1 ? "" : "s"}
          </p>
        )}

        <div className="card-actions justify-end mt-3">
          <Link to={`/stories/${story.id}`} className="btn btn-primary btn-sm">
            Read
          </Link>
        </div>
      </div>
    </article>
  );
}
