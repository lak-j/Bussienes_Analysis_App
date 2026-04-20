import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

export default function LoginPage({ setIsAuthenticated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [capsLock, setCapsLock] = useState(false);

  const navigate = useNavigate();

  // Load remembered user
  useEffect(() => {
    const savedUser = localStorage.getItem("username");
    if (savedUser) setUsername(savedUser);
  }, []);

  const validate = () => {
    if (!username.trim()) return "Username is required";
    if (!password.trim()) return "Password is required";
    if (password.length < 4) return "Password too short";
    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("username", data.username);
        sessionStorage.setItem("role", data.role);

        if (rememberMe) {
          localStorage.setItem("username", data.username);
        }

        setIsAuthenticated(true);
        navigate("/");
      } else {
        setAttempts((prev) => prev + 1);
        setError(data.message || "Invalid credentials");

        if (attempts >= 4) {
          setError("Too many failed attempts. Try again later.");
        }
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return "";
    if (password.length < 4) return "Weak";
    if (password.length < 8) return "Medium";
    return "Strong";
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">

        <h2>📊 Forecast Dashboard</h2>
        <p className="login-subtitle">Secure Login Portal</p>

        <form onSubmit={handleLogin}>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
            }}
          />

          <div className="password-box">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onKeyUp={(e) => setCapsLock(e.getModifierState("CapsLock"))}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
            />

            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {capsLock && (
            <p className="warning-text">⚠ Caps Lock is ON</p>
          )}

          <p className="strength">
            Password strength: {getPasswordStrength()}
          </p>

          <label className="remember">
            
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              
            />
            Remember me
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          {error && <p className="error-text">{error}</p>}

          <p className="forgot" onClick={() => alert("Reset link sent!")}>
            Forgot password?
          </p>

          <p className="attempts">
            Failed attempts: {attempts}
          </p>

        </form>

        <p className="login-footer">
          Secure • Audited • Enterprise Ready
        </p>

      </div>
    </div>
  );
}