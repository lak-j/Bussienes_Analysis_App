import React, { useState } from "react";

export default function ProfilePage() {
  const [username, setUsername] = useState(sessionStorage.getItem("username") || "User");
  const role = sessionStorage.getItem("role") || "User";

  const [newUsername, setNewUsername] = useState(username);
  const [email, setEmail] = useState(sessionStorage.getItem("email") || "");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(true);

  const getStrength = () => {
    if (newPassword.length > 8) return "Strong 💪";
    if (newPassword.length > 4) return "Medium ⚠️";
    if (newPassword.length > 0) return "Weak ❌";
    return "";
  };

  const handleReset = () => {
    setNewUsername(username);
    setEmail(localStorage.getItem("email") || "");
    setOldPassword("");
    setNewPassword("");
    setMessage("");
  };

  const handleUpdate = async () => {
    setLoading(true);
    setMessage("");

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
          newPassword,
          email
        })
      });

      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem("username", newUsername);
        sessionStorage.setItem("email", email);
        setUsername(newUsername);
        setMessage("success");
        setEditMode(false);
      } else {
        setMessage("error");
      }
    } catch {
      setMessage("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f1f5f9"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "400px",
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
      }}>

        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "15px" }}>
          <div style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            background: "#3b82f6",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "auto",
            fontWeight: "bold"
          }}>
            {newUsername.charAt(0).toUpperCase()}
          </div>

          <h3>{newUsername}</h3>
          <p style={{ fontSize: "12px", color: "gray" }}>{role}</p>
        </div>

        {/* EDIT BUTTON */}
        <button
          onClick={() => setEditMode(!editMode)}
          style={{
            marginBottom: "10px",
            padding: "5px 10px",
            fontSize: "12px",
            background: "#1e4dda",
            borderRadius: "5px",
            border: "none",
            cursor: "pointer"
          }}
        >
          {editMode ? "View" : "Edit"}
        </button>

        {/* INPUTS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <input
            disabled={!editMode}
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Username"
          />

          <input
            disabled={!editMode}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />

          <input
            disabled={!editMode}
            type={showPassword ? "text" : "password"}
            placeholder="Current Password"
            onChange={(e) => setOldPassword(e.target.value)}
          />

          <input
            disabled={!editMode}
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <small>{getStrength()}</small>

          <button
            onClick={() => setShowPassword(!showPassword)}
            style={{ fontSize: "12px" }}
          >
            Show/Hide Password
          </button>
        </div>

        {/* ACTIONS */}
        <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
          <button
            onClick={handleUpdate}
            disabled={loading}
            style={{
              flex: 1,
              padding: "8px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px"
            }}
          >
            {loading ? "Saving..." : "Save"}
          </button>

          <button
            onClick={handleReset}
            style={{
              flex: 1,
              padding: "8px",
              background: "#417ef8",
              border: "none",
              borderRadius: "6px"
            }}
          >
            Reset
          </button>
        </div>

        {/* MESSAGE */}
        {message === "success" && (
          <p style={{ color: "green", marginTop: "10px" }}>
            Updated successfully
          </p>
        )}

        {message === "error" && (
          <p style={{ color: "red", marginTop: "10px" }}>
            Update failed
          </p>
        )}

      </div>
    </div>
  );
}