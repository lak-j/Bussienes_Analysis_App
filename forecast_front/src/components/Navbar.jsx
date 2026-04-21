import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef(); // 👈 reference to dropdown

  const username = sessionStorage.getItem("username");

  const logout = () => {
    sessionStorage.clear();
    window.location.href = "/login";
  };

  // ✅ CLOSE ON OUTSIDE CLICK
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ✅ CLOSE ON SCROLL
  useEffect(() => {
    const handleScroll = () => {
      setOpen(false);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="navbar fixed top-0 left-0 w-full h-[60px] 
                    flex justify-between items-center px-6 
                    bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 
                    text-white shadow-xl z-50">

      {/* LEFT */}
      <div className="flex items-center gap-5">

        <h2
          onClick={() => navigate("/")}
          className="cursor-pointer text-lg font-bold tracking-wide 
                     hover:scale-105 transition"
        >
          📊 ForecastPro
        </h2>

        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-1.5 rounded-md text-sm font-medium 
                     text-blue-100 hover:text-white 
                     hover:bg-white/10 transition"
        >
          Dashboard
        </button>

        <button
          onClick={() => navigate("/top-products")}
          className="px-3 py-1.5 rounded-md text-sm font-medium
           text-blue-200 hover:text-white
           bg-slate-900 hover:bg-slate-800
           transition"
        >
          Top Products
        </button>

      </div>

      {/* RIGHT */}
      <div className="relative" ref={dropdownRef}>

        {/* PROFILE BUTTON */}
        <div
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 cursor-pointer 
                     px-3 py-1.5 rounded-full 
                     bg-white/10 hover:bg-white/20 
                     transition backdrop-blur-sm"
        >
          <div className="flex flex-col leading-tight text-left">
            <span className="text-xs text-gray-300">Welcome,</span>
            <span className="text-sm font-semibold text-white">
              {username}
            </span>
          </div>

          <span className="text-xs">▼</span>
        </div>

        {/* DROPDOWN */}
        {open && (
          <div className="absolute right-0 mt-3 w-44 
                          bg-white text-gray-800 
                          rounded-xl shadow-2xl overflow-hidden">

            <button
              onClick={() => {
                navigate("/profile");
                setOpen(false); // ✅ close after click
              }}
              className="w-full px-4 py-2 text-sm text-left 
                         hover:bg-gray-100 transition"
            >
              👤 Profile
            </button>

            <button
              onClick={logout}
              className="w-full px-4 py-2 text-sm text-left 
                         text-red-500 hover:bg-red-50 transition"
            >
              🚪 Logout
            </button>

          </div>
        )}

      </div>
    </div>
  );
}