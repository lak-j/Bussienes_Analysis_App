import React, { useState, useMemo } from "react";
import UploadForm from "./UploadForm";

export default function DashboardPage() {
  const [forecastData, setForecastData] = useState([]);
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    return forecastData.filter((d) =>
      d.Product?.toLowerCase().includes(search.toLowerCase())
    );
  }, [forecastData, search]);

  const total = forecastData.length;

  const avg =
    total > 0
      ? (
          forecastData.reduce((s, i) => s + Number(i.BestValue), 0) /
          total
        ).toFixed(2)
      : 0;

  const best =
    forecastData.length > 0
      ? [...forecastData].sort((a, b) => b.BestValue - a.BestValue)[0]
      : null;

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center py-10">

      {/* MAIN DASHBOARD */}
      <div className="w-full max-w-5xl space-y-6">

        {/* TOP BAR */}
        <div className="flex justify-between items-center bg-white rounded-xl px-5 py-4 shadow-sm">

          <h1 className="text-lg font-bold text-slate-800">
            📊 Analytics Dashboard
          </h1>

          <input
            className="w-52 px-3 py-2 text-sm rounded-lg bg-slate-50
                       focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        {/* KPI CARDS (NO BORDERS) */}
        <div className="grid grid-cols-3 gap-4">

          <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition">
            <p className="text-xs text-slate-500">Total Products</p>
            <p className="text-2xl font-bold text-slate-800">{total}</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition">
            <p className="text-xs text-slate-500">Average Value</p>
            <p className="text-2xl font-bold text-emerald-600">{avg}</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition">
            <p className="text-xs text-slate-500">Top Product</p>
            <p className="text-sm font-bold text-blue-600 truncate">
              {best?.Product || "No data"}
            </p>
          </div>

        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-3 gap-4">

          {/* UPLOAD */}
          <div className="col-span-1 bg-white rounded-xl p-4 shadow-sm">

            <h2 className="text-sm font-semibold text-slate-700 mb-3">
              Upload Data
            </h2>

            <UploadForm setForecastData={setForecastData} />

          </div>

          {/* RIGHT SIDE */}
          <div className="col-span-2 space-y-4">

            {/* INSIGHT */}
            {best && (
              <div className="bg-blue-50 rounded-xl p-4 shadow-sm">

                <p className="text-sm text-blue-800">
                  🧠 <b>Insight:</b>{" "}
                  <span className="font-semibold">{best.Product}</span>{" "}
                  is leading with{" "}
                  <span className="font-bold text-blue-600">
                    {best.BestValue}
                  </span>
                </p>

              </div>
            )}

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">

              <div className="px-4 py-3 flex justify-between items-center bg-slate-50">

                <h2 className="text-sm font-semibold text-slate-700">
                  Forecast Data
                </h2>

                <span className="text-xs text-slate-400">
                  {filteredData.length} records
                </span>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="p-3 text-left">Product</th>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Value</th>
                      <th className="p-3 text-left">Model</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredData.map((row, i) => (
                      <tr
                        key={i}
                        className="border-t border-slate-100 hover:bg-slate-50 transition"
                      >
                        <td className="p-3 font-medium text-slate-800">
                          {row.Product}
                        </td>

                        <td className="p-3 text-slate-600">
                          {row.date}
                        </td>

                        <td className="p-3 text-emerald-600 font-semibold">
                          {row.BestValue}
                        </td>

                        <td className="p-3 text-slate-600">
                          {row.BestModel}
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}