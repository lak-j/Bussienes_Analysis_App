import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage({ setIsAuthenticated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

const handleKeyDown = (e) => {
  if (e.key === "Enter") {
    handleLogin();
  }
};
  // ✅ YOUR API LOGIN (RESTORED)
  const handleLogin = async () => {
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

        setIsAuthenticated(true);
        navigate("/");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
     {loading && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    
    <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3">
      
      {/* Spinner */}
      <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>

      {/* Text */}
      <p className="text-gray-700 font-semibold">
        Logging you in...
      </p>

    </div>

  </div>
)}
      {/* LOGIN CARD */}
      <div className="w-[360px] bg-white rounded-2xl shadow-2xl p-8">

        {/* TITLE */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Login
        </h2>

        {/* USERNAME */}
        <div className="mb-4">
          <label className="text-xs text-gray-500">Username</label>

          <div className="flex items-center border-b border-gray-300 py-2">
            <span className="text-gray-400 mr-2">👤</span>

           <input
  type="text"
  placeholder="Type your username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  onKeyDown={handleKeyDown}
  className="w-full outline-none text-sm"
/>
          </div>
        </div>

       {/* PASSWORD */}
<div className="mb-2">
  <label className="text-xs text-gray-500">Password</label>

  <div className="flex items-center border-b border-gray-300 py-2">
    <span className="text-gray-400 mr-2">🔒</span>

   <input
  type={showPassword ? "text" : "password"}
  placeholder="Type your password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  onKeyDown={handleKeyDown}
  className="w-full outline-none text-sm"
/>

    <span
      onClick={() => setShowPassword(!showPassword)}
      className="text-gray-500 cursor-pointer select-none ml-2"
    >
      {showPassword ? "🙈" : "👁️"}
    </span>
  </div>
</div>

        {/* ERROR */}
        {error && (
          <p className="text-red-500 text-xs text-center mt-2">
            {error}
          </p>
        )}

        {/* FORGOT PASSWORD */}
        <div className="text-right text-xs text-gray-500 mt-2 cursor-pointer hover:text-gray-700">
          Forgot password?
        </div>

        {/* LOGIN BUTTON */}
        <button
  onClick={handleLogin}
  disabled={loading}
  className={`w-full mt-6 py-2 rounded-full text-white font-medium transition
    ${loading
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-gradient-to-r from-blue-400 to-pink-500 hover:opacity-90"
    }
  `}
>
  {loading ? "Please wait..." : "LOGIN"}
</button>

        {/* FOOTER */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Secure • Fast • Reliable
        </p>

      </div>
    </div>
  );
}