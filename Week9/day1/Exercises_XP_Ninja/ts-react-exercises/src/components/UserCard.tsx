/**
 * Exercise 4: Creating a React Component with Optional Props
 *
 * This component demonstrates:
 * - Optional properties in a TypeScript interface (using `?`)
 * - Default values supplied via destructuring defaults
 * - Rendering sensible fallback content when props are omitted
 */

interface UserCardProps {
  name?: string;
  age?: number;
  role?: string;
}

function UserCard({
  name = 'Anonymous User',
  age,
  role = 'Guest',
}: UserCardProps) {
  return (
    <div className="card">
      <h3>{name}</h3>
      <p>Age: {age !== undefined ? age : 'Not specified'}</p>
      <p>Role: {role}</p>
    </div>
  );
}

export default UserCard;
