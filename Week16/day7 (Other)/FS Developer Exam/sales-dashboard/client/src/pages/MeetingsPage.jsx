import { useState, useEffect, useCallback } from "react";
import MeetingList from "../components/MeetingList";
import MeetingForm from "../components/MeetingForm";
import { listMeetings, createMeeting, updateMeeting, deleteMeeting } from "../api/meetingApi";
import { listCompanies } from "../api/companyApi";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [meetingsData, companiesData] = await Promise.all([listMeetings(), listCompanies()]);
      setMeetings(meetingsData);
      setCompanies(companiesData);
      setError("");
    } catch {
      setError("Failed to load meetings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleCreate(payload) {
    await createMeeting(payload);
    await refresh();
  }

  async function handleUpdate(payload) {
    await updateMeeting(editingMeeting.id, payload);
    setEditingMeeting(null);
    await refresh();
  }

  async function handleDelete(meeting) {
    if (!window.confirm(`Delete the meeting with ${meeting.business_name} on ${meeting.date}?`)) return;
    await deleteMeeting(meeting.id);
    await refresh();
  }

  return (
    <div className="page">
      <h1>Meetings</h1>
      {error && <p className="error">{error}</p>}

      <section className="card">
        <h2>All Meetings</h2>
        {loading ? <p>Loading...</p> : <MeetingList meetings={meetings} onEdit={setEditingMeeting} onDelete={handleDelete} />}
      </section>

      <section>
        {editingMeeting ? (
          <MeetingForm
            companies={companies}
            initialValue={editingMeeting}
            submitLabel="Save Changes"
            onSubmit={handleUpdate}
            onCancel={() => setEditingMeeting(null)}
          />
        ) : (
          <MeetingForm companies={companies} onSubmit={handleCreate} />
        )}
      </section>
    </div>
  );
}
