import type { User } from "@storyapp/types";
import { Link } from "react-router-dom";

const SIZES = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-12 h-12 text-base",
  lg: "w-24 h-24 text-2xl",
} as const;

/**
 * A user's avatar, falling back to their initial when no image is set.
 *
 * `linkToProfile` is opt-in because this is rendered inside other links (comment
 * headers, story cards) and nesting an <a> inside an <a> is invalid HTML.
 */
export default function Avatar({
  user,
  size = "sm",
  linkToProfile = false,
}: {
  user: Pick<User, "id" | "username" | "avatar_url"> | null;
  size?: keyof typeof SIZES;
  linkToProfile?: boolean;
}) {
  const initial = (user?.username ?? "?").charAt(0).toUpperCase();

  const inner = user?.avatar_url ? (
    <div className={`avatar`}>
      <div className={`${SIZES[size]} rounded-full`}>
        <img
          src={user.avatar_url}
          alt={`${user.username}'s avatar`}
          // A broken or removed remote image should degrade to the initial rather
          // than showing the browser's broken-image icon.
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      </div>
    </div>
  ) : (
    <div className="avatar placeholder">
      <div className={`${SIZES[size]} rounded-full bg-neutral text-neutral-content`}>
        <span>{initial}</span>
      </div>
    </div>
  );

  if (linkToProfile && user) {
    return (
      <Link to={`/users/${user.id}`} className="hover:opacity-80 transition-opacity">
        {inner}
      </Link>
    );
  }
  return inner;
}
