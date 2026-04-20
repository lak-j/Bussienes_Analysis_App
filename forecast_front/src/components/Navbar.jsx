import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const username = sessionStorage.getItem("username");
const profileImage = localStorage.getItem("profileImage");
  const logout = () => {
    sessionStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="navbar">

      {/* LEFT */}
      <div className="nav-left">
        <h2 onClick={() => navigate("/")}>📊 Business Forecasting</h2>
        <button onClick={() => navigate("/")}>Dashboard</button>
        <button onClick={() => navigate("/top-products")}>
          Top Products
        </button>
      </div>
{/* <div className="profile-trigger" onClick={() => setOpen(!open)}>
  {profileImage ? (
    <img src={profileImage} className="nav-avatar" />
  ) : (
    <span>👤</span>
  )}
  {username} ▼
</div> */}
      {/* RIGHT */}
      <div className="nav-right">
        <div
          className="profile-trigger"
          onClick={() => setOpen(!open)}
        >
          👤 Welcome, {username} ▼
        </div>

        {open && (
          <div className="dropdown">
            <button onClick={() => navigate("/profile")}>
              👤 Profile
            </button>

            <button onClick={logout}>
              🚪 Logout
            </button>
          </div>
        )}
      </div>

    </div>
  );
}