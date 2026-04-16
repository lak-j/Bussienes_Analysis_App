import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import "./App.css";
import ForecastApp from "./forecastApp";
import TopProductsPage from "./components/TopProductsPage";
import LoginPage from "./components/LoginPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  return (
    <BrowserRouter>
      <Routes>
       <Route
  path="/login"
  element={<LoginPage setIsAuthenticated={setIsAuthenticated} />}
/>

        <Route
          path="/"
          element={
            isAuthenticated ? <ForecastApp /> : <Navigate to="/login" />
          }
        />

        <Route
          path="/top-products"
          element={
            isAuthenticated ? <TopProductsPage /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);