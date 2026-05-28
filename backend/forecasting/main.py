import os

import pandas as pd

from fastapi import FastAPI
from pydantic import BaseModel

from lightgbm import LGBMRegressor
from sklearn.metrics import (
    mean_absolute_percentage_error
)

from fastapi.middleware.cors import (
    CORSMiddleware
)

# =========================
# App Setup
# =========================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Request Body
# =========================

class ForecastRequest(BaseModel):
    sku_id: str
    forecast_days: int

# =========================
# File Path Setup
# =========================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

CSV_PATH = os.path.join(
    BASE_DIR,
    "demand_history.csv"
)

# =========================
# Load Dataset
# =========================

df = pd.read_csv(CSV_PATH)

df["date"] = pd.to_datetime(
    df["date"]
)

# =========================
# Feature Engineering
# =========================

df["month"] = df["date"].dt.month

df["lag_7"] = df.groupby(
    "sku_id"
)["quantity_demanded"].shift(7)

df["lag_14"] = df.groupby(
    "sku_id"
)["quantity_demanded"].shift(14)

df["lag_28"] = df.groupby(
    "sku_id"
)["quantity_demanded"].shift(28)

df["rolling_7"] = df.groupby(
    "sku_id"
)["quantity_demanded"].transform(
    lambda x: x.shift(1).rolling(7).mean()
)

df["rolling_28"] = df.groupby(
    "sku_id"
)["quantity_demanded"].transform(
    lambda x: x.shift(1).rolling(28).mean()
)

df = df.dropna()

# =========================
# Home Route
# =========================

@app.get("/")
def home():

    return {
        "message": "Forecast API running successfully",
        "status": "active"
    }

# =========================
# Forecast API
# =========================

@app.post("/api/forecast")
def forecast(req: ForecastRequest):

    sku_df = df[
        df["sku_id"] == req.sku_id
    ]

    if sku_df.empty:

        return {
            "error": "SKU not found"
        }

    train = sku_df[
        sku_df["date"] < "2024-01-01"
    ]

    test = sku_df[
        sku_df["date"] >= "2024-01-01"
    ]

    features = [
        "lag_7",
        "lag_14",
        "lag_28",
        "rolling_7",
        "rolling_28",
        "month",
        "is_promotion"
    ]

    X_train = train[features]

    y_train = train[
        "quantity_demanded"
    ]

    X_test = test[features]

    y_test = test[
        "quantity_demanded"
    ]

    # =========================
    # Train Model
    # =========================

    model = LGBMRegressor()

    model.fit(
        X_train,
        y_train
    )

    # =========================
    # Prediction
    # =========================

    pred = model.predict(X_test)

    # =========================
    # Accuracy
    # =========================

    mape = (
        mean_absolute_percentage_error(
            y_test,
            pred
        ) * 100
    )

    # =========================
    # Build Forecast Response
    # =========================

    results = []

    forecast_count = min(
        req.forecast_days,
        len(pred)
    )

    for i in range(forecast_count):

        predicted_value = round(
            float(pred[i]),
            2
        )

        results.append({

            "forecast_date": str(
                test.iloc[i]["date"].date()
            ),

            "sku_id": req.sku_id,

            "predicted_demand": predicted_value,

            "confidence_interval_low": round(
                predicted_value * 0.9,
                2
            ),

            "confidence_interval_high": round(
                predicted_value * 1.1,
                2
            ),

            "mape": round(
                mape,
                2
            )
        })

    return {
        "status": "success",
        "forecasts": results
    }
