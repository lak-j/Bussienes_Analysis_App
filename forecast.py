# forecast.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from sklearn.linear_model import LinearRegression
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS for all origins

import pandas as pd

def generate_forecast(data, month_col, sales_col, product_col, months):
    """
    Generate forecasts for each product in the dataset.
    
    Args:
        data (pd.DataFrame): Input data with at least month_col, sales_col, and product_col
        month_col (str): Column name for dates
        sales_col (str): Column name for sales values
        product_col (str): Column name for products
        months (int): Number of months to forecast
    
    Returns:
        dict: Forecast results per product
    """
    from statsmodels.tsa.holtwinters import ExponentialSmoothing
    from sklearn.linear_model import LinearRegression
    import numpy as np

    results = {}

    # Ensure the month column is datetime
    data[month_col] = pd.to_datetime(data[month_col])

    # Process each product separately
    products = data[product_col].unique()
    for product in products:
        product_data = data[data[product_col] == product].sort_values(by=month_col)

        y = product_data.set_index(month_col)[sales_col]

        # --- Exponential Smoothing ---
        es_model = ExponentialSmoothing(y, seasonal=None)
        es_fit = es_model.fit()
        es_forecast = es_fit.forecast(months)

        # --- Linear Regression ---
        X = np.arange(len(y)).reshape(-1, 1)
        lr = LinearRegression()
        lr.fit(X, y.values)
        lr_forecast = lr.predict(np.arange(len(y), len(y) + months).reshape(-1, 1))

        # --- Moving Average ---
        ma_forecast = [y.iloc[-3:].mean()] * months  # simple moving average of last 3 months

        # Generate forecast dates
        forecast_dates = pd.date_range(
            start=y.index[-1] + pd.offsets.MonthBegin(),
            periods=months,
            freq='MS'
        )

        # Combine results safely using .iloc
        product_forecast = []
        for i, f_date in enumerate(forecast_dates):
            es_val = float(es_forecast.iloc[i])
            lr_val = float(lr_forecast[i])
            ma_val = float(ma_forecast[i])

            best_model_name = max(
                {"ExpSmoothing": es_val, "Linear": lr_val, "MovingAvg": ma_val},
                key=lambda k: {"ExpSmoothing": es_val, "Linear": lr_val, "MovingAvg": ma_val}[k]
            )

            product_forecast.append({
                "date": f_date.strftime("%Y-%m-%d"),
                "ExpSmoothing": es_val,
                "Linear": lr_val,
                "MovingAvg": ma_val,
                "BestModel": best_model_name,
                "BestValue": {"ExpSmoothing": es_val, "Linear": lr_val, "MovingAvg": ma_val}[best_model_name]
            })

        results[product] = product_forecast

    return results

@app.route("/forecast", methods=["POST"])
def forecast_api():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    month_col = request.form.get("month_col")
    sales_col = request.form.get("sales_col")
    product_col = request.form.get("product_col")
    months = int(request.form.get("months", 6))

    try:
        data = pd.read_excel(file)
    except Exception as e:
        return jsonify({"error": f"Failed to read Excel file: {str(e)}"}), 400

    # Check required columns
    for col in [month_col, sales_col]:
        if col not in data.columns:
            return jsonify({"error": f"Column '{col}' not found in file"}), 400

    forecast_results = generate_forecast(data, month_col, sales_col, product_col, months)
    return jsonify(forecast_results)

if __name__ == "__main__":
    print("🚀 Starting API server on http://0.0.0.0:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)