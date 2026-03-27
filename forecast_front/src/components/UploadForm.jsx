import React, { useState } from "react";
import ForecastChart from "./ForecastChart";

export default function UploadForm({ setForecastData }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("month_col", "Date");
    formData.append("sales_col", "Sales");
    formData.append("product_col", "Product");
    formData.append("months", 6);

    setLoading(true);
    setError("");

    try {
      // Make sure this matches your local backend URL
      const response = await fetch("http://127.0.0.1:5000/forecast", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch forecast. Check your backend server.");
      }

      const data = await response.json();
      setForecastData(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input type="file" accept=".xlsx" onChange={handleFileChange} />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Forecasting..." : "Upload & Forecast"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}