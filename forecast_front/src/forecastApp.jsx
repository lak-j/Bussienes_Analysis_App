import React, { useState } from "react";
import UploadForm from "./components/UploadForm";
import ForecastChart from "./components/ForecastChart";
import DashboardCards from "./components/DashboardCards";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ForecastApp() {
  
  const [forecastData, setForecastData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("All");
const exportPDF = async () => {
  const pdf = new jsPDF("p", "mm", "a4");

  const charts = document.querySelectorAll(".chart-container");

  let yPosition = 10;

  for (let i = 0; i < charts.length; i++) {
    const canvas = await html2canvas(charts[i]);
    const imgData = canvas.toDataURL("image/png");

    pdf.text(`Forecast - ${i + 1}`, 10, yPosition);
    yPosition += 5;

    pdf.addImage(imgData, "PNG", 10, yPosition, 180, 80);
    yPosition += 90;

    // New page if space ends
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 10;
    }
  }

  pdf.save("Forecast_Report.pdf");
};
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Sales Forecasting App
      </h1>

      <UploadForm setForecastData={setForecastData} />

      {/*  DOWNLOAD BUTTON  */}
      {forecastData.length > 0 && (
        <button
          onClick={() => {
            window.open("http://localhost:8080/download", "_blank");
          }}
          className="bg-green-500 text-white px-4 py-2 rounded mb-4"
        >
          Download Excel
        </button>
      )}
{forecastData.length > 0 && (
  <button
    onClick={exportPDF}
    className="bg-red-500 text-white px-4 py-2 rounded mb-4 ml-2"
  >
    Export PDF charts
  </button>
)}
{forecastData.length > 0 && (
  <div className="mb-4">
    <label className="mr-2 font-semibold">Filter Product:</label>
    <select
      value={selectedProduct}
      onChange={(e) => setSelectedProduct(e.target.value)}
      className="border px-2 py-1 rounded"
    >
      <option value="All">All</option>
      {Array.from(new Set(forecastData.map(d => d.Product))).map(p => (
        <option key={p} value={p}>{p}</option>
      ))}
    </select>
  </div>
)}
      {/* Charts */}
      {forecastData.length > 0 &&
  (selectedProduct === "All" 
    ? Array.from(new Set(forecastData.map(d => d.Product)))
    : [selectedProduct]
  ).map(product => (
    <ForecastChart
      key={product}
      product={product}
      data={forecastData.filter(d => d.Product === product)}
    />
  ))
}
    </div>
  );
}