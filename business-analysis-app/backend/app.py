from flask import Flask, jsonify, send_from_directory, abort
from flask_cors import CORS
import os
import random

app = Flask(
    __name__,
    static_folder=os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'build', 'static')),
    static_url_path='/static'
)
CORS(app)  # Enables fetch from frontend if needed

# Dummy historical data for detailed metric views


import random

# Months
months = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"]

# Historical data with seasonal trends
historical_data = {
    "revenue": [],
    "profit": [],
    "customers": [],
    "conversion_rate": []
}

for i, month in enumerate(months):
    # Revenue pattern: lower in summer (June–August), peak in holidays (Nov–Dec)
    if month in ["June", "July", "August"]:
        revenue = random.randint(1100000, 1200000)
    elif month in ["November", "December"]:
        revenue = random.randint(1400000, 1500000)
    else:
        revenue = random.randint(1200000, 1350000)
    
    # Profit roughly 25–30% of revenue, slight variation
    profit = int(revenue * random.uniform(0.25, 0.3))
    
    # Customers grow gradually, slight monthly variation
    base_customers = 14000 + i * 300  # start at 14k, +300 each month
    customers = base_customers + random.randint(-200, 200)
    
    # Conversion rate 2–3%, slight seasonal variation
    conversion = round(random.uniform(2.0 + i*0.05, 2.5 + i*0.05), 2)
    
    historical_data["revenue"].append({"month": month, "value": revenue})
    historical_data["profit"].append({"month": month, "value": profit})
    historical_data["customers"].append({"month": month, "value": customers})
    historical_data["conversion_rate"].append({"month": month, "value": conversion})

# Example output
print(historical_data)
# Dummy data for individual report details
report_details_data = {
    1: {
        "id": 1,
        "title": "Q1 Sales Performance",
        "date": "2026-03-23",
        "summary": "The first quarter showed a strong performance with a 5% increase in revenue compared to Q4 2025. Key drivers were the new marketing campaign and seasonal demand.",
        "highlights": [
            "Revenue exceeded targets by 3%.",
            "Customer acquisition grew by 7% in the quarter.",
            "The 'Spring Sale' campaign resulted in a 15% conversion rate boost."
        ],
        "author": "Sales Team"
    },
    2: {
        "id": 2,
        "title": "Marketing Campaign ROI",
        "date": "2026-02-23",
        "summary": "Analysis of the 'Winter Deals' campaign shows a return on investment (ROI) of 250%. Social media channels were the most effective.",
        "highlights": [
            "Total spend: $50,000.",
            "Generated revenue: $175,000.",
            "Most effective channel: Instagram Ads."
        ],
        "author": "Marketing Dept."
    },
    3: {
        "id": 3,
        "title": "Customer Churn Analysis",
        "date": "2026-01-23",
        "summary": "Monthly churn rate has decreased from 1.2% to 1.2%. The new customer support initiatives are showing positive results.",
        "highlights": [
            "Customer satisfaction score increased by 10 points.",
            "Reduced response time for support tickets by 50%.",
            "High-value customers show a 98% retention rate."
        ],
        "author": "Customer Success"
    }
}

@app.route("/api/data")
def get_business_data():
    return jsonify({
        "metrics": [
            {"name": "Revenue", "value": 1200000, "unit": "$", "trend": "up"},
            {"name": "Profit", "value": 350000, "unit": "$", "trend": "up"},
            {"name": "Customers", "value": 15000, "unit": "", "trend": "stable"},
            {"name": "Conversion Rate", "value": 2.5, "unit": "%", "trend": "up"}
        ],
        "reports": [
            {"id": 1, "title": "Q1 Sales Performance", "date": "2026-03-23"},
            {"id": 2, "title": "Marketing Campaign ROI", "date": "2026-02-23"},
            {"id": 3, "title": "Customer Churn Analysis", "date": "2026-01-23"}
        ]
    })

@app.route("/api/data/<metric_name>")
def get_metric_data(metric_name):
    """Provides historical data for a given metric."""
    metric_key = metric_name.lower().replace(" ", "_")
    data = historical_data.get(metric_key)
    if data:
        return jsonify(data)
    else:
        abort(404, description=f"Data for metric '{metric_name}' not found.")

@app.route("/api/reports/<int:report_id>")
def get_report_details(report_id):
    """Provides detailed information for a specific report."""
    report = report_details_data.get(report_id)
    if report:
        return jsonify(report)
    else:
        abort(404, description=f"Report with ID '{report_id}' not found.")


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    # If the path is for the API, but no specific API route was matched,
    # return a 404 error. This prevents serving index.html for bad API calls.
    if path.startswith("api/"):
        abort(404)

    build_dir = os.path.dirname(app.static_folder)

    # Serve root-level static files (like manifest.json, favicon.ico, etc.)
    if path != "" and os.path.exists(os.path.join(build_dir, path)):
        return send_from_directory(build_dir, path)

    # For any other route, serve the index.html file for the React app
    index_path = os.path.join(build_dir, "index.html")
    if not os.path.exists(index_path):
        print(f"ERROR: 'index.html' not found in the build directory: {build_dir}")
        print("This is the entry point for the React app. Please make sure you have run 'npm run build' in the frontend directory.")
        abort(500, "Frontend entry point (index.html) not found. See server logs for details.")
    return send_from_directory(build_dir, "index.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)