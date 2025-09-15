import { useState } from "react";
import API from "../api/axios";

export default function FundSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const searchFunds = async () => {
    const res = await API.get(`https://api.mfapi.in/mf`);
    const filtered = res.data.filter((f) => f.schemeName.toLowerCase().includes(query.toLowerCase()));
    setResults(filtered.slice(0, 10));
  };

  const addFund = async (schemeCode) => {
    await API.post("/portfolio", { schemeCode, units: 10 });
    alert("Added to portfolio!");
  };

  return (
    <div>
      <input placeholder="Search Mutual Fund" value={query} onChange={(e) => setQuery(e.target.value)} />
      <button onClick={searchFunds}>Search</button>
      <ul>
        {results.map((fund) => (
          <li key={fund.schemeCode}>
            {fund.schemeName} <button onClick={() => addFund(fund.schemeCode)}>Add</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
