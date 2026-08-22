function ImageGrid({ photos }) {
  if (photos.length === 0) {
    return <p className="empty-message">No images found. Try another search.</p>
  }

  return (
    <div className="image-grid">
      {photos.map((photo) => (
        <a
          key={photo.id}
          href={photo.url}
          target="_blank"
          rel="noreferrer"
          className="image-card"
        >
          <img src={photo.src.medium} alt={photo.alt || 'Pexels photo'} loading="lazy" />
          <div className="image-overlay">
            <span>📷 {photo.photographer}</span>
          </div>
        </a>
      ))}
    </div>
  )
}

export default ImageGrid
