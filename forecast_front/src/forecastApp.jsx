import React, { useState } from "react";
import UploadForm from "./components/UploadForm";
import ForecastChart from "./components/ForecastChart";

export default function ForecastApp() {
  const [forecastData, setForecastData] = useState([]);

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
          Download 
        </button>
      )}

      {/* Charts */}
      {forecastData.length > 0 &&
        Array.from(new Set(forecastData.map(d => d.Product))).map(product => (
          <ForecastChart
            key={product}
            product={product}
            data={forecastData.filter(d => d.Product === product)}
          />
        ))}
    </div>
  );
}