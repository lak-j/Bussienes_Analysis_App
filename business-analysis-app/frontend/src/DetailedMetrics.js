import React, { useState, useEffect } from 'react';

function DetailedMetrics() {
    const [metric, setMetric] = useState('Revenue');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const metrics = ['Revenue', 'Profit', 'Customers', 'Conversion Rate'];

    useEffect(() => {
        setLoading(true);
        // Fetch data from the new dynamic endpoint
        fetch(`/api/data/${metric}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching metric data:", error);
                setData([]); // Clear data on error
                setLoading(false);
            });
    }, [metric]); // This effect runs whenever the 'metric' state changes

    return (
        <div>
            <h2>Metric Details</h2>
            <div className="metric-buttons">
                {metrics.map(m => (
                    <button
                        key={m}
                        onClick={() => setMetric(m)}
                        disabled={metric === m}
                    >
                        {m}
                    </button>
                ))}
            </div>
            <h3 style={{ marginTop: '20px' }}>{metric}</h3>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <ul>
                    {data.length > 0 ? (
                        data.map((item, index) => (
                            <li key={index}>
                                {item.month}: {item.value.toLocaleString()}
                            </li>
                        ))
                    ) : (
                        <p>No data available for this metric.</p>
                    )}
                </ul>
            )}
        </div>
    );
}

export default DetailedMetrics;