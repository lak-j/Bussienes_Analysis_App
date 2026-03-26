import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os
from datetime import datetime
from statsmodels.tsa.holtwinters import SimpleExpSmoothing

print("🚀 Business Forecasting App ")

# 1️⃣ Get file path from user
file_path = input("Enter CSV or Excel file path: ").strip('"')

# 2️⃣ Check if file exists
if not os.path.exists(file_path):
    print(f"❌ File not found: {file_path}")
    exit()

# 3️⃣ Read file automatically
if file_path.endswith(('.xlsx', '.xls')):
    data = pd.read_excel(file_path)
else:
    data = pd.read_csv(file_path)

# 4️⃣ Show columns and ask user to select
print("\nColumns detected in your file:", list(data.columns))
month_col = input("Enter the column name for Month/Date: ")
sales_col = input("Enter the column name for Sales: ")
product_col = input("Enter the column name for Product (leave empty if none): ")

if product_col.strip() == "":
    data['product'] = 'All Products'
    product_col = 'product'

# 5️⃣ Forecast months
num_months = int(input("How many months ahead to forecast? "))

forecast_results = []
combined_sheets = {}

# Ensure charts folder exists
charts_folder = "forecast_charts"
os.makedirs(charts_folder, exist_ok=True)

for product in data[product_col].unique():
    product_data = data[data[product_col] == product].copy()

    # 6️⃣ Automatic date handling
    product_data[month_col] = pd.to_datetime(product_data[month_col])
    product_data.sort_values(by=month_col, inplace=True)
    months_numeric = np.arange(len(product_data)) + 1
    sales = product_data[sales_col].values

    last_date = product_data[month_col].max()
    future_dates = [last_date + pd.DateOffset(months=i) for i in range(1, num_months + 1)]
    future_numeric = np.arange(len(product_data) + 1, len(product_data) + num_months + 1)

    # 7️⃣ Linear Trend Forecast
    linear_coeff = np.polyfit(months_numeric, sales, 1)
    linear_model = np.poly1d(linear_coeff)
    linear_forecast = linear_model(future_numeric)

    # 8️⃣ Moving Average Forecast
    window = 3 if len(sales) >= 3 else 1
    moving_avg_forecast = []
    sales_series = pd.Series(sales)
    last_window = sales_series[-window:].values.tolist()
    for _ in range(num_months):
        avg = np.mean(last_window)
        moving_avg_forecast.append(avg)
        last_window.pop(0)
        last_window.append(avg)

    # 9️⃣ Exponential Smoothing Forecast
    try:
        model_es = SimpleExpSmoothing(sales).fit(smoothing_level=0.5, optimized=False)
        es_forecast = model_es.forecast(num_months)
    except:
        es_forecast = [sales[-1]]*num_months  # fallback if not enough data

    # 1️⃣0️⃣ Collect forecast results for Excel
    for i, date in enumerate(future_dates):
        forecast_results.append({
            product_col: product,
            month_col: date.strftime("%Y-%m-%d"),
            'Linear_Forecast': int(linear_forecast[i]),
            'MovingAvg_Forecast': int(moving_avg_forecast[i]),
            'ExpSmoothing_Forecast': int(es_forecast[i])
        })

    # 1️⃣1️⃣ Combine historical + forecast
    combined_df = product_data[[month_col, sales_col]].copy()
    combined_df.rename(columns={sales_col:'Actual_Sales'}, inplace=True)
    forecast_df = pd.DataFrame({
        month_col: [d.strftime("%Y-%m-%d") for d in future_dates],
        'Actual_Sales':[np.nan]*num_months,
        'Linear_Forecast':linear_forecast.astype(int),
        'MovingAvg_Forecast':np.array(moving_avg_forecast).astype(int),
        'ExpSmoothing_Forecast':np.array(es_forecast).astype(int)
    })
    combined_df['Linear_Forecast'] = np.nan
    combined_df['MovingAvg_Forecast'] = np.nan
    combined_df['ExpSmoothing_Forecast'] = np.nan
    combined_combined = pd.concat([combined_df, forecast_df], ignore_index=True)
    combined_sheets[product] = combined_combined

    # 1️⃣2️⃣ Plot comparison chart
    plt.figure(figsize=(10,6))
    plt.plot(product_data[month_col], sales, 'bo-', label='Actual Sales')
    plt.plot(future_dates, linear_forecast, 'r^-', label='Linear Trend')
    plt.plot(future_dates, moving_avg_forecast, 'gs-', label='Moving Average')
    plt.plot(future_dates, es_forecast, 'm*-', label='Exp Smoothing')
    plt.xlabel("Date")
    plt.ylabel("Sales (ETB)")
    plt.title(f"Sales Forecast Comparison for {product}")
    plt.legend()
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(f"{charts_folder}/forecast_comparison_{product}.png")
    plt.close()

# 1️⃣3️⃣ Save all forecasts to Excel
forecast_df_export = pd.DataFrame(forecast_results)
with pd.ExcelWriter("forecast_output.xlsx", engine='openpyxl') as writer:
    forecast_df_export.to_excel(writer, sheet_name='Forecast', index=False)

    # Summary sheet: sum of Linear Forecast per product
    summary = forecast_df_export.groupby(product_col)['Linear_Forecast'].sum().reset_index()
    summary.rename(columns={'Linear_Forecast':'Total_Predicted_Sales'}, inplace=True)
    summary.to_excel(writer, sheet_name='Summary', index=False)

    # Combined sheet per product
    for product_name, df in combined_sheets.items():
        df.to_excel(writer, sheet_name=f'Combined_{product_name}', index=False)

print(f"\n✅ Forecast saved to forecast_output.xlsx and comparison charts saved in '{charts_folder}' folder")