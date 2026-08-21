import { useState } from "react";
import type { ShareLinkResponse } from "@storyapp/types";
import { apiRequest } from "../api/client";
import { sessionExpired, tokenRefreshed } from "../../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../hooks";

/**
 * Share controls for a story. Author only.
 *
 * Rolled by hand rather than pulling in `react-share`: the whole feature is two URL
 * templates and a `window.open`, and it avoids a dependency that ships trackers for
 * networks this app does not use.
 */
export default function ShareButtons({ storyId, title }: { storyId: number; title: string }) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  const [link, setLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateLink() {
    setBusy(true);
    setError(null);
    try {
      const response = await apiRequest<ShareLinkResponse>(`/stories/${storyId}/share`, {
        method: "POST",
        token: accessToken,
        onTokenRefreshed: (token) => dispatch(tokenRefreshed(token)),
        onAuthFailure: () => dispatch(sessionExpired()),
      });
      setLink(response.url);
    } catch {
      setError("Could not create a share link.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied; the input below is selectable as a fallback.
      setError("Could not copy automatically -- select the link and copy it.");
    }
  }

  // encodeURIComponent on both, so a title containing & or # cannot break out of the
  // query string and rewrite the share URL.
  const encodedUrl = encodeURIComponent(link ?? "");
  const encodedTitle = encodeURIComponent(title);

  const targets = [
    { name: "X", url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { name: "Facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
  ];

  return (
    <div className="card bg-base-200 mt-4">
      <div className="card-body gap-2">
        <h3 className="card-title text-base">Share</h3>

        {error && <p className="text-error text-sm">{error}</p>}

        {!link ? (
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={handleCreateLink}
            disabled={busy}
          >
            {busy ? "Creating..." : "Create share link"}
          </button>
        ) : (
          <>
            <div className="join w-full">
              <input className="input input-bordered input-sm join-item w-full" readOnly value={link} />
              <button type="button" className="btn btn-sm join-item" onClick={handleCopy}>
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="flex gap-2 mt-1">
              {targets.map((target) => (
                <a
                  key={target.name}
                  className="btn btn-sm btn-outline"
                  href={target.url}
                  target="_blank"
                  // noopener stops the opened page from touching window.opener;
                  // noreferrer keeps our URL out of its referrer header.
                  rel="noopener noreferrer"
                >
                  {target.name}
                </a>
              ))}
            </div>

            <p className="text-xs opacity-60 mt-1">
              Anyone with this link can read the story without an account.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
