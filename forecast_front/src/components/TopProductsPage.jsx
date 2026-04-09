import React, { useState, useEffect } from "react";

export default function TopProductsPage() {
  const [topProducts, setTopProducts] = useState([]);
  const [topN, setTopN] = useState(5);

  const fetchTopProducts = async (n = topN) => {
    try {
      const res = await fetch(`/api/top-products?n=${n}`); // use Vite proxy
      const data = await res.json();
      setTopProducts(data);
    } catch (err) {
      console.error("Error fetching top products:", err);
    }
  };

  useEffect(() => {
    fetchTopProducts();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>🏆 Top Products</h2>
      <label>
        Top N:
        <select value={topN} onChange={(e) => setTopN(e.target.value)}>
          <option value={3}>Top 3</option>
          <option value={5}>Top 5</option>
          <option value={10}>Top 10</option>
        </select>
      </label>
      <button onClick={() => fetchTopProducts()}>Refresh</button>

      <ul>
        {topProducts.map((item, index) => (
          <li key={index}>
            {item.Product}: {item.BestValue.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}