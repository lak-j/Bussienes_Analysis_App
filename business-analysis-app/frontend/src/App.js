import React, { useState, useEffect } from 'react';
import './App.css';
import DetailedMetrics from './DetailedMetrics';

function App() {
  const [data, setData] = useState({ metrics: [], reports: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const [dataResponse, analysisResponse] = await Promise.all([
          fetch('/api/data'),
          fetch('/api/analysis')
        ]);

        if (!dataResponse.ok || !analysisResponse.ok) {
          throw new Error(`HTTP error!`);
        }

        const jsonData = await dataResponse.json();
        const jsonAnalysisData = await analysisResponse.json();

        if (isMounted) {
          setData(jsonData);
          setAnalysisData(jsonAnalysisData);
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
    return <div className="App">Load...</div>;
  }

  if (error) {
    return <div className="App">Error: {error.message}</div>;
  }

  const handleReportAdded = (newReport) => {
    setData(prevData => ({
      ...prevData,
      reports: [...prevData.reports, newReport]
    }));
  };

  const handleDeleteReport = async (reportId) => {
    // User confirmation is a good practice for destructive actions
    if (!window.confirm("Are you sure you want to delete this report?")) {
      return;
    }

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete report.');
      }

      // Update the UI in real-time by filtering out the deleted report
      setData(prevData => ({
        ...prevData,
        reports: prevData.reports.filter(report => report.id !== reportId)
      }));
    } catch (error) {
      console.error("Error deleting report:", error);
      alert(error.message); // Inform the user of the error
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Business Analysis Dashboard</h1>
      </header>
      <main>
        <section className="metrics">
          <h2>Key Metrics</h2>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
                {/* Sort reports by ID descending to show newest first */}
                {[...data.reports].sort((a, b) => b.id - a.id).map(report => (
                <tr key={report.id}>
                  <td>{report.id}</td>
                  <td>{report.title}</td>
                  <td>{report.date}</td>
                    <td>
                      <button className="delete-btn" onClick={() => handleDeleteReport(report.id)}>Delete</button>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="detailed-metrics">
          <DetailedMetrics />
        </section>

        <section className="analysis-section">
          <h2>Churn Analysis</h2>
          <ChurnAnalysis data={analysisData?.churn_analysis} isLoading={loadingState.analysis} error={errorState.analysis} />
        </section>

        <section className="analysis-section">
          <h2>Customer Segmentation</h2>
          <CustomerSegmentation data={analysisData?.customer_segmentation} isLoading={loadingState.analysis} error={errorState.analysis} />
        </section>

        <section className="analysis-section">
          <h2>Conversion Funnel Analysis</h2>
          <ConversionAnalysis data={analysisData?.conversion_analysis} isLoading={loadingState.analysis} error={errorState.analysis} />
        </section>

        <EditReportModal
          report={editingReport}
          onSave={handleUpdateReport}
          onCancel={() => setEditingReport(null)} />
      </main>
    </div>
  );
}

export default App;