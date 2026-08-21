import type { User } from "@storyapp/types";
import { useState } from "react";
import { addContributor, searchUsers } from "../../features/stories/storiesSlice";
import { useAppDispatch } from "../hooks";

/**
 * Shows a story's collaborators, and lets the author add more.
 *
 * Only the author sees the search box -- and the backend enforces the same rule, so
 * hiding the UI is a convenience, never the actual security boundary.
 */
export default function ContributorsPanel({
  storyId,
  contributors,
  isAuthor,
}: {
  storyId: number;
  contributors: User[];
  isAuthor: boolean;
}) {
  const dispatch = useAppDispatch();
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);

  /**
   * Searching happens on submit rather than in a useEffect watching `term`.
   * "You Might Not Need an Effect": this is an event (the user asked to search), not
   * synchronisation with an external system, so it belongs in the handler.
   */
  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    if (term.trim().length < 2) return;

    setSearching(true);
    const result = await dispatch(searchUsers(term.trim()));
    setSearching(false);

    if (searchUsers.fulfilled.match(result)) setResults(result.payload);
  }

  async function handleAdd(userId: number) {
    const result = await dispatch(addContributor({ storyId, userId }));
    if (addContributor.fulfilled.match(result)) {
      // Clear the picker -- the updated contributor list is already in the store.
      setResults([]);
      setTerm("");
    }
  }

  const existingIds = new Set(contributors.map((contributor) => contributor.id));

  return (
    <aside className="card bg-base-200">
      <div className="card-body">
        <h3 className="card-title text-base">Collaborators</h3>

        {contributors.length === 0 ? (
          <p className="text-sm opacity-70">No collaborators yet.</p>
        ) : (
          <ul className="space-y-1">
            {contributors.map((contributor) => (
              <li key={contributor.id} className="text-sm">
                {contributor.username}
                <span className="opacity-60"> ({contributor.email})</span>
              </li>
            ))}
          </ul>
        )}

        {isAuthor && (
          <>
            <form onSubmit={handleSearch} className="mt-4 join w-full">
              <input
                className="input input-bordered input-sm join-item w-full"
                placeholder="Find a user..."
                value={term}
                onChange={(event) => setTerm(event.target.value)}
              />
              <button
                type="submit"
                className="btn btn-sm join-item"
                disabled={term.trim().length < 2 || searching}
              >
                {searching ? "..." : "Search"}
              </button>
            </form>

            {results.length > 0 && (
              <ul className="mt-3 space-y-1">
                {results.map((user) => (
                  <li key={user.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate">{user.username}</span>
                    <button
                      type="button"
                      className="btn btn-xs btn-primary"
                      disabled={existingIds.has(user.id)}
                      onClick={() => handleAdd(user.id)}
                    >
                      {existingIds.has(user.id) ? "Added" : "Add"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
