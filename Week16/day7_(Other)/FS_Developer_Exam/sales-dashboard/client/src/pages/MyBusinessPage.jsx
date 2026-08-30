import { useState, useEffect, useCallback } from "react";
import CompanyList from "../components/CompanyList";
import CompanyForm from "../components/CompanyForm";
import { listCompanies, createCompany, updateCompany, deleteCompany } from "../api/companyApi";

export default function MyBusinessPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCompany, setEditingCompany] = useState(null);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setCompanies(await listCompanies());
      setError("");
    } catch {
      setError("Failed to load companies.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleCreate(payload) {
    await createCompany(payload);
    await refresh();
  }

  async function handleUpdate(payload) {
    await updateCompany(editingCompany.id, payload);
    setEditingCompany(null);
    await refresh();
  }

  async function handleDelete(company) {
    if (!window.confirm(`Delete "${company.name}"? This also deletes its meetings.`)) return;
    await deleteCompany(company.id);
    await refresh();
  }

  return (
    <div className="page">
      <h1>My Business</h1>
      {error && <p className="error">{error}</p>}

      <section className="card">
        <h2>Companies</h2>
        {loading ? <p>Loading...</p> : <CompanyList companies={companies} onEdit={setEditingCompany} onDelete={handleDelete} />}
      </section>

      <section>
        {editingCompany ? (
          <CompanyForm
            initialValue={editingCompany}
            submitLabel="Save Changes"
            onSubmit={handleUpdate}
            onCancel={() => setEditingCompany(null)}
          />
        ) : (
          <CompanyForm onSubmit={handleCreate} />
        )}
      </section>
    </div>
  );
}
