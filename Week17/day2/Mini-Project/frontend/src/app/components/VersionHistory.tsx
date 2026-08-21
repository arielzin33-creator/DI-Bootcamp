import { useEffect } from "react";
import {
  closeVersion,
  fetchVersion,
  fetchVersions,
  restoreVersion,
} from "../../features/versions/versionsSlice";
import { fetchStory } from "../../features/stories/storiesSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import DiffView from "./DiffView";
import ErrorAlert from "./ErrorAlert";

/**
 * Version history panel. Rendered only for the story's author -- and the API
 * enforces the same rule, so hiding it is convenience, not the security boundary.
 */
export default function VersionHistory({ storyId }: { storyId: number }) {
  const dispatch = useAppDispatch();
  const { items, selected, status, restoring, error } = useAppSelector((state) => state.versions);

  useEffect(() => {
    void dispatch(fetchVersions(storyId));
  }, [dispatch, storyId]);

  async function handleRestore(versionId: number) {
    if (!window.confirm("Restore this version? The current text is saved to history first.")) {
      return;
    }
    const result = await dispatch(restoreVersion(versionId));
    if (restoreVersion.fulfilled.match(result)) {
      // Restoring created a new version and changed the story, so refresh both.
      void dispatch(fetchVersions(storyId));
      void dispatch(fetchStory(storyId));
    }
  }

  return (
    <section className="mt-8 card bg-base-200">
      <div className="card-body">
        <h2 className="card-title text-lg">Version history</h2>
        <p className="text-xs opacity-60 -mt-1">
          Only you can see this. Every save adds an entry.
        </p>

        <ErrorAlert message={error} />

        {status === "loading" && items.length === 0 ? (
          <p className="text-sm opacity-70">Loading history...</p>
        ) : items.length === 0 ? (
          <p className="text-sm opacity-70">No versions yet.</p>
        ) : (
          <ul className="divide-y divide-base-300">
            {items.map((version) => (
              <li key={version.id} className="py-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{version.title}</p>
                  <p className="text-xs opacity-60">
                    {new Date(version.timestamp).toLocaleString()}
                    {version.created_by_name && ` by ${version.created_by_name}`}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => dispatch(fetchVersion(version.id))}
                  >
                    View diff
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs"
                    disabled={restoring}
                    onClick={() => handleRestore(version.id)}
                  >
                    Restore
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {selected && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">
                Changes in &ldquo;{selected.version.title}&rdquo;
              </h3>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={() => dispatch(closeVersion())}
              >
                Close
              </button>
            </div>
            <DiffView diff={selected.diff} stats={selected.stats} />
          </div>
        )}
      </div>
    </section>
  );
}
