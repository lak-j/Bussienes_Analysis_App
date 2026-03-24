import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [businessData, setBusinessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Flag to track if the component is mounted

    const fetchData = async () => {
      try {
        const response = await fetch('/api/data'); // Cloud Shell: relative path
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (isMounted) {
          setBusinessData(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function to set isMounted to false when the component unmounts
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  if (loading) return <div className="App">Loading...</div>;
  if (error) return <div className="App">Error: {error.message}</div>;
  // Defensive rendering: ensure businessData and its properties exist before accessing
  if (!businessData || !businessData.metrics || !businessData.reports) {
    return <div className="App">No data available.</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Business Dashboard</h1>
      </header>
      <main>
        <section>
          <h2>Metrics</h2>
          {businessData.metrics.map((metric, idx) => (
            <div key={idx}> {/* Using index as key is acceptable for static lists */}
              <strong>{metric.name}: {metric.value}{metric.unit}</strong> ({metric.trend})
            </div>
          ))}
        </section>
        <section>
          <h2>Reports</h2>
          {businessData.reports.map(report => (
            <div key={report.id}>{report.title} - {report.date}</div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default App;