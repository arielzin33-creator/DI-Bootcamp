function Pagination({ page, hasNextPage, onPrev, onNext }) {
  return (
    <div className="pagination">
      <button type="button" onClick={onPrev} disabled={page === 1}>
        ← Prev
      </button>
      <span className="pagination-page">Page {page}</span>
      <button type="button" onClick={onNext} disabled={!hasNextPage}>
        Next →
      </button>
    </div>
  )
}

export default Pagination
