import React, { useState, useEffect } from 'react';

function App() {
  const [summaryData, setSummaryData] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportDetails, setReportDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the main metrics and reports list when the app loads
  useEffect(() => {
    fetch('/api/data')
      .then((res) => res.json())
      .then((data) => {
        setSummaryData(data);
        setReports(data.reports);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch data:", err);
        setLoading(false);
      });
  }, []);

  // Fetch historical data for a specific metric when clicked
  const fetchHistoricalData = (metricName) => {
    // Clear the report view when a metric is selected
    setSelectedReport(null);
    setReportDetails(null);

    // The backend expects lowercased names with underscores (e.g., "conversion_rate")
    const formattedName = metricName.toLowerCase().replace(' ', '_');
    
    fetch(`/api/data/${formattedName}`)
      .then((res) => res.json())
      .then((data) => {
        setSelectedMetric(metricName);
        setHistoricalData(data);
      })
      .catch((err) => console.error("Failed to fetch historical data:", err));
  };

  // Fetch details for a specific report when clicked
  const fetchReportDetails = (reportId) => {
    // Clear the metric view when a report is selected
    setSelectedMetric(null);
    setHistoricalData(null);

    fetch(`/api/reports/${reportId}`)
      .then((res) => res.json())
      .then((data) => {
        setSelectedReport(reportId);
        setReportDetails(data);
      })
      .catch((err) => console.error("Failed to fetch report details:", err));
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading Business Data...</div>;
  if (!summaryData) return <div style={{ padding: "20px" }}>Error loading data. Make sure Flask is running!</div>;

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", color: "#333" }}>
      <h1>Business Analysis App</h1>
      
      <h2> Click to view history</h2>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {summaryData.metrics.map((metric, index) => (
          <div 
            key={index} 
            onClick={() => fetchHistoricalData(metric.name)}
            style={{ 
              border: "1px solid #ccc", 
              padding: "20px", 
              borderRadius: "8px", 
              cursor: "pointer",
              minWidth: "150px",
              backgroundColor: selectedMetric === metric.name ? "#e3f2fd" : "#f9f9f9",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
          >
            <h3 style={{ margin: "0 0 10px 0" }}>{metric.name}</h3>
            <p style={{ fontSize: "24px", margin: "0", fontWeight: "bold" }}>
              {metric.unit === '$' ? '$' : ''}{metric.value.toLocaleString()}{metric.unit === '%' ? '%' : ''}
            </p>
            <small style={{ color: metric.trend === 'up' ? 'green' : 'gray' }}>
              Trend: {metric.trend.toUpperCase()}
            </small>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "40px" }}>
        <h2>Click to view detais</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {reports.map((report) => (
            <li
              key={report.id}
              onClick={() => fetchReportDetails(report.id)}
              style={{
                padding: "10px",
                margin: "5px 0",
                cursor: "pointer",
                border: "1px solid #eee",
                borderRadius: "4px",
                backgroundColor: selectedReport === report.id ? "#e3f2fd" : "transparent"
              }}
            >
              {report.title} - <small>{report.date}</small>
            </li>
          ))}
        </ul>
      </div>

      {selectedMetric && historicalData && (
        <div style={{ marginTop: "40px" }}>
          <h2>{selectedMetric} - Historical Data</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", maxWidth: "500px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #333" }}>
                <th style={{ padding: "10px 0" }}>Month</th>
                <th style={{ padding: "10px 0" }}>Value</th>
              </tr>
            </thead>
            <tbody>
              {historicalData.map((dataPoint, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "10px 0" }}>{dataPoint.month}</td>
                  <td style={{ padding: "10px 0" }}>{dataPoint.value.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedReport && reportDetails && (
        <div style={{ marginTop: "40px", borderTop: "2px solid #ccc", paddingTop: "20px" }}>
          <h2>{reportDetails.title}</h2>
          <p><strong>Date:</strong> {reportDetails.date} | <strong>Author:</strong> {reportDetails.author}</p>
          <p><em>{reportDetails.summary}</em></p>
          <h3>Highlights:</h3>
          <ul style={{ paddingLeft: "20px" }}>
            {reportDetails.highlights.map((highlight, index) => (
              <li key={index} style={{ marginBottom: "5px" }}>{highlight}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;