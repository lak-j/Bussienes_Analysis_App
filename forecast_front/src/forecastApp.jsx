import React, { useState, useEffect } from "react";
import UploadForm from "./components/UploadForm";
import ForecastChart from "./components/ForecastChart";
import DashboardCards from "./components/DashboardCards";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./App.css";
import { useNavigate } from "react-router-dom";

export default function ForecastApp() {
  
  const [forecastData, setForecastData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("All");
    const [showSummary, setShowSummary] = useState(false);
   const [sortOrder, setSortOrder] = useState("asc");
   const [currentPage, setCurrentPage] = useState(1);
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");
const [topProducts, setTopProducts] = useState([]);
const [topN, setTopN] = useState(3);
// Add this state at the top with other useState
const [showTopProducts, setShowTopProducts] = useState(false);
const navigate = useNavigate();

const fetchTopProducts = async (topN = 5) => {
  console.log("TOP BUTTON CLICKED");
  try {
    // Use /api instead of localhost
    const res = await fetch(`/api/top-products?n=${topN}`);
    const data = await res.json();
    console.log("TOP PRODUCTS DATA:", data); // Debug to confirm API response
    setTopProducts(data); // Store data for rendering
  } catch (err) {
    console.error("ERROR:", err);
  }
};


const itemsPerPage = 5; // adjust how many rows/charts per page
// Filter data by selected product first
const filteredData = selectedProduct === "All"
  ? forecastData
  : forecastData.filter(d => d.Product === selectedProduct);
  //Alert for High Forecast
const highValue = forecastData.find(d => d.BestValue > 6000);
// Calculate pagination
const totalPages = Math.ceil(filteredData.length / itemsPerPage);
const paginatedData = filteredData.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);
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
const [compareProducts, setCompareProducts] = useState([]);


const fetchLatestData = async () => {
  try {
    const res = await fetch("/api/forecast_data"); // use Vite proxy
    const data = await res.json();

    console.log("REFRESH DATA:", data);

    setForecastData(data); // always update for testing
  } catch (err) {
    console.error(err);
  }
};
// useEffect(() => {
//   const interval = setInterval(() => {
//     fetch("http://localhost:8080/forecast_data")
//       .then(res => res.json())
//       .then(data => {
//         console.log("LIVE DATA:", data);

//         // ✅ DO NOT overwrite with empty/bad data
//         if (Array.isArray(data) && data.length > 0) {
//           setForecastData(data);
//         }
//       })
//       .catch(err => console.error(err));
//   }, 5000);

//   return () => clearInterval(interval);
// }, []); // ✅ MUST BE EMPTY
const downloadTableCSV = () => {
  if (paginatedData.length === 0) return;

  const headers = ["Product", "Date", "MovingAvg", "Linear", "ExpSmoothing", "BestModel"];
  const rows = paginatedData.map(d => [
    d.Product,
    d.date,
    d.MovingAvg,
    d.Linear,
    d.ExpSmoothing,
    d.BestModel
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers, ...rows].map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "filtered_forecast.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


// Add trend arrows for each row
const addTrends = (data) => {
  return data.map((row, index, arr) => {
    const previous = arr[index - 1];
    let trend = "⏺"; // neutral
    if (previous && previous.Product === row.Product) {
      if (row.BestValue > previous.BestValue) trend = "🔺"; // up
      else if (row.BestValue < previous.BestValue) trend = "🔻"; // down
    }
    return { ...row, trend };
  });
};

// Apply trend to displayed paginated data
const paginatedDataWithTrends = addTrends(paginatedData);


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
          style={{ marginLeft: "30px" }}
        >
          {showSummary ? "Hide Summary" : "Show Summary"}
        </button>
      </div>
    )}


<div style={{ marginBottom: "15px" }}>
  

  <button onClick={() => navigate("/top-products")}>
  Top Products
</button>
</div>
{
/* {topProducts.length > 0 && showTopProducts && (
  <div className="top-products-container" style={{ marginTop: "10px" }}>
    <h3>🏆 Top Products</h3>
    <ul>
      {topProducts.map((item, index) => (
        <li key={index}>
          {item.Product}: {item.BestValue.toFixed(2)}
        </li>
      ))}
    </ul>
  </div>
)} */ }



{forecastData.length > 0 && (
  <button
    onClick={downloadTableCSV}
    style={{ marginLeft: "10px" }}
  >
    Download Table CSV
  </button>
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

{/* DATE RANGE FILTER */}
{forecastData.length > 0 && (
  <div style={{ marginBottom: "15px" }}>
    <label style={{ marginRight: "10px", fontWeight: "bold" }}>
      From:
    </label>
    <input
      type="date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
    />

    <label style={{ margin: "0 10px", fontWeight: "bold" }}>
      To:
    </label>
    <input
      type="date"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
    />
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
{highValue && (
  <div className="alert-box">
    ⚠️ High Forecast Detected: {highValue.Product} ({highValue.BestValue})
  </div>
)}

{forecastData.length > 0 && (
  <div className="live-indicator">
    🟢 Live Dashboard (Auto-updating every 5s)
  </div>
)}

   {/* PAGINATED CHARTS */}
{paginatedData.length > 0 &&
  Array.from(new Set(paginatedData.map(d => d.Product))).map(product => (
    <div key={product} className="chart-container">
      <ForecastChart
        product={product}
        data={paginatedData.filter(d => d.Product === product)}
      />
    </div>
  ))
}
<div className="pagination" style={{ marginTop: "20px", textAlign: "center" }}>
  <button
    disabled={currentPage === 1}
    onClick={() => setCurrentPage(currentPage - 1)}
    style={{ marginRight: "10px" }}
  >
    Previous
  </button>

  <span>Page {currentPage} of {totalPages}</span>

  <button
    disabled={currentPage === totalPages}
    onClick={() => setCurrentPage(currentPage + 1)}
    style={{ marginLeft: "10px" }}
  >
    Next
  </button>
</div>
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

      <tbody>
  {paginatedDataWithTrends
    .sort((a, b) =>
      sortOrder === "asc" ? a.BestValue - b.BestValue : b.BestValue - a.BestValue
    )
    .map((row, index) => (
      <tr key={index}>
        <td>{row.Product}</td>
        <td>{row.date}</td>
        <td>{row.MovingAvg}</td>
        <td>{row.Linear}</td>
        <td>{row.ExpSmoothing}</td>
        <td style={{ fontWeight: "bold", color: "green" }}>
          {row.BestModel} {row.trend}
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