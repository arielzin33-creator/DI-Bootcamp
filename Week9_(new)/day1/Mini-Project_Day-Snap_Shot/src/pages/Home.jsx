import SearchBar from '../components/SearchBar'
import CategoryCard from '../components/CategoryCard'
import categories from '../categories'

function Home() {
  return (
    <div className="home">
      <h1 className="tagline">Find the perfect shot</h1>
      <p className="subtitle">Search thousands of free stock photos, or pick a category below.</p>

      <SearchBar />

      <div className="category-grid">
        {categories.map((category) => (
          <CategoryCard key={category.query} {...category} />
        ))}
      </div>
    </div>
  )
}

export default Home
