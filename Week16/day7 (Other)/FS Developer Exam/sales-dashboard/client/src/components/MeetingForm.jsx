import { useState, useEffect } from "react";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function emptyForm(companies) {
  return {
    company_id: companies[0]?.id || "",
    date: today(),
    location: "",
    summary: "",
  };
}

export default function MeetingForm({ companies, initialValue, onSubmit, onCancel, submitLabel }) {
  const [form, setForm] = useState(initialValue || emptyForm(companies));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initialValue || emptyForm(companies));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue]);

  // companies loads asynchronously after this component's own initial state is
  // set, so the very first render has no companies yet and company_id starts
  // empty. Once companies arrive, adopt the first one as the default — but only
  // while creating (no initialValue) and only if nothing's been chosen yet, so
  // this doesn't clobber an in-progress edit or a user's own selection.
  useEffect(() => {
    if (!initialValue && !form.company_id && companies.length > 0) {
      setForm((f) => ({ ...f, company_id: companies[0].id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companies]);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.company_id) {
      setError("Please select a business.");
      return;
    }
    if (!form.date) {
      setError("Date is required.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSubmit({ ...form, company_id: Number(form.company_id) });
      if (!initialValue) setForm(emptyForm(companies));
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h3>{initialValue ? "Edit Meeting" : "Add New Meeting Summary"}</h3>
      {error && <p className="error">{error}</p>}
      <label>
        Business Name *
        <select name="company_id" value={form.company_id} onChange={handleChange} required>
          <option value="" disabled>
            Select a company
          </option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Date *
        <input type="date" name="date" value={form.date} onChange={handleChange} required />
      </label>
      <label>
        Location
        <input name="location" value={form.location || ""} onChange={handleChange} />
      </label>
      <label>
        Summary
        <textarea name="summary" value={form.summary || ""} onChange={handleChange} rows={4} />
      </label>
      <div className="form-actions">
        <button type="submit" disabled={saving || companies.length === 0}>
          {saving ? "Saving..." : submitLabel || "Add Meeting"}
        </button>
        {onCancel && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
      {companies.length === 0 && (
        <p className="hint">Add a company on the My Business page first.</p>
      )}
    </form>
  );
}
