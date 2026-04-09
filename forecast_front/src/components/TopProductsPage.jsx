import React, { useState, useEffect } from "react";
import "./TopProducts.css"; // we will create this

export default function TopProductsPage() {
  const [topProducts, setTopProducts] = useState([]);
  const [topN, setTopN] = useState(5);

  const fetchTopProducts = async (n = topN) => {
    try {
      const res = await fetch(`/api/top-products?n=${parseInt(n)}`);
      const data = await res.json();
      setTopProducts(data);
    } catch (err) {
      console.error("Error fetching top products:", err);
    }
  };

  useEffect(() => {
    fetchTopProducts();
  }, [topN]);

  // ordinal helper
  const getOrdinal = (i) => {
    const j = i % 10,
      k = i % 100;
    if (j === 1 && k !== 11) return i + "st";
    if (j === 2 && k !== 12) return i + "nd";
    if (j === 3 && k !== 13) return i + "rd";
    return i + "th";
  };

  // max value for progress bar
  const maxValue =
    topProducts.length > 0
      ? Math.max(...topProducts.map((p) => p.BestValue))
      : 1;

  return (
    <div className="top-products-page">
      <h2>🏆 Top Performing Products</h2>

      <div className="controls">
        <label>
          Top N:
          <select
            value={topN}
            onChange={(e) => setTopN(e.target.value)}
          >
            <option value={3}>Top 3</option>
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
          </select>
        </label>

        <button onClick={() => fetchTopProducts()}>
          🔄 Refresh
        </button>
      </div>

      {topProducts.length === 0 ? (
        <p>No data available</p>
      ) : (
        <div className="cards-container">
          {topProducts.map((item, index) => (
            <div
              key={index}
              className={`product-card ${
                index === 0 ? "top-card" : ""
              }`}
            >
              <h3>{getOrdinal(index + 1)}</h3>
              <p className="product-name">{item.Product}</p>

              <p className="value">
                {item.BestValue.toFixed(2)}
              </p>

              {/* Progress Bar */}
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${(item.BestValue / maxValue) * 100}%`,
                  }}
                ></div>
              </div>

              {index === 0 && (
                <p className="badge">⭐ Best Performer</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}