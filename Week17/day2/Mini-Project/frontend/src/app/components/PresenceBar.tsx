import { useAppSelector } from "../hooks";
import Avatar from "./Avatar";

/** Shows who else is editing this story right now, and where their caret is. */
export default function PresenceBar() {
  const { status, peers } = useAppSelector((state) => state.realtime);

  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={`inline-block w-2 h-2 rounded-full ${
          status === "connected"
            ? "bg-success"
            : status === "connecting"
              ? "bg-warning animate-pulse"
              : "bg-base-300"
        }`}
        aria-hidden="true"
      />
      <span className="opacity-60">
        {status === "connected" ? "Live" : status === "connecting" ? "Connecting..." : "Offline"}
      </span>

      {peers.length > 0 && (
        <div className="flex items-center gap-1 ml-2">
          <div className="flex -space-x-2">
            {peers.map((peer) => (
              <div
                key={peer.userId}
                // The tooltip is where the cursor position surfaces -- rendering a
                // caret inside a plain <textarea> is not possible without swapping it
                // for a contenteditable/CodeMirror surface.
                className="tooltip"
                data-tip={
                  peer.cursor
                    ? `${peer.username} — at character ${peer.cursor.offset}`
                    : peer.username
                }
              >
                <Avatar user={{ ...peer, id: peer.userId }} size="xs" />
              </div>
            ))}
          </div>
          <span className="opacity-60 ml-1">
            {peers.length} other{peers.length === 1 ? "" : "s"} editing
          </span>
        </div>
      )}
    </div>
  );
}
