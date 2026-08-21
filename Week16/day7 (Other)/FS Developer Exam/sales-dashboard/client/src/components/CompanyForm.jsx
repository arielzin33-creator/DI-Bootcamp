import { useState, useEffect } from "react";

const EMPTY = { name: "", contact_name: "", email: "", phone: "", address: "", notes: "" };

export default function CompanyForm({ initialValue, onSubmit, onCancel, submitLabel }) {
  const [form, setForm] = useState(initialValue || EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initialValue || EMPTY);
  }, [initialValue]);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Company name is required.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSubmit(form);
      if (!initialValue) setForm(EMPTY);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h3>{initialValue ? "Edit Company" : "Add New Company"}</h3>
      {error && <p className="error">{error}</p>}
      <label>
        Company Name *
        <input name="name" value={form.name} onChange={handleChange} required />
      </label>
      <label>
        Contact Name
        <input name="contact_name" value={form.contact_name || ""} onChange={handleChange} />
      </label>
      <label>
        Email
        <input type="email" name="email" value={form.email || ""} onChange={handleChange} />
      </label>
      <label>
        Phone
        <input name="phone" value={form.phone || ""} onChange={handleChange} />
      </label>
      <label>
        Address
        <input name="address" value={form.address || ""} onChange={handleChange} />
      </label>
      <label>
        Notes
        <textarea name="notes" value={form.notes || ""} onChange={handleChange} rows={3} />
      </label>
      <div className="form-actions">
        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : submitLabel || "Add Company"}
        </button>
        {onCancel && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
