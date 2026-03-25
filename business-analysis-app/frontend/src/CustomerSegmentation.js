import React from 'react';

function CustomerSegmentation({ data, isLoading, error }) {
    if (isLoading) return <p>Loading segmentation data...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!data) return <p>No segmentation data available.</p>;

    return (
        <div className="analysis-feature">
            <div className="segment-container">
                {data.segments.map(segment => (
                    <div key={segment.name} className="segment-card">
                        <h4>{segment.name}</h4>
                        <p>{segment.description}</p>
                        <p><strong>Total Customers:</strong> {segment.customer_count.toLocaleString()}</p>
                        <strong>Regional Breakdown:</strong>
                        <ul>
                            {Object.entries(segment.region_breakdown).map(([region, percentage]) => (
                                <li key={region}>{region}: {percentage}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CustomerSegmentation;