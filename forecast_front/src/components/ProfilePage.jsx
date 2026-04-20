import React, { useState } from "react";

export default function ProfilePage() {
  const [username, setUsername] = useState(
    sessionStorage.getItem("username")
  );
  const role = sessionStorage.getItem("role");

  const [newUsername, setNewUsername] = useState(username);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [message, setMessage] = useState("");

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
        setUsername(newUsername);
        setMessage("✅ Profile updated successfully");
      } else {
        setMessage("❌ " + data.message);
      }
    } catch (err) {
      setMessage("❌ Server error");
    }
  };

  return (
    <div className="profile-page">
      <h2>⚙ Account Settings</h2>

      <div className="profile-card">

        {/* USERNAME */}
        <label>Username</label>
        <input
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
        />

        {/* PASSWORD */}
        <label>Current Password</label>
        <input
          type="password"
          onChange={(e) => setOldPassword(e.target.value)}
        />

        <label>New Password</label>
        <input
          type="password"
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button onClick={handleUpdate}>
          Save Changes
        </button>

        <p><strong>Role:</strong> {role}</p>

        {message && <p className="msg">{message}</p>}
      </div>
    </div>
  );
}