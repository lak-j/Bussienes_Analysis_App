from flask import Flask, jsonify, abort, send_from_directory, request
from flask_cors import CORS
import os
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

app = Flask(__name__,
            static_folder=os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'build')),
            static_url_path=''
            )
CORS(app)  # Enables fetch from frontend if needed

# --- Database Configuration ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///business_data.db'
db = SQLAlchemy(app)

# --- Database Model Definition ---
class Report(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    date: Mapped[str] = mapped_column(String, nullable=False)

    def to_dict(self):
        return {"id": self.id, "title": self.title, "date": self.date}
# --- End Database Configuration ---

# Dummy historical data for detailed metric views
historical_data = {
    "revenue": [
        {"month": "January", "value": 1150000},
        {"month": "February", "value": 1180000},
        {"month": "March", "value": 1200000},
    ],
    "profit": [
        {"month": "January", "value": 330000},
        {"month": "February", "value": 340000},
        {"month": "March", "value": 350000},
    ],
    "customers": [
        {"month": "January", "value": 14800},
        {"month": "February", "value": 14950},
        {"month": "March", "value": 15000},
    ],
    "conversion_rate": [
        {"month": "January", "value": 2.3},
        {"month": "February", "value": 2.4},
        {"month": "March", "value": 2.5},
    ]
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

analysis_data = {
    "churn_analysis": {
        "at_risk_customers": [
            {"id": "CUST-001", "name": "John Doe", "last_activity": "45 days ago", "risk_level": "High"},
            {"id": "CUST-002", "name": "Jane Smith", "last_activity": "32 days ago", "risk_level": "Medium"},
            {"id": "CUST-003", "name": "Sam Wilson", "last_activity": "50 days ago", "risk_level": "High"},
        ],
        "retention_trends": [
            {"month": "January", "rate": "95%"},
            {"month": "February", "rate": "94%"},
            {"month": "March", "rate": "92%"},
        ],
        "churn_reasons": [
            {"reason": "High Price", "percentage": 40},
            {"reason": "Poor Customer Service", "percentage": 25},
            {"reason": "Lack of Features", "percentage": 20},
            {"reason": "Switched to Competitor", "percentage": 15},
        ]
    },
    "customer_segmentation": {
        "segments": [
            {
                "name": "High-Value Spenders",
                "description": "Customers with high purchase frequency and value.",
                "region_breakdown": {"North": "40%", "South": "30%", "East": "20%", "West": "10%"},
                "customer_count": 500
            },
            {
                "name": "New Customers",
                "description": "Customers who made their first purchase in the last 30 days.",
                "region_breakdown": {"North": "25%", "South": "35%", "East": "25%", "West": "15%"},
                "customer_count": 1200
            },
            {
                "name": "At-Risk Churn",
                "description": "Customers who have not engaged in the last 60 days.",
                "region_breakdown": {"North": "30%", "South": "30%", "East": "20%", "West": "20%"},
                "customer_count": 350
            }
        ]
    },
    "conversion_analysis": {
        "funnel_stages": [
            {"stage": "Leads", "count": 10000},
            {"stage": "Contacted", "count": 7500},
            {"stage": "Demo Scheduled", "count": 4000},
            {"stage": "Trial Started", "count": 2000},
            {"stage": "Paying Customers", "count": 1500}
        ]
    }
}

@app.route("/api/analysis")
def get_analysis_data():
    """Provides data for the analysis sections."""
    return jsonify(analysis_data)

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    # Before trying to serve files, check if the build directory exists.
    # If not, it's a strong indicator that the frontend hasn't been built.
    if not os.path.exists(app.static_folder):
        print(f"ERROR: Frontend build directory not found at {app.static_folder}")
        print("Please run 'npm run build' in the '/home/anbeslakachew/.vscode/business-analysis-app/frontend' directory.")
        abort(500, "Frontend not built. See server logs for details.")

    # If the path is for the API, but no specific API route was matched,
    # return a 404 error. This prevents serving index.html for bad API calls.
    if path.startswith("api/"):
        abort(404)

    # If the requested path exists as a file in the static folder, serve it.
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    # Otherwise, serve the index.html file for the React app.
    else:
        index_path = os.path.join(app.static_folder, "index.html")
        if not os.path.exists(index_path):
            print(f"ERROR: 'index.html' not found in the build directory: {app.static_folder}")
            print("This is the entry point for the React app. Please make sure you have run 'npm run build' in the frontend directory.")
            abort(500, "Frontend entry point (index.html) not found. See server logs for details.")
        return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)