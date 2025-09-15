// src/pages/Dashboard.js
import { useEffect, useState } from "react";
import API from "../api/axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState([]);
  const [summary, setSummary] = useState(null);
  const [form, setForm] = useState({ schemeCode: "", units: "", purchaseNav: "" });

  // ✅ Fetch holdings & summary
  const fetchData = async () => {
    try {
      const res = await API.get("/portfolio"); // listHoldings
      setPortfolio(res.data.holdings);

      const summaryRes = await API.get("/portfolio/summary"); // getSummary
      setSummary(summaryRes.data.summary);
    } catch (err) {
      console.error("Error loading dashboard:", err);
    }
  };

  // ➕ Add holding
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await API.post("/portfolio/add", {
        schemeCode: form.schemeCode,
        units: parseFloat(form.units),
        purchaseNav: parseFloat(form.purchaseNav),
      });
      setForm({ schemeCode: "", units: "", purchaseNav: "" });
      fetchData();
    } catch (err) {
      console.error("Error adding holding:", err);
    }
  };

  // ❌ Delete holding
  const handleDelete = async (id) => {
    try {
      await API.delete(`/portfolio/${id}`);
      fetchData();
    } catch (err) {
      console.error("Error deleting holding:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const chartData = portfolio.map((p) => ({
    name: p.schemeName,
    value: p.units,
  }));

  return (
    <div style={{ padding: "20px" }}>
      <h2>📊 Portfolio Dashboard</h2>

      {/* Summary */}
      {summary && (
        <div style={{ marginBottom: "20px" }}>
          <p><b>Invested:</b> ₹{summary.invested}</p>
          <p><b>Current Value:</b> ₹{summary.current}</p>
          <p><b>Profit/Loss:</b> ₹{summary.profitLoss}</p>
        </div>
      )}

      {/* Add Holding Form */}
      <h3>Add Holding</h3>
      <form onSubmit={handleAdd} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Scheme Code"
          value={form.schemeCode}
          onChange={(e) => setForm({ ...form, schemeCode: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Units"
          value={form.units}
          onChange={(e) => setForm({ ...form, units: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Purchase NAV"
          value={form.purchaseNav}
          onChange={(e) => setForm({ ...form, purchaseNav: e.target.value })}
        />
        <button type="submit">Add</button>
      </form>

      {/* Holdings Table */}
      <h3>My Holdings</h3>
      {portfolio.length === 0 ? (
        <p>No holdings found.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ marginBottom: "20px" }}>
          <thead>
            <tr>
              <th>Scheme Name</th>
              <th>Units</th>
              <th>Added At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map((p) => (
              <tr key={p.id}>
                <td>{p.schemeName}</td>
                <td>{p.units}</td>
                <td>{new Date(p.addedAt).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleDelete(p.id)}>❌ Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pie chart */}
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
    </div>
  );
}
