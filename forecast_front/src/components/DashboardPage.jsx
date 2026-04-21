import React, { useState } from "react";
import UploadForm from "./UploadForm";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const [forecastData, setForecastData] = useState([]);

  return (
    <div className="mt-[70px] px-6 bg-gray-50 min-h-screen">

      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        📊 Dashboard
      </h1>

      {/* UPLOAD */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">Upload Data</h2>
        <UploadForm setForecastData={setForecastData} />
      </div>

      {/* SHOW DATA */}
      {forecastData.length > 0 && (
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-3">Forecast Data</h2>

          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Product</th>
                <th className="p-2">Date</th>
                <th className="p-2">Best Value</th>
                <th className="p-2">Model</th>
              </tr>
            </thead>

            <tbody>
              {forecastData.map((row, i) => (
                <tr key={i} className="text-center border-t">
                  <td className="p-2">{row.Product}</td>
                  <td className="p-2">{row.date}</td>
                  <td className="p-2">{row.BestValue}</td>
                  <td className="p-2">{row.BestModel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}