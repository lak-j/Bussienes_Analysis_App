import React, { useRef } from "react";
import html2canvas from "html2canvas";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ForecastChart({ product, data }) {
  const chartRef = useRef();

  // ✅ Download function
  const downloadChart = async () => {
    if (!chartRef.current) return;

    const canvas = await html2canvas(chartRef.current);
    const link = document.createElement("a");

    link.download = `Forecast_${product}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div style={{ marginTop: 40 }}>
      <h3>{product} Forecast</h3>

      {/* ✅ WRAP CHART WITH REF */}
      <div ref={chartRef}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Line
              type="monotone"
              dataKey="ExpSmoothing"
              stroke="#8884d8"
            />
            <Line
              type="monotone"
              dataKey="Linear"
              stroke="#82ca9d"
            />
            <Line
              type="monotone"
              dataKey="MovingAvg"
              stroke="#ff7300"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ✅ DOWNLOAD BUTTON */}
      <button
        onClick={downloadChart}
        style={{
          marginTop: 10,
          padding: "6px 12px",
          background: "purple",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Download Chart
      </button>
    </div>
  );
}