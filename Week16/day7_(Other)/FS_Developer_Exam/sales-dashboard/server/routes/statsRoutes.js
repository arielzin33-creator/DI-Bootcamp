const express = require("express");
const db = require("../db");
const { requireAuth } = require("../authMiddleware");

const router = express.Router();
router.use(requireAuth);

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

// GET /api/stats/meetings-per-day?days=30
// Meeting count for each of the last N days (inclusive of today), zero-filled so
// the chart doesn't silently skip days with no meetings.
router.get("/meetings-per-day", (req, res) => {
  const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 365);

  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - (days - 1));

  const rows = db
    .prepare(
      `SELECT date, COUNT(*) AS count
       FROM meetings
       WHERE date >= ? AND date <= ?
       GROUP BY date`
    )
    .all(isoDate(start), isoDate(today));

  const countsByDate = new Map(rows.map((r) => [r.date, r.count]));

  const result = [];
  for (let i = 0; i < days; i += 1) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = isoDate(d);
    result.push({ date: key, count: countsByDate.get(key) || 0 });
  }

  res.json(result);
});

// GET /api/stats/meetings-this-month
// Total meeting count for the current calendar month, plus the same count broken
// down by day (used for both the "this month" number and its bar chart).
router.get("/meetings-this-month", (req, res) => {
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const rows = db
    .prepare(
      `SELECT date, COUNT(*) AS count
       FROM meetings
       WHERE date LIKE ?
       GROUP BY date
       ORDER BY date`
    )
    .all(`${monthPrefix}-%`);

  const total = rows.reduce((sum, r) => sum + r.count, 0);

  res.json({ month: monthPrefix, total, byDay: rows });
});

// GET /api/stats/meetings-per-day-percentage
// What share of this month's meetings happened on each day it had at least one.
router.get("/meetings-per-day-percentage", (req, res) => {
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const rows = db
    .prepare(
      `SELECT date, COUNT(*) AS count
       FROM meetings
       WHERE date LIKE ?
       GROUP BY date
       ORDER BY date`
    )
    .all(`${monthPrefix}-%`);

  const total = rows.reduce((sum, r) => sum + r.count, 0);

  const result = rows.map((r) => ({
    date: r.date,
    count: r.count,
    percentage: total === 0 ? 0 : Math.round((r.count / total) * 1000) / 10,
  }));

  res.json({ month: monthPrefix, total, days: result });
});

module.exports = router;
