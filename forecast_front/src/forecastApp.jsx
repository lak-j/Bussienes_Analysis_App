import React, { useState } from "react";
import UploadForm from "./components/UploadForm";
import ForecastChart from "./components/ForecastChart";
import DashboardCards from "./components/DashboardCards";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./App.css";

export default function ForecastApp() {
  
  const [forecastData, setForecastData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("All");
    const [showSummary, setShowSummary] = useState(false);
   const [sortOrder, setSortOrder] = useState("asc");
  const totalProducts = Array.from(new Set(forecastData.map(d => d.Product))).length;

const totalMonths = forecastData.length > 0
  ? forecastData.filter(d => d.Product === forecastData[0].Product).length
  : 0;

const allValues = forecastData.flatMap(d => [
  d.MovingAvg, d.Linear, d.ExpSmoothing
]);

const averageForecast = allValues.length > 0
  ? (allValues.reduce((a, b) => a + b, 0) / allValues.length).toFixed(2)
  : 0;

const maxForecast = allValues.length > 0
  ? Math.max(...allValues).toFixed(2)
  : 0;
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

const topProduct =
  forecastData.length > 0
    ? forecastData.reduce((max, item) =>
        item.BestValue > max.BestValue ? item : max
      )
    : null;

 return (
  <div className="app">

    {/* HEADER */}
    <div className="header">
      <h1>📊 Business Forecasting </h1>
    </div>

    {/* UPLOAD */}
    <UploadForm setForecastData={setForecastData} />

    {/* ACTION BUTTONS */}
    {forecastData.length > 0 && (
      <div style={{ marginBottom: "15px" }}>
        <button onClick={() => window.open("http://localhost:8080/download", "_blank")}>
          Download Excel
        </button>

        <button onClick={exportPDF} style={{ marginLeft: "10px" }}>
          Export PDF
        </button>

        <button
          onClick={() => setShowSummary(!showSummary)}
          style={{ marginLeft: "10px" }}
        >
          {showSummary ? "Hide Summary" : "Show Summary"}
        </button>
      </div>
    )}

    {/* FILTER */}
    {forecastData.length > 0 && (
      <div style={{ marginBottom: "15px" }}>
        <label style={{ marginRight: "10px", fontWeight: "bold" }}>
          Filter Product:
        </label>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
        >
          <option value="All">All</option>
          {Array.from(new Set(forecastData.map(d => d.Product))).map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
    )}

    {/* SUMMARY CARDS */}
    {showSummary && (
      <div className="card-container">
        <div className="card blue">
          <h4>Total Products</h4>
          <p>{totalProducts}</p>
        </div>

        <div className="card green">
          <h4>Months Forecasted</h4>
          <p>{totalMonths}</p>
        </div>

        <div className="card yellow">
          <h4>Average Forecast</h4>
          <p>{averageForecast}</p>
        </div>

        <div className="card red">
          <h4>Max Forecast</h4>
          <p>{maxForecast}</p>
        </div>
      </div>
    )}
  {/* top products */}
{topProduct && (
  <div className="top-product">
    🏆 Top Product: <strong>{topProduct.Product}</strong>  
    ({topProduct.BestValue})
  </div>
)}

    {/* CHARTS */}
    {forecastData.length > 0 &&
      (selectedProduct === "All"
        ? Array.from(new Set(forecastData.map(d => d.Product)))
        : [selectedProduct]
      ).map(product => (
        <div key={product} className="chart-container">
          <ForecastChart
            product={product}
            data={forecastData.filter(d => d.Product === product)}
          />
        </div>
      ))
    }
    <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
  Sort by Best Value ({sortOrder})
</button>
{forecastData.length > 0 && (
  <div className="table-container">
    <h3>Forecast Data Table</h3>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Date</th>
          <th>Moving Avg</th>
          <th>Linear</th>
          <th>Exp Smoothing</th>
          <th>Best Model</th>
        </tr>
      </thead>
      <tbody>
        {forecastData.sort((a, b) =>
    sortOrder === "asc"
      ? a.BestValue - b.BestValue
      : b.BestValue - a.BestValue
  ).map((row, index) => (
          <tr key={index}>
            <td>{row.Product}</td>
            <td>{row.date}</td>
            <td>{row.MovingAvg}</td>
            <td>{row.Linear}</td>
            <td>{row.ExpSmoothing}</td>
            <td style={{ fontWeight: "bold", color: "green" }}>
  {row.BestModel}
</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
  
 
    
    </div>
    
  );
}