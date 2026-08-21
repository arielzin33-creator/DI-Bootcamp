require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./db");

const username = process.env.SEED_USERNAME || "sales";
const password = process.env.SEED_PASSWORD || "sales12345";

const existing = db.prepare("SELECT id FROM sales_users WHERE username = ?").get(username);

if (existing) {
  console.log(`Sales user "${username}" already exists (id=${existing.id}), skipping.`);
} else {
  const passwordHash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare("INSERT INTO sales_users (username, password_hash) VALUES (?, ?)")
    .run(username, passwordHash);
  console.log(`Created sales user "${username}" (id=${info.lastInsertRowid}).`);
}

const companyCount = db.prepare("SELECT COUNT(*) AS count FROM company_business").get().count;

if (companyCount === 0) {
  const insertCompany = db.prepare(
    `INSERT INTO company_business (name, contact_name, email, phone, address, notes)
     VALUES (@name, @contact_name, @email, @phone, @address, @notes)`
  );
  const insertMeeting = db.prepare(
    `INSERT INTO meetings (company_id, date, location, summary) VALUES (?, ?, ?, ?)`
  );

  const companies = [
    {
      name: "Acme Corp",
      contact_name: "Jane Doe",
      email: "jane@acme.example",
      phone: "555-0100",
      address: "1 Acme Way",
      notes: "Long-standing client, quarterly renewals.",
    },
    {
      name: "Globex Inc",
      contact_name: "John Smith",
      email: "john@globex.example",
      phone: "555-0101",
      address: "42 Globex Blvd",
      notes: "Evaluating an upgrade to the enterprise plan.",
    },
    {
      name: "Initech",
      contact_name: "Peter Gibbons",
      email: "peter@initech.example",
      phone: "555-0102",
      address: "100 Initech Park",
      notes: "New lead from the trade show.",
    },
  ];

  const companyIds = companies.map((c) => insertCompany.run(c).lastInsertRowid);

  const today = new Date();
  const daysAgo = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };

  const sampleMeetings = [
    [companyIds[0], daysAgo(1), "Acme HQ, NYC", "Discussed renewal terms for next year."],
    [companyIds[0], daysAgo(3), "Zoom", "Quarterly check-in, all metrics green."],
    [companyIds[1], daysAgo(2), "Globex Office", "Walked through the upgrade proposal."],
    [companyIds[1], daysAgo(2), "Zoom", "Follow-up with the finance team."],
    [companyIds[2], daysAgo(0), "Initech Cafe", "First discovery call with Peter."],
    [companyIds[2], daysAgo(6), "Phone", "Initial outreach after the trade show."],
    [companyIds[0], daysAgo(10), "Acme HQ, NYC", "Kickoff meeting for the new integration."],
  ];

  for (const m of sampleMeetings) insertMeeting.run(...m);

  console.log(`Seeded ${companies.length} companies and ${sampleMeetings.length} meetings.`);
} else {
  console.log(`${companyCount} company/companies already exist, skipping sample data.`);
}
