require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const companyRoutes = require("./routes/companyRoutes");
const meetingRoutes = require("./routes/meetingRoutes");
const statsRoutes = require("./routes/statsRoutes");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/stats", statsRoutes);

app.use((req, res) => res.status(404).json({ error: "Not found." }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`Sales dashboard API listening on http://localhost:${PORT}`);
});
