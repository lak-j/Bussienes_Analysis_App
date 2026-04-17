import React from "react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const username = sessionStorage.getItem("username");
  const role = sessionStorage.getItem("role");

  return (
    <div className="profile-page">
      <h2>👤 User Profile</h2>

      <div className="profile-card">
         <p className="profile-note">
           your account information.
        </p>
        <p><strong>Username:</strong> {username}</p>
        <p><strong>Role:</strong> {role}</p>

       
      </div>
    </div>
  );
}