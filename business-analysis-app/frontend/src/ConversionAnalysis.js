import React from 'react';

function ConversionAnalysis({ data, isLoading, error }) {
    if (isLoading) return <p>Loading conversion data...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!data) return <p>No conversion data available.</p>;

    const maxCount = Math.max(...data.funnel_stages.map(stage => stage.count));

    return (
        <div className="analysis-feature">
            <div className="funnel-container">
                {data.funnel_stages.map((stage, index) => {
                    const percentage = (stage.count / maxCount) * 100;
                    const prevCount = index > 0 ? data.funnel_stages[index - 1].count : stage.count;
                    const conversionRate = index > 0 ? ((stage.count / prevCount) * 100).toFixed(1) : 100;

                    return (
                        <div key={stage.stage} className="funnel-stage">
                            <div className="funnel-info">
                                <span className="stage-name">{stage.stage}</span>
                                <span className="stage-count">{stage.count.toLocaleString()}</span>
                            </div>
                            <div className="funnel-bar-container">
                                <div className="funnel-bar" style={{ width: `${percentage}%` }}></div>
                            </div>
                            {index > 0 && (
                                <div className="conversion-rate">
                                    <span>&darr; {conversionRate}% conversion</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ConversionAnalysis;