export default function IdBadge({ status, error, user }) {
  return (
    <div className={`badge badge--${status}`}>
      <div className="badge__hole" aria-hidden="true" />

      <div className="badge__header">
        <span className="badge__org">GENERAL DIRECTORY</span>
        <span className="badge__id">No. {user ? String(user.id).padStart(4, '0') : '----'}</span>
      </div>

      <div className="badge__photo" aria-hidden="true">
        <svg viewBox="0 0 64 64" className="badge__silhouette">
          <circle cx="32" cy="24" r="14" />
          <path d="M8 60c0-15 10-24 24-24s24 9 24 24" />
        </svg>
        {status === 'loading' && <div className="badge__scan" />}
      </div>

      <div className="badge__details">
        {status === 'idle' && <p className="badge__placeholder">No record loaded.</p>}

        {status === 'loading' && <p className="badge__placeholder">Scanning record…</p>}

        {status === 'failed' && (
          <p className="badge__error" role="alert">
            {error}
          </p>
        )}

        {status === 'succeeded' && user && (
          <>
            <p className="badge__name">{user.name}</p>
            <p className="badge__field">{user.email}</p>
            {user.company && <p className="badge__field">{user.company}</p>}
            {user.city && <p className="badge__field">{user.city}</p>}
          </>
        )}
      </div>

      <div className="badge__barcode" aria-hidden="true" />

      {status === 'failed' && <div className="badge__stamp">ACCESS DENIED</div>}
      {status === 'succeeded' && <div className="badge__verified">VERIFIED</div>}
    </div>
  );
}
