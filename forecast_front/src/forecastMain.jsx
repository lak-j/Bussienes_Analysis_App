import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
// import "./App.css";
import ForecastApp from "./forecastApp";
import TopProductsPage from "./components/TopProductsPage";
import LoginPage from "./components/LoginPage";
import ProfilePage from "./components/ProfilePage";
import DashboardPage from "./components/DashboardPage";

function App() {
 const [isAuthenticated, setIsAuthenticated] = useState(
  !!sessionStorage.getItem("token")   // ✅ change here
);
  return (
    <BrowserRouter>
      <Routes>
       <Route
  path="/login"
  element={<LoginPage setIsAuthenticated={setIsAuthenticated} />}
/>
<Route
  path="/profile"
  element={
    isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />
  }
/>
        <Route
          path="/"
          element={
            isAuthenticated ? <ForecastApp /> : <Navigate to="/login" />
          }
        />

<Route
  path="/dashboard"
  element={
    isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />
  }
/>
       <Route
  path="/top-products"
  element={
    isAuthenticated && sessionStorage.getItem("role") === "admin"
      ? <TopProductsPage />
      : <Navigate to="/" />
  }
/>
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);