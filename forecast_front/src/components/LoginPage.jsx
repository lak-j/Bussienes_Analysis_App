import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

export default function LoginPage({ setIsAuthenticated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault(); // ✅ VERY IMPORTANT

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
        localStorage.setItem("username", username); 
      setIsAuthenticated(true);
      navigate("/"); // ✅ redirect works now
    } else {
      setError("Invalid credentials");
    }
  } catch (err) {
    console.error(err);
    setError("Server error");
  }
};

 return (
  <div className="login-wrapper">
    <div className="login-box">

      <h2>📊 Forecast Dashboard</h2>
      <p className="login-subtitle">Welcome back! Please login</p>

      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>
        
        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      </form>

      <p className="login-footer">
        Secure • Fast • Real-time Analytics
      </p>

    </div>
  </div>
);
}