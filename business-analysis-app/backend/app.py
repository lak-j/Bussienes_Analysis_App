from flask import Flask, jsonify, send_from_directory, abort
from flask_cors import CORS
import os

app = Flask(__name__,
            static_folder=os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'build')),
            static_url_path=''
            )
CORS(app)  # Enables fetch from frontend if needed

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
            {"id": 1, "title": "Q1 Sales Performance", "date": "2024-03-31"},
            {"id": 2, "title": "Marketing Campaign ROI", "date": "2024-02-28"},
            {"id": 3, "title": "Customer Churn Analysis", "date": "2024-01-15"}
        ]
    })

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