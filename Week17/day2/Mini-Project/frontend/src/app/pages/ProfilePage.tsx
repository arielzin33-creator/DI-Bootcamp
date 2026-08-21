import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  clearProfile,
  clearProfileError,
  fetchProfile,
  updateProfile,
  uploadAvatar,
} from "../../features/profile/profileSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import Avatar from "../components/Avatar";
import ErrorAlert from "../components/ErrorAlert";
import Spinner from "../components/Spinner";

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);

  const dispatch = useAppDispatch();
  const { profile, status, saving, error } = useAppSelector((state) => state.profile);
  const currentUser = useAppSelector((state) => state.auth.user);

  const fileInput = useRef<HTMLInputElement>(null);
  const [avatarUrlDraft, setAvatarUrlDraft] = useState("");
  const [usernameDraft, setUsernameDraft] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!Number.isInteger(userId) || userId <= 0) return;
    void dispatch(fetchProfile(userId));
    return () => {
      dispatch(clearProfile());
    };
  }, [dispatch, userId]);

  if (!Number.isInteger(userId) || userId <= 0) {
    return <p className="p-8 text-center">That profile link is not valid.</p>;
  }

  if (status === "loading" && !profile) return <Spinner label="Loading profile..." />;

  if (!profile) {
    return (
      <div className="p-8 text-center">
        <ErrorAlert message={error} onDismiss={() => dispatch(clearProfileError())} />
        <Link to="/" className="btn btn-sm mt-4">
          Back to stories
        </Link>
      </div>
    );
  }

  const isMe = currentUser?.id === profile.user.id;

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check before uploading: a 20 MB photo would otherwise be sent to Cloudinary
    // and only then rejected.
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;

    await dispatch(uploadAvatar(file));
    if (fileInput.current) fileInput.current.value = "";
  }

  async function handleSaveProfile(event: React.FormEvent) {
    event.preventDefault();
    const patch: { username?: string; avatar_url?: string | null } = {};
    if (usernameDraft.trim()) patch.username = usernameDraft.trim();
    if (avatarUrlDraft.trim()) patch.avatar_url = avatarUrlDraft.trim();
    if (Object.keys(patch).length === 0) return;

    const result = await dispatch(updateProfile(patch));
    if (updateProfile.fulfilled.match(result)) {
      setEditing(false);
      setAvatarUrlDraft("");
      setUsernameDraft("");
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ErrorAlert message={error} onDismiss={() => dispatch(clearProfileError())} />

      <header className="flex flex-col sm:flex-row items-center gap-6 mb-8">
        <Avatar user={profile.user} size="lg" />

        <div className="text-center sm:text-left flex-1">
          <h1 className="text-2xl font-bold">{profile.user.username}</h1>
          <p className="opacity-70 text-sm">{profile.user.email}</p>

          <div className="flex gap-4 justify-center sm:justify-start mt-3 text-sm">
            <span>
              <strong>{profile.stats.authored_count}</strong> written
            </span>
            <span>
              <strong>{profile.stats.contributed_count}</strong> collaborations
            </span>
            <span>
              <strong>{profile.stats.comment_count}</strong> comments
            </span>
          </div>
        </div>

        {isMe && (
          <button type="button" className="btn btn-sm" onClick={() => setEditing((open) => !open)}>
            {editing ? "Cancel" : "Edit profile"}
          </button>
        )}
      </header>

      {isMe && editing && (
        <form onSubmit={handleSaveProfile} className="card bg-base-200 mb-8">
          <div className="card-body gap-3">
            <h2 className="card-title text-base">Edit profile</h2>

            <label className="form-control">
              <span className="label-text">Username</span>
              <input
                className="input input-bordered input-sm"
                placeholder={profile.user.username}
                value={usernameDraft}
                onChange={(event) => setUsernameDraft(event.target.value)}
                maxLength={50}
              />
            </label>

            <label className="form-control">
              <span className="label-text">Upload an avatar</span>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="file-input file-input-bordered file-input-sm"
                onChange={handleFile}
                disabled={saving}
              />
              <span className="label-text-alt opacity-60 mt-1">
                Max 5 MB. Uploaded straight to Cloudinary, never through our server.
              </span>
            </label>

            <label className="form-control">
              <span className="label-text">...or paste an image URL</span>
              <input
                className="input input-bordered input-sm"
                placeholder="https://..."
                value={avatarUrlDraft}
                onChange={(event) => setAvatarUrlDraft(event.target.value)}
              />
            </label>

            <div className="card-actions justify-end">
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      )}

      <StoryList title="Stories written" stories={profile.authored} />
      <StoryList title="Collaborating on" stories={profile.contributed} />
    </div>
  );
}

function StoryList({
  title,
  stories,
}: {
  title: string;
  stories: { id: number; title: string; updated_at: string }[];
}) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold mb-3">
        {title} ({stories.length})
      </h2>
      {stories.length === 0 ? (
        <p className="text-sm opacity-70">Nothing here yet.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {stories.map((story) => (
            <li key={story.id}>
              <Link
                to={`/stories/${story.id}`}
                className="block bg-base-200 rounded-box p-3 hover:bg-base-300 transition-colors"
              >
                <p className="font-medium text-sm truncate">{story.title}</p>
                <p className="text-xs opacity-60">
                  {new Date(story.updated_at).toLocaleDateString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
