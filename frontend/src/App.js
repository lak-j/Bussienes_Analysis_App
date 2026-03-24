import React, { useState, useEffect } from 'react';
import './App.css';
import DetailedMetrics from './DetailedMetrics';

function App() {
  const [data, setData] = useState({ metrics: [], reports: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    // Fetch data from the backend API
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        if (isMounted) {
          setData(jsonData);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
        console.error('There has been a problem with your fetch operation:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchData();

    return () => {
      isMounted = false;
    };
  }, []); // The empty dependency array ensures this effect runs only once on mount

  if (loading) {
    return <div className="App">Loading...</div>;
  }

  if (error) {
    return <div className="App">Error: {error.message}</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Business Analysis Dashboard</h1>
      </header>
      <main>
        <section className="metrics">
          <h2>Key Metrics/h2>
          <div className="metrics-container">
            {data.metrics.map((metric, index) => (
              <div key={index} className="metric-card">
                <h3>{metric.name}</h3>
                <p className="metric-value">
                  {metric.unit === '$' && metric.unit}
                  {metric.value.toLocaleString()}
                  {metric.unit !== '$' && metric.unit}
                </p>
                <p className={`trend trend-${metric.trend}`}>
                  Trend: {metric.trend}
                </p>
              </div>
            ))}
          </div>
        </section>
        <section className="reports">
          <h2>Recent Reports</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.reports.map(report => (
                <tr key={report.id}>
                  <td>{report.id}</td>
                  <td>{report.title}</td>
                  <td>{report.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="detailed-metrics">
          <DetailedMetrics />
        </section>
      </main>
    </div>
  );
}

export default App;