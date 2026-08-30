export default function MeetingList({ meetings, onEdit, onDelete }) {
  if (meetings.length === 0) {
    return <p className="empty-state">No meetings recorded yet.</p>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Business</th>
          <th>Location</th>
          <th>Summary</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {meetings.map((m) => (
          <tr key={m.id}>
            <td>{m.date}</td>
            <td>{m.business_name}</td>
            <td>{m.location}</td>
            <td className="summary-cell">{m.summary}</td>
            <td className="row-actions">
              <button type="button" onClick={() => onEdit(m)}>
                Edit
              </button>
              <button type="button" className="danger" onClick={() => onDelete(m)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
