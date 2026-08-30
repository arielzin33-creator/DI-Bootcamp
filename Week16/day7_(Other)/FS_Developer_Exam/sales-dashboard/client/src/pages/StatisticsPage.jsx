import { useState, useEffect } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import {
  getMeetingsPerDay,
  getMeetingsThisMonth,
  getMeetingsPerDayPercentage,
} from "../api/statsApi";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

const COLORS = [
  "#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#84cc16",
];

export default function StatisticsPage() {
  const [perDay, setPerDay] = useState([]);
  const [thisMonth, setThisMonth] = useState(null);
  const [percentage, setPercentage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [perDayData, thisMonthData, percentageData] = await Promise.all([
          getMeetingsPerDay(30),
          getMeetingsThisMonth(),
          getMeetingsPerDayPercentage(),
        ]);
        setPerDay(perDayData);
        setThisMonth(thisMonthData);
        setPercentage(percentageData);
        setError("");
      } catch {
        setError("Failed to load statistics.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="page"><h1>Meeting Statistics</h1><p>Loading...</p></div>;
  if (error) return <div className="page"><h1>Meeting Statistics</h1><p className="error">{error}</p></div>;

  const perDayChart = {
    labels: perDay.map((d) => d.date.slice(5)),
    datasets: [
      {
        label: "Meetings per day",
        data: perDay.map((d) => d.count),
        backgroundColor: "#4f46e5",
      },
    ],
  };

  const thisMonthChart = {
    labels: thisMonth.byDay.map((d) => d.date.slice(5)),
    datasets: [
      {
        label: `Meetings in ${thisMonth.month}`,
        data: thisMonth.byDay.map((d) => d.count),
        backgroundColor: "#0ea5e9",
      },
    ],
  };

  const percentageChart = {
    labels: percentage.days.map((d) => d.date.slice(5)),
    datasets: [
      {
        label: "% of this month's meetings",
        data: percentage.days.map((d) => d.percentage),
        backgroundColor: percentage.days.map((_, i) => COLORS[i % COLORS.length]),
      },
    ],
  };

  return (
    <div className="page">
      <h1>Meeting Statistics</h1>

      <div className="stats-grid">
        <section className="card chart-card">
          <h2>Number of Meetings per Day</h2>
          <p className="chart-subtitle">Last 30 days</p>
          <Bar data={perDayChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </section>

        <section className="card chart-card">
          <h2>Meetings This Month</h2>
          <p className="chart-subtitle">
            <span className="big-number">{thisMonth.total}</span> total meetings in {thisMonth.month}
          </p>
          <Bar data={thisMonthChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </section>

        <section className="card chart-card">
          <h2>Percentage of Meetings per Day</h2>
          <p className="chart-subtitle">Share of this month's meetings, by day</p>
          {percentage.total === 0 ? (
            <p className="empty-state">No meetings this month yet.</p>
          ) : (
            <Doughnut data={percentageChart} options={{ responsive: true }} />
          )}
        </section>
      </div>
    </div>
  );
}
