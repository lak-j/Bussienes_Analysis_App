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
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]
        month_col = request.form.get("month_col")
        sales_col = request.form.get("sales_col")
        product_col = request.form.get("product_col")
        months = int(request.form.get("months", 6))

        filepath = f"temp_{datetime.now().timestamp()}.xlsx"
        file.save(filepath)
        
        results = run_forecast(filepath, month_col, sales_col, product_col, months)

        os.remove(filepath)  # clean temp file
        return jsonify(results)

    except Exception as e:
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

if __name__ == "__main__":
    # Run API on port 8080 for Cloud Shell
  app.run(host="0.0.0.0", port=8080, debug=True)