import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

export default function LoginPage({ setIsAuthenticated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    console.log("LOGIN CLICKED");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      console.log(data);

      if (data.success) {
        localStorage.setItem("token", data.token);
        setIsAuthenticated(true);
        navigate("/"); // ✅ redirect
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      setError("Server error");
    }
  };

  return (
    <div className="login-container">
      <h2>🔐 Login</h2>

      <input
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="button" onClick={handleLogin}>
        Login
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}