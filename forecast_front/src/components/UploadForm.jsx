import React, { useState } from "react";

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
      // Make sure this points to your backend
   const response = await fetch("/api/forecast", {
  method: "POST",
  body: formData,
});
      if (!response.ok) {
        throw new Error("Failed to fetch forecast. Check backend server.");
      }

      const data = await response.json();
     const formattedData = Object.keys(data).flatMap(product =>
  data[product].map(item => ({
    ...item,
    Product: product
  }))
);

setForecastData(formattedData);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
const downloadCSV = () => {
  const headers = ["Product", "Date", "MovingAvg", "Linear", "ExpSmoothing", "BestModel"];
  
  const rows = forecastData.map(d => [
    d.Product,
    d.date,
    d.MovingAvg,
    d.Linear,
    d.ExpSmoothing,
    d.BestModel
  ]);

  let csvContent =
    "data:text/csv;charset=utf-8," +
    [headers, ...rows].map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "forecast.csv");
  document.body.appendChild(link);
  link.click();
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
        
        <button onClick={downloadCSV}>
  Download CSV
</button>
      </form>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}