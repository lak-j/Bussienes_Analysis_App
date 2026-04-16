import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "./TopProducts.css";

export default function TopProductsPage() {
  const [topProducts, setTopProducts] = useState([]);
  const [topN, setTopN] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  // FETCH DATA
  const fetchTopProducts = async (n = topN) => {
    try {
      const res = await fetch(`/api/top-products?n=${parseInt(n)}`);
      const data = await res.json();
      setTopProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTopProducts();
  }, [topN]);

  // FILTER + SORT
  const filtered = topProducts.filter(p =>
    p.Product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) =>
    sortOrder === "desc"
      ? b.BestValue - a.BestValue
      : a.BestValue - b.BestValue
  );

  const maxValue =
    sorted.length > 0
      ? Math.max(...sorted.map(p => p.BestValue))
      : 1;

  // ORDINAL
  const getOrdinal = (i) => {
    const j = i % 10, k = i % 100;
    if (j === 1 && k !== 11) return i + "st";
    if (j === 2 && k !== 12) return i + "nd";
    if (j === 3 && k !== 13) return i + "rd";
    return i + "th";
  };

  // CSV EXPORT
  const exportCSV = () => {
    const headers = ["Rank", "Product", "Value"];
    const rows = sorted.map((p, i) => [i + 1, p.Product, p.BestValue]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map(e => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "top_products.csv");
    link.click();
  };

  // PDF EXPORT
  const exportPDF = () => {
    const pdf = new jsPDF();
    pdf.text("Top Products Report", 10, 10);

    sorted.forEach((p, i) => {
      pdf.text(`${i + 1}. ${p.Product} - ${p.BestValue}`, 10, 20 + i * 10);
    });

    pdf.save("TopProducts.pdf");
  };

  return (
    <div className="top-page">
      <h2>🏆 Top Products Dashboard</h2>

      {/* CONTROLS */}
      <div className="controls">
        <input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select value={topN} onChange={(e) => setTopN(e.target.value)}>
          <option value={3}>Top 3</option>
          <option value={5}>Top 5</option>
          <option value={10}>Top 10</option>
        </select>

        <button onClick={() =>
          setSortOrder(sortOrder === "desc" ? "asc" : "desc")
        }>
          Sort ({sortOrder})
        </button>

        <button onClick={exportCSV}>CSV</button>
        <button onClick={exportPDF}>PDF</button>
      </div>

      {/* INSIGHT */}
      {sorted.length > 0 && (
        <div className="insight">
          📊 {sorted[0].Product} is leading with {sorted[0].BestValue.toFixed(2)}
        </div>
      )}

      {/* CARDS */}
      <div className="card-container">
        {sorted.map((item, index) => {
          const prev = sorted[index - 1];
          let trend = "⏺";
          if (prev) {
            if (item.BestValue > prev.BestValue) trend = "🔺";
            else if (item.BestValue < prev.BestValue) trend = "🔻";
          }

          return (
            <div
              key={index}
              className={`card ${index === 0 ? "top" : ""}`}
              onClick={() => setSelectedItem(item)}
            >
              <h3>{getOrdinal(index + 1)}</h3>

              <input
                type="checkbox"
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  if (e.target.checked)
                    setSelectedProducts([...selectedProducts, item]);
                  else
                    setSelectedProducts(
                      selectedProducts.filter(p => p.Product !== item.Product)
                    );
                }}
              />

              <p>{item.Product}</p>
              <p>{item.BestValue.toFixed(2)} {trend}</p>

              <div className="bar">
                <div
                  className="fill"
                  style={{
                    width: `${(item.BestValue / maxValue) * 100}%`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* COMPARE */}
      {selectedProducts.length > 1 && (
        <div className="compare">
          <h3>📊 Comparison</h3>
          {selectedProducts.map((p, i) => (
            <div key={i}>
              {p.Product}: {p.BestValue}
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {selectedItem && (
        <div className="modal">
          <div className="modal-content">
            <h2>{selectedItem.Product}</h2>
            <p>Value: {selectedItem.BestValue}</p>
            <p>Model: {selectedItem.BestModel}</p>
            <button onClick={() => setSelectedItem(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}