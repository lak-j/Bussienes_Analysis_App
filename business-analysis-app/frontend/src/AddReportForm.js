import React, { useState } from 'react';

function AddReportForm({ onReportAdded }) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !date) {
            setMessage('Title and date are required.');
            return;
        }
        setSubmitting(true);
        setMessage('');

        try {
            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, date }),
            });

            if (!response.ok) {
                throw new Error('Failed to add report.');
            }

            const newReport = await response.json();
            onReportAdded(newReport); // Notify parent component
            setTitle(''); // Clear form
            setDate('');
            setMessage('Report added successfully!');
        } catch (error) {
            setMessage(error.message);
        } finally {
            setSubmitting(false);
            setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
        }
    };

    return (
        <div className="add-report-form">
            <h4>Add New Report</h4>
            <form onSubmit={handleSubmit}>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Report Title" disabled={submitting} />
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={submitting} />
                <button type="submit" disabled={submitting}>
                    {submitting ? 'Adding...' : 'Add Report'}
                </button>
            </form>
            {message && <p className="form-message">{message}</p>}
        </div>
    );
}

export default AddReportForm;