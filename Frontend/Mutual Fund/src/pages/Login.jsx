import { useState, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await API.post("/auth/login", form);
    if (res.data.success) {
      login(res.data.token);
      navigate("/dashboard");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit">Login</button>

        {/* Register link */}
        <p style={{ marginTop: "15px", fontSize: "14px", color: "#555" }}>
          Don't have an account?{" "}
          <Link to="/signup" style={{ color: "#ff758c", fontWeight: "bold" }}>
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
