import React from "react";
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
  return (
    <div style={{ marginTop: 40 }}>
      <h3>{product} Forecast</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="ExpSmoothing"
            stroke="#8884d8"
            name="ExpSmoothing"
          />
          <Line
            type="monotone"
            dataKey="Linear"
            stroke="#82ca9d"
            name="Linear"
          />
          <Line
            type="monotone"
            dataKey="MovingAvg"
            stroke="#ff7300"
            name="MovingAvg"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}