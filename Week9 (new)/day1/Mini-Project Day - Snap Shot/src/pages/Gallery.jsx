import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import ImageGrid from '../components/ImageGrid'
import Pagination from '../components/Pagination'
import { searchPhotos, PER_PAGE } from '../api/pexels'

function Gallery() {
  const { query } = useParams()
  const [photos, setPhotos] = useState([])
  const [page, setPage] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setPage(1)
  }, [query])

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(null)

    searchPhotos(query, page)
      .then((data) => {
        if (cancelled) return
        setPhotos(data.photos || [])
        setTotalResults(data.total_results || 0)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
        setPhotos([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [query, page])

  const hasNextPage = page * PER_PAGE < totalResults

  return (
    <div className="gallery">
      <SearchBar initialValue={query} />
      <h2 className="gallery-title">Results for "{query}"</h2>

      {loading && <p className="status-message">Loading images…</p>}
      {error && <p className="status-message error">{error}</p>}

      {!loading && !error && (
        <>
          <ImageGrid photos={photos} />
          <Pagination
            page={page}
            hasNextPage={hasNextPage}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => p + 1)}
          />
        </>
      )}
    </div>
  )
}

export default Gallery
