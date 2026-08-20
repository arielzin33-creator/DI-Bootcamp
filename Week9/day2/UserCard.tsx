interface UserCardProps {
  name?: string;
  age?: number;
  role?: string;
}

const DEFAULT_NAME = 'Anonymous user';
const DEFAULT_ROLE = 'Guest';

export default function UserCard({ name, age, role }: UserCardProps) {
  const displayName = name ?? DEFAULT_NAME;
  const displayRole = role ?? DEFAULT_ROLE;
  // `age` is deliberately handled with a plain `undefined` check, not `??`
  // or a numeric default like `age ?? 0` — there's no sensible "default
  // age" the way there's a sensible default name or role, and displaying
  // a fabricated "0" would misrepresent a user we simply don't have data
  // for. Omitting the line entirely is the honest option.
  const hasAge = age !== undefined;

  return (
    <div className="user-card">
      <p className="user-card__name">{displayName}</p>
      <p className="user-card__role">{displayRole}</p>
      {hasAge && <p className="user-card__age">Age: {age}</p>}
    </div>
  );
}
