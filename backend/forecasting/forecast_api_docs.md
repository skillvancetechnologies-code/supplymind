Forecast API Documentation

Endpoint:
POST /api/forecast

Request Body:
{
  "sku_id": "SKU-00064",
  "forecast_days": 30
}

Success Response:
200 OK

{
  "status": "success",
  "forecasts": [...]
}

Error Response:
404 Not Found
{
  "detail": "SKU not found"
}

Dependencies:
- FastAPI
- LightGBM
- Pandas
- Scikit-learn

Performance:
Average Latency: 2469.72 ms
Maximum Latency: 3717 ms
Concurrent Users Tested: 20
Failures: 0