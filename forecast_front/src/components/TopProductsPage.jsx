import React, { useState, useEffect } from "react";

export default function TopProductsPage() {
  const [topProducts, setTopProducts] = useState([]);
  const [topN, setTopN] = useState(5);

  const fetchTopProducts = async (n = topN) => {
    try {
      const res = await fetch(`/api/top-products?n=${parseInt(n)}`); // ✅ ensure number
      const data = await res.json();
      setTopProducts(data);
    } catch (err) {
      console.error("Error fetching top products:", err);
    }
  };

  // fetch when component mounts or topN changes
  useEffect(() => {
    fetchTopProducts();
  }, [topN]);

  // Helper for ordinal numbers
  const getOrdinal = (i) => {
    const j = i % 10,
      k = i % 100;
    if (j === 1 && k !== 11) return i + "st";
    if (j === 2 && k !== 12) return i + "nd";
    if (j === 3 && k !== 13) return i + "rd";
    return i + "th";
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>🏆 Top Products</h2>

      <label style={{ marginRight: "10px" }}>
        Top N:
        <select
          value={topN}
          onChange={(e) => setTopN(e.target.value)}
          style={{ marginLeft: "5px" }}
        >
          <option value={3}>Top 3</option>
          <option value={5}>Top 5</option>
          <option value={10}>Top 10</option>
        </select>
      </label>

      <button onClick={() => fetchTopProducts()} style={{ marginLeft: "10px" }}>
        Refresh
      </button>

      {topProducts.length === 0 ? (
        <p>No top products available</p>
      ) : (
        <ul style={{ marginTop: "20px" }}>
          {topProducts.map((item, index) => (
            <li key={index}>
              {getOrdinal(index + 1)}: {item.Product} - {item.BestValue.toFixed(2)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}