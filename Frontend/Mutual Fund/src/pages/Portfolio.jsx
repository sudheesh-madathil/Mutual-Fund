// src/pages/Portfolio.js
import { useEffect, useState } from "react";
import API from "../api/Axios";

export default function Portfolio() {
  const [funds, setFunds] = useState([]);
  const [schemeCode, setSchemeCode] = useState("");
  const [units, setUnits] = useState("");

  const loadPortfolio = async () => {
    try {
      const res = await API.get("/portfolio/my");
      setFunds(res.data.portfolio);
    } catch (err) {
      console.error("Error fetching portfolio:", err);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  const addFund = async () => {
    try {
      await API.post("/portfolio/add", {
        schemeCode,
        units: Number(units),
      });
      setSchemeCode("");
      setUnits("");
      loadPortfolio();
    } catch (err) {
      console.error("Error adding fund:", err);
    }
  };

  const removeFund = async (id) => {
    try {
      await API.delete(`/portfolio/remove/${id}`);
      loadPortfolio();
    } catch (err) {
      console.error("Error removing fund:", err);
    }
  };

  return (
    <div>
      <h2>📂 My Portfolio</h2>

      {/* Add fund form */}
      <div>
        <input
          placeholder="Scheme Code"
          value={schemeCode}
          onChange={(e) => setSchemeCode(e.target.value)}
        />
        <input
          placeholder="Units"
          value={units}
          onChange={(e) => setUnits(e.target.value)}
        />
        <button onClick={addFund}>Add Fund</button>
      </div>

      {/* Fund table */}
      <table border="1" cellPadding="8" style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Scheme</th>
            <th>Units</th>
            <th>Purchase NAV</th>
            <th>Current NAV</th>
            <th>Current Value</th>
            <th>P&L</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {funds.map((fund) => (
            <tr key={fund._id}>
              <td>{fund.schemeName}</td>
              <td>{fund.units}</td>
              <td>{fund.purchaseNav}</td>
              <td>{fund.currentNav}</td>
              <td>{fund.currentValue}</td>
              <td
                style={{
                  color: fund.pnl >= 0 ? "green" : "red",
                  fontWeight: "bold",
                }}
              >
                {fund.pnl}
              </td>
              <td>
                <button onClick={() => removeFund(fund._id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
