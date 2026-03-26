import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os
from datetime import datetime
from statsmodels.tsa.holtwinters import SimpleExpSmoothing
import uuid
import argparse

# Optional Flask
try:
    from flask import Flask, request, jsonify
    FLASK_AVAILABLE = True
except ImportError:
    FLASK_AVAILABLE = False

charts_folder = "forecast_charts"
os.makedirs(charts_folder, exist_ok=True)

# ===========================
# MSE Function
# ===========================
def calculate_mse(actual, predicted):
    actual = np.array(actual)
    predicted = np.array(predicted)
    return np.mean((actual - predicted) ** 2)

# ===========================
# Forecast Function
# ===========================
def generate_forecast(data, month_col, sales_col, product_col="", num_months=3):

    # Clean column names (IMPORTANT)
    data.columns = data.columns.str.strip()

    if product_col.strip() == "":
        data['product'] = 'All Products'
        product_col = 'product'

    forecast_results = []
    chart_paths = []

    for product in data[product_col].unique():
        product_data = data[data[product_col] == product].copy()

        # Date handling
        product_data[month_col] = pd.to_datetime(product_data[month_col])
        product_data.sort_values(by=month_col, inplace=True)

        months_numeric = np.arange(len(product_data)) + 1
        sales = product_data[sales_col].values

        last_date = product_data[month_col].max()
        future_dates = [last_date + pd.DateOffset(months=i) for i in range(1, num_months + 1)]
        future_numeric = np.arange(len(product_data) + 1, len(product_data) + num_months + 1)

        # =======================
        # Models
        # =======================

        # Linear
        linear_model = np.poly1d(np.polyfit(months_numeric, sales, 1))
        linear_forecast = linear_model(future_numeric)

        # Moving Average
        window = 3 if len(sales) >= 3 else 1
        moving_avg_forecast = []
        temp = sales[-window:].tolist()
        for _ in range(num_months):
            avg = np.mean(temp)
            moving_avg_forecast.append(avg)
            temp.pop(0)
            temp.append(avg)

        # Exponential Smoothing
        try:
            es_model = SimpleExpSmoothing(sales).fit(smoothing_level=0.5, optimized=False)
            es_forecast = es_model.forecast(num_months)
        except:
            es_forecast = [sales[-1]] * num_months

        # =======================
        # Model Evaluation (NEW)
        # =======================
        if len(sales) > 3:
            split = int(len(sales) * 0.8)
            train = sales[:split]
            test = sales[split:]

            test_x = np.arange(split + 1, len(sales) + 1)

            # Linear test
            linear_test = linear_model(test_x)

            # Moving Avg test
            temp = train[-window:].tolist()
            ma_test = []
            for _ in range(len(test)):
                avg = np.mean(temp)
                ma_test.append(avg)
                temp.pop(0)
                temp.append(avg)

            # ES test
            try:
                es_test_model = SimpleExpSmoothing(train).fit(smoothing_level=0.5, optimized=False)
                es_test = es_test_model.forecast(len(test))
            except:
                es_test = [train[-1]] * len(test)

            mse_values = {
                "Linear": calculate_mse(test, linear_test),
                "Moving Average": calculate_mse(test, ma_test),
                "Exp Smoothing": calculate_mse(test, es_test)
            }

            best_model = min(mse_values, key=mse_values.get)
        else:
            best_model = "Not enough data"

        print(f"\n📊 {product} → Best Model: {best_model}")

        # =======================
        # Save Results
        # =======================
        for i, date in enumerate(future_dates):
            forecast_results.append({
                product_col: product,
                month_col: date.strftime("%Y-%m-%d"),
                'Linear_Forecast': int(linear_forecast[i]),
                'MovingAvg_Forecast': int(moving_avg_forecast[i]),
                'ExpSmoothing_Forecast': int(es_forecast[i]),
                'Best_Model': best_model
            })

        # =======================
        # Plot
        # =======================
        plt.figure(figsize=(10,6))
        plt.plot(product_data[month_col], sales, 'bo-', label='Actual')
        plt.plot(future_dates, linear_forecast, 'r^-', label='Linear')
        plt.plot(future_dates, moving_avg_forecast, 'gs-', label='Moving Avg')
        plt.plot(future_dates, es_forecast, 'm*-', label='Exp Smooth')
        plt.title(f"{product} Forecast")
        plt.legend()
        plt.xticks(rotation=45)
        plt.tight_layout()

        chart_file = f"{charts_folder}/{product}_{uuid.uuid4().hex}.png"
        plt.savefig(chart_file)
        plt.close()

        chart_paths.append(chart_file)

    return forecast_results, chart_paths


# ===========================
# Terminal Mode
# ===========================
def run_terminal(args):

    if not os.path.exists(args.file):
        print("❌ File not found")
        return

    if args.file.endswith(('.xlsx', '.xls')):
        data = pd.read_excel(args.file)
    else:
        data = pd.read_csv(args.file)

    results, charts = generate_forecast(
        data,
        args.month_col,
        args.sales_col,
        args.product_col,
        args.months
    )

    df = pd.DataFrame(results)
    df.to_excel("forecast_output.xlsx", index=False)

    print("\n✅ Forecast saved to forecast_output.xlsx")
    print("📈 Charts saved in forecast_charts/")


# ===========================
# API Mode
# ===========================
if FLASK_AVAILABLE:
    app = Flask(__name__)

    @app.route('/forecast', methods=['POST'])
    def forecast_api():
        try:
            file = request.files['file']

            if file.filename.endswith(('.xlsx', '.xls')):
                data = pd.read_excel(file)
            else:
                data = pd.read_csv(file)

            results, charts = generate_forecast(
                data,
                request.form['month_col'],
                request.form['sales_col'],
                request.form.get('product_col', ''),
                int(request.form.get('num_months', 3))
            )

            return jsonify({"forecast": results, "charts": charts})

        except Exception as e:
            return jsonify({"error": str(e)}), 500


# ===========================
# MAIN
# ===========================
if __name__ == "__main__":

    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=['terminal', 'api'], default='terminal')
    parser.add_argument("--file")
    parser.add_argument("--month_col")
    parser.add_argument("--sales_col")
    parser.add_argument("--product_col", default="")
    parser.add_argument("--months", type=int, default=3)

    args = parser.parse_args()

    if args.mode == "terminal":
        run_terminal(args)

    elif args.mode == "api":
        print("🚀 API running on http://127.0.0.1:5000")
        app.run(debug=True)