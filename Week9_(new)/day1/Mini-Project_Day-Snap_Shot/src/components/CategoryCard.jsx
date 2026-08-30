import { Link } from 'react-router-dom'

function CategoryCard({ name, query, emoji, gradient }) {
  return (
    <Link to={`/SnapScout/${query}`} className="category-card" style={{ background: gradient }}>
      <span className="category-emoji">{emoji}</span>
      <span className="category-name">{name}</span>
    </Link>
  )
}

export default CategoryCard
