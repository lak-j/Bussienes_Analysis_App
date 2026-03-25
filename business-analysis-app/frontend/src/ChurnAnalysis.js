import React from 'react';

function ChurnAnalysis({ data, isLoading, error }) {
    if (isLoading) return <p>Loading churn data...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!data) return <p>No churn data available.</p>;

    return (
        <div className="analysis-feature">
            <h4>At-Risk Customers</h4>
            <table className="analysis-table">
                <thead>
                    <tr>
                        <th>Customer ID</th>
                        <th>Name</th>
                        <th>Last Activity</th>
                        <th>Risk Level</th>
                    </tr>
                </thead>
                <tbody>
                    {data.at_risk_customers.map(customer => (
                        <tr key={customer.id}>
                            <td>{customer.id}</td>
                            <td>{customer.name}</td>
                            <td>{customer.last_activity}</td>
                            <td className={`risk-${customer.risk_level.toLowerCase()}`}>{customer.risk_level}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="trends-reasons-container">
                <div className="trend-list">
                    <h4>Retention Trends</h4>
                    <ul>
                        {data.retention_trends.map(trend => (
                            <li key={trend.month}>{trend.month}: <strong>{trend.rate}</strong></li>
                        ))}
                    </ul>
                </div>

                <div className="reason-list">
                    <h4>Top Churn Reasons</h4>
                    <ul>
                        {data.churn_reasons.map(reason => (
                            <li key={reason.reason}>{reason.reason}: <strong>{reason.percentage}%</strong></li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default ChurnAnalysis;