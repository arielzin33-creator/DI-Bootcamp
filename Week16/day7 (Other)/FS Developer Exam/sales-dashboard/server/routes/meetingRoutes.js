const express = require("express");
const db = require("../db");
const { requireAuth } = require("../authMiddleware");

const router = express.Router();
router.use(requireAuth);

const LIST_QUERY = `
  SELECT meetings.*, company_business.name AS business_name
  FROM meetings
  JOIN company_business ON company_business.id = meetings.company_id
`;

router.get("/", (req, res) => {
  const meetings = db.prepare(`${LIST_QUERY} ORDER BY meetings.date DESC, meetings.id DESC`).all();
  res.json(meetings);
});

router.get("/:id", (req, res) => {
  const meeting = db.prepare(`${LIST_QUERY} WHERE meetings.id = ?`).get(req.params.id);
  if (!meeting) return res.status(404).json({ error: "Meeting not found." });
  res.json(meeting);
});

function validate(body) {
  const { company_id, date } = body || {};
  if (!company_id) return "company_id is required.";
  if (!date) return "date is required.";
  const company = db.prepare("SELECT id FROM company_business WHERE id = ?").get(company_id);
  if (!company) return "company_id does not refer to an existing company.";
  return null;
}

router.post("/", (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });

  const { company_id, date, location, summary } = req.body;
  const info = db
    .prepare(
      `INSERT INTO meetings (company_id, date, location, summary) VALUES (?, ?, ?, ?)`
    )
    .run(company_id, date, location ?? null, summary ?? null);

  const meeting = db.prepare(`${LIST_QUERY} WHERE meetings.id = ?`).get(info.lastInsertRowid);
  res.status(201).json(meeting);
});

router.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT id FROM meetings WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Meeting not found." });

  const error = validate(req.body);
  if (error) return res.status(400).json({ error });

  const { company_id, date, location, summary } = req.body;
  db.prepare(
    `UPDATE meetings
     SET company_id = ?, date = ?, location = ?, summary = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(company_id, date, location ?? null, summary ?? null, req.params.id);

  const meeting = db.prepare(`${LIST_QUERY} WHERE meetings.id = ?`).get(req.params.id);
  res.json(meeting);
});

router.delete("/:id", (req, res) => {
  const info = db.prepare("DELETE FROM meetings WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Meeting not found." });
  res.status(204).send();
});

module.exports = router;
