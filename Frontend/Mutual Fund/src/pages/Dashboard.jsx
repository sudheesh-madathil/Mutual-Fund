// src/pages/Dashboard.js
import { useEffect, useState } from "react";
import API from "../api/Axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/portfolio/my");
        setPortfolio(res.data.portfolio);

        const historyRes = await API.get("/portfolio/history");
        setHistory(historyRes.data.history);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      }
    };
    fetchData();
  }, []);

  const chartData = portfolio.map((p) => ({
    name: p.schemeName,
    value: p.currentValue,
  }));

  return (
    <div>
      <h2>📊 Portfolio Dashboard</h2>

      {/* Pie chart for distribution */}
      <PieChart width={400} height={300}>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          outerRadius={120}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={index}
              fill={["#8884d8", "#82ca9d", "#ffc658"][index % 3]}
            />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>

      {/* Line chart for historical performance */}
      <LineChart width={600} height={300} data={history}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="portfolioValue"
          stroke="#8884d8"
          strokeWidth={2}
        />
      </LineChart>
    </div>
  );
}
