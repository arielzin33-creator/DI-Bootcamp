import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { SharedStory } from "@storyapp/types";
import { apiRequest } from "../api/client";
import Spinner from "../components/Spinner";

/**
 * Public read-only view of a shared story.
 *
 * Deliberately NOT behind ProtectedRoute, and deliberately not using any auth token:
 * the point of a share link is that the recipient needs no account. The backend
 * returns a reduced shape (no ids, no emails, no contributor list).
 */
export default function SharedStoryPage() {
  const { token } = useParams<{ token: string }>();

  const [story, setStory] = useState<SharedStory | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await apiRequest<SharedStory>(`/shared/${token}`, { skipRefresh: true });
        // Guard against setting state after the user navigated away.
        if (!cancelled) {
          setStory(data);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (status === "loading") return <Spinner label="Loading story..." />;

  if (status === "error" || !story) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold">This link is no longer valid</h1>
        <p className="opacity-70 mt-2">The author may have turned sharing off.</p>
        <Link to="/" className="btn btn-sm mt-4">
          Go to Storyweave
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <article>
        <h1 className="text-2xl sm:text-3xl font-bold">{story.title}</h1>
        <p className="text-sm opacity-70 mt-1">
          by {story.author_name} &middot; updated {new Date(story.updated_at).toLocaleDateString()}
        </p>
        <div className="story-content mt-6 leading-relaxed">{story.content}</div>
      </article>

      <div className="divider mt-10" />
      <p className="text-center text-sm opacity-70">
        Shared from Storyweave.{" "}
        <Link to="/signup" className="link link-primary">
          Create an account
        </Link>{" "}
        to write your own.
      </p>
    </div>
  );
}
