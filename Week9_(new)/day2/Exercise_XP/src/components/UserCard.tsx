interface UserCardProps {
  name?: string
  age?: number
  role?: string
}

function UserCard({ name = 'Anonymous', age = 0, role = 'Guest' }: UserCardProps) {
  return (
    <div className="user-card">
      <h3>{name}</h3>
      <p>Age: {age > 0 ? age : 'Unknown'}</p>
      <p>Role: {role}</p>
    </div>
  )
}

export default UserCard
