import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask import send_file
import io

app = Flask(__name__)
CORS(app)  # Allow all origins (React frontend can connect)

# //user login
USER = {
    "username": "lake",
    "password": "1234"
}

@app.route("/login", methods=["POST"])
def login():
    data = request.json

    if data["username"] == USER["username"] and data["password"] == USER["password"]:
        return jsonify({
            "success": True,
            "token": "fake-jwt-token"
        })
    else:
        return jsonify({
            "success": False,
            "message": "Invalid credentials"
        }), 401



@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    return response

# ------------------ Forecast Models ------------------ #
def moving_average_forecast(series, months=6):
    avg = series.tail(3).mean()
    return [float(avg)] * months

def linear_forecast(series, months=6):
    x = np.arange(len(series))
    y = series.values
    coef = np.polyfit(x, y, 1)
    future_x = np.arange(len(series), len(series) + months)
    return list(np.polyval(coef, future_x))

def exp_smoothing_forecast(series, months=6):
    alpha = 0.5
    result = [series.iloc[0]]
    for val in series:
        result.append(alpha * val + (1 - alpha) * result[-1])
    last = result[-1]
    return [float(last)] * months

# ------------------ Core Forecast ------------------ #
def run_forecast(file, month_col, sales_col, product_col, months):
    df = pd.read_excel(file)
    df[month_col] = pd.to_datetime(df[month_col])

    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    os.makedirs("charts", exist_ok=True)
    os.makedirs("outputs", exist_ok=True)

    all_results = {}

    for product in df[product_col].unique():
        data = df[df[product_col] == product].sort_values(month_col)
        series = data[sales_col].reset_index(drop=True)

        forecasts = {
            "MovingAvg": moving_average_forecast(series, months),
            "Linear": linear_forecast(series, months),
            "ExpSmoothing": exp_smoothing_forecast(series, months)
        }

        future_dates = pd.date_range(
            start=datetime.now(),
            periods=months,
            freq="MS"
        )

        results = []
        for i in range(months):
            values = {k: float(v[i]) for k, v in forecasts.items()}
            best_model = max(values, key=values.get)
            results.append({
                "date": str(future_dates[i].date()),
                "BestModel": best_model,
                "BestValue": values[best_model],
                **values,
                "ForecastRun": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })

        all_results[product] = results

        # -------- Chart -------- #
        plt.figure()
        plt.plot(series.values, label="Actual")
        plt.plot(range(len(series), len(series) + months),
                 [r["BestValue"] for r in results],
                 label="Forecast")
        plt.legend()
        plt.title(f"Forecast for {product}")
        plt.savefig(f"charts/Forecast_{product}_{timestamp}.png")
        plt.close()

    # -------- Save Excel -------- #
    excel_path = f"outputs/ForecastOutput_{timestamp}.xlsx"
    with pd.ExcelWriter(excel_path, engine="xlsxwriter") as writer:
        for product, rows in all_results.items():
            pd.DataFrame(rows).to_excel(writer, sheet_name=product, index=False)

    return all_results

# ------------------ API ------------------ #
@app.route("/forecast", methods=["POST"])
def forecast_api():
    try:
        file = request.files["file"]
        month_col = request.form["month_col"]
        sales_col = request.form["sales_col"]
        product_col = request.form["product_col"]
        months = int(request.form["months"])

        filepath = "temp.xlsx"
        file.save(filepath)

        results = run_forecast(filepath, month_col, sales_col, product_col, months)

        # ✅ STORE DATA (INSIDE try block)
        app.last_forecast_data = []

        for product, rows in results.items():
            for r in rows:
                r["Product"] = product
                app.last_forecast_data.append(r)

        return jsonify(results)

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "✅ Forecast API is running!"})



@app.route("/download", methods=["GET"])
def download_file():
    files = os.listdir("outputs")
    latest_file = sorted(files)[-1]
    return send_file(f"outputs/{latest_file}", as_attachment=True)

@app.route("/trend/<product>", methods=["GET"])
def trend(product):
    if not hasattr(app, "last_forecast_data"):
        return jsonify({"error": "No data"}), 400

    data = [d for d in app.last_forecast_data if d["Product"] == product]

    if len(data) < 2:
        return jsonify({"trend": "stable"})

    first = data[0]["BestValue"]
    last = data[-1]["BestValue"]

    if last > first:
        return jsonify({"trend": "up"})
    elif last < first:
        return jsonify({"trend": "down"})
    else:
        return jsonify({"trend": "stable"})
 

@app.route("/forecast_data", methods=["GET"])
def get_forecast_data():
    if not hasattr(app, "last_forecast_data"):
        return jsonify([])

    return jsonify(app.last_forecast_data)






@app.route("/top-products", methods=["GET"])
def top_products():
    # ✅ Get parameter safely
    n_param = request.args.get("n", 5)

    try:
        n = int(n_param)
    except (ValueError, TypeError):
        n = 5  # fallback default

    # ✅ Check if forecast data exists
    if not hasattr(app, "last_forecast_data") or not app.last_forecast_data:
        return jsonify([])

    data = app.last_forecast_data

    # ✅ Group by product and find max BestValue
    product_max = {}

    for item in data:
        product = item.get("Product")
        value = item.get("BestValue", 0)

        if product:
            if product not in product_max or value > product_max[product]:
                product_max[product] = value

    # ✅ Sort products by highest value
    sorted_products = sorted(
        product_max.items(),
        key=lambda x: x[1],
        reverse=True
    )

    # ✅ Take top N
    top_n = sorted_products[:n]

    # ✅ Format response
    result = [
        {"Product": p, "BestValue": v}
        for p, v in top_n
    ]

    return jsonify(result)





if __name__ == "__main__":
    # Run API on port 8080 for Cloud Shell
  app.run(host="0.0.0.0", port=8080, debug=True)