import React, { useState } from "react";

export default function ProfilePage() {
  const [username, setUsername] = useState(
    sessionStorage.getItem("username")
  );
  const role = sessionStorage.getItem("role");

  const [newUsername, setNewUsername] = useState(username);
  const [email, setEmail] = useState(
    localStorage.getItem("email") || ""
  );

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  // 🔹 PASSWORD STRENGTH
  const getStrength = () => {
    if (newPassword.length > 8) return " password strength is Strong 💪";
    if (newPassword.length > 4) return " password strength is Medium ⚠️";
    if (newPassword.length > 0) return "Password strength is Weak ❌";
    return "";
  };

  // 🔹 UPDATE PROFILE
  const handleUpdate = async () => {
    try {
      const res = await fetch("/api/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          newUsername,
          oldPassword,
          newPassword
        })
      });

      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem("username", newUsername);
        localStorage.setItem("email", email);

        setUsername(newUsername);
        setMessage("success");
      } else {
        setMessage("error");
      }
    } catch (err) {
      setMessage("error");
    }
  };

  return (
    <div className="profile-page">

      <div className="profile-card">

        {/* HEADER */}
        <div className="profile-header">
          <div className="avatar">
            {username?.charAt(0).toUpperCase()}
          </div>
          <h2>{username}</h2>
          <p className="role">{role}</p>
        </div>

        {/* ACCOUNT INFO */}
        <div className="section">
          <h3>Account Info</h3>

          <label>Username</label>
          <input
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />

          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
          />
        </div>

        {/* SECURITY */}
        <div className="section">
          <h3>Security</h3>

          <label>Current Password</label>
          <input
            type={showPassword ? "text" : "password"}
            onChange={(e) => setOldPassword(e.target.value)}
          />

          <label>New Password</label>
          <input
            type={showPassword ? "text" : "password"}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <p className="strength">{getStrength()}</p>

          <button
            className="toggle-pass"
            onClick={() => setShowPassword(!showPassword)}
          >
            👁 {showPassword ? "Hide" : "Show"} Password
          </button>
        </div>

        {/* ACTION */}
        <button className="save-btn" onClick={handleUpdate}>
          💾 Save Changes
        </button>

        {/* MESSAGE */}
        {message === "success" && (
          <div className="success">✅ Profile updated successfully</div>
        )}
        {message === "error" && (
          <div className="error">❌ Update failed</div>
        )}

      </div>
    </div>
  );
}