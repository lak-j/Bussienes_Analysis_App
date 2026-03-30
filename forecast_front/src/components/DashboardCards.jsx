import React from "react";

export default function DashboardCards({ data }) {
  if (!data) return null;

  let total = 0;
  let count = 0;
  let models = {};

  Object.values(data).forEach(products => {
    products.forEach(item => {
      total += item.BestValue;
      count++;

      models[item.BestModel] =
        (models[item.BestModel] || 0) + 1;
    });
  });

  const avg = (total / count).toFixed(2);
  const bestModel = Object.keys(models).reduce((a, b) =>
    models[a] > models[b] ? a : b
  );

  return (
    <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
      
      {/* Total */}
      <div style={cardStyle}>
        <h4>Total Forecast</h4>
        <p>{total.toFixed(2)}</p>
      </div>

      {/* Average */}
      <div style={cardStyle}>
        <h4>Average Forecast</h4>
        <p>{avg}</p>
      </div>

      {/* Best Model */}
      <div style={cardStyle}>
        <h4>Best Model</h4>
        <p>{bestModel}</p>
      </div>

    </div>
  );
}

const cardStyle = {
  flex: 1,
  padding: 20,
  background: "#1e293b",
  color: "white",
  borderRadius: 10,
  textAlign: "center",
};