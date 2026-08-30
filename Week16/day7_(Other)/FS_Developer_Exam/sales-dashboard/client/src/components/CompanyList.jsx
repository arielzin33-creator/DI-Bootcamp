export default function CompanyList({ companies, onEdit, onDelete }) {
  if (companies.length === 0) {
    return <p className="empty-state">No companies yet. Add your first one below.</p>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Contact</th>
          <th>Email</th>
          <th>Phone</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {companies.map((c) => (
          <tr key={c.id}>
            <td>{c.name}</td>
            <td>{c.contact_name}</td>
            <td>{c.email}</td>
            <td>{c.phone}</td>
            <td className="row-actions">
              <button type="button" onClick={() => onEdit(c)}>
                Edit
              </button>
              <button type="button" className="danger" onClick={() => onDelete(c)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
