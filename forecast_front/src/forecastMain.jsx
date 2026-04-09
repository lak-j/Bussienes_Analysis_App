import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ForecastApp from "./forecastApp";
import TopProductsPage from "./components/TopProductsPage"; // ✅ correct path
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<ForecastApp />} />
        <Route path="/top-products" element={<TopProductsPage />} />
      </Routes>
    </Router>
  </React.StrictMode>
);