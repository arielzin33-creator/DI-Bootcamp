const express = require("express");
const db = require("../db");
const { requireAuth } = require("../authMiddleware");

const router = express.Router();
router.use(requireAuth);

const FIELDS = ["name", "contact_name", "email", "phone", "address", "notes"];

function pickFields(body) {
  const data = {};
  for (const f of FIELDS) data[f] = body[f] ?? null;
  return data;
}

router.get("/", (req, res) => {
  const companies = db
    .prepare("SELECT * FROM company_business ORDER BY name COLLATE NOCASE")
    .all();
  res.json(companies);
});

router.get("/:id", (req, res) => {
  const company = db
    .prepare("SELECT * FROM company_business WHERE id = ?")
    .get(req.params.id);
  if (!company) return res.status(404).json({ error: "Company not found." });
  res.json(company);
});

router.post("/", (req, res) => {
  const { name } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "name is required." });
  }

  const data = pickFields(req.body);
  const info = db
    .prepare(
      `INSERT INTO company_business (name, contact_name, email, phone, address, notes)
       VALUES (@name, @contact_name, @email, @phone, @address, @notes)`
    )
    .run(data);

  const company = db
    .prepare("SELECT * FROM company_business WHERE id = ?")
    .get(info.lastInsertRowid);
  res.status(201).json(company);
});

router.put("/:id", (req, res) => {
  const existing = db
    .prepare("SELECT * FROM company_business WHERE id = ?")
    .get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Company not found." });

  const { name } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "name is required." });
  }

  const data = pickFields(req.body);
  db.prepare(
    `UPDATE company_business
     SET name = @name, contact_name = @contact_name, email = @email, phone = @phone,
         address = @address, notes = @notes, updated_at = datetime('now')
     WHERE id = @id`
  ).run({ ...data, id: req.params.id });

  const company = db
    .prepare("SELECT * FROM company_business WHERE id = ?")
    .get(req.params.id);
  res.json(company);
});

router.delete("/:id", (req, res) => {
  const info = db.prepare("DELETE FROM company_business WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Company not found." });
  res.status(204).send();
});

module.exports = router;
