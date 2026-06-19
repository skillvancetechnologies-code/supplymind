"""
SupplyMind — Demand Forecasting API
main.py | FastAPI + LightGBM + Seasonal Decomposition
Week 6: Advanced forecasting with seasonality
"""

import os
import time
import logging
import threading
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from lightgbm import LGBMRegressor
from sklearn.metrics import mean_absolute_percentage_error
from statsmodels.tsa.seasonal import seasonal_decompose
from accuracy_monitor import router as accuracy_router
from accuracy_alerts_final import router as alerts_final_router
# ── Logging ───────────────────────────────────────────────────────────────────
LOG_FILE = Path("forecast.log")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("execution_log.txt", mode="a"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger(__name__)

req_logger = logging.getLogger("forecast.requests")
req_logger.setLevel(logging.INFO)
req_logger.propagate = False
_fh = logging.FileHandler(LOG_FILE, mode="a")
_fh.setFormatter(logging.Formatter("%(message)s"))
req_logger.addHandler(_fh)


def log_request(sku_id: str, horizon: int, latency_ms: float, status: int):
    ts = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    req_logger.info(
        f"{ts} | sku_id={sku_id} | horizon={horizon} | "
        f"latency_ms={round(latency_ms, 1)} | status={status}"
    )


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="SupplyMind Forecast API",
    description="Demand forecasting with seasonal decomposition",
    version="2.0.0",
)
app.include_router(accuracy_router)
app.include_router(alerts_final_router)
app.include_router(alerts_final_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(alerts_final_router)

# ── Data ──────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "demand_history.csv")

_df_all: Optional[pd.DataFrame] = None
_df_lock = threading.Lock()


def get_data() -> pd.DataFrame:
    global _df_all
    with _df_lock:
        if _df_all is None:
            df = pd.read_csv(CSV_PATH)
            df["date"] = pd.to_datetime(df["date"])
            df["month"] = df["date"].dt.month
            df["day_of_week"] = df["date"].dt.dayofweek
            df["week_of_year"] = df["date"].dt.isocalendar().week.astype(int)
            df["quarter"] = df["date"].dt.quarter
            df["lag_7"] = df.groupby("sku_id")["quantity_demanded"].shift(7)
            df["lag_14"] = df.groupby("sku_id")["quantity_demanded"].shift(14)
            df["lag_28"] = df.groupby("sku_id")["quantity_demanded"].shift(28)
            df["rolling_7"] = df.groupby("sku_id")["quantity_demanded"].transform(
                lambda x: x.shift(1).rolling(7).mean()
            )
            df["rolling_28"] = df.groupby("sku_id")["quantity_demanded"].transform(
                lambda x: x.shift(1).rolling(28).mean()
            )
            df = df.dropna()
            _df_all = df
            log.info(f"Loaded {len(_df_all):,} rows from {CSV_PATH}")
    return _df_all


# ── Seasonal decomposition helper ─────────────────────────────────────────────
def decompose_sku(sku_df: pd.DataFrame) -> dict:
    """
    Run seasonal decomposition on SKU demand.
    Returns trend, seasonality strength, dominant period, and pattern type.
    """
    series = sku_df.set_index("date")["quantity_demanded"].sort_index()

    # Need at least 2 full cycles — use period=7 (weekly)
    if len(series) < 14:
        return {"seasonality_strength": 0, "trend_direction": "flat",
                "dominant_period": "none", "pattern_type": "insufficient_data"}

    try:
        result = seasonal_decompose(series, model="additive", period=7, extrapolate_trend="freq")

        trend = result.trend.dropna()
        seasonal = result.seasonal
        residual = result.resid.dropna()

        # Seasonality strength = 1 - Var(residual) / Var(seasonal + residual)
        var_resid = np.var(residual)
        var_seas_resid = np.var(seasonal + residual)
        strength = max(0, 1 - (var_resid / var_seas_resid)) if var_seas_resid > 0 else 0

        # Trend direction
        trend_slope = (trend.iloc[-1] - trend.iloc[0]) / len(trend)
        if trend_slope > 0.5:
            direction = "upward"
        elif trend_slope < -0.5:
            direction = "downward"
        else:
            direction = "stable"

        # Pattern classification
        if strength > 0.6:
            pattern = "highly_seasonal"
        elif strength > 0.3:
            pattern = "moderately_seasonal"
        else:
            pattern = "consistent"

        # Find peak day of week
        dow_avg = sku_df.groupby(sku_df["date"].dt.dayofweek)["quantity_demanded"].mean()
        peak_dow = int(dow_avg.idxmax())
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

        # Monthly pattern check
        monthly_cv = sku_df.groupby(sku_df["date"].dt.month)["quantity_demanded"].mean().std() / \
                     sku_df["quantity_demanded"].mean() if sku_df["quantity_demanded"].mean() > 0 else 0

        return {
            "seasonality_strength": round(float(strength), 3),
            "trend_direction": direction,
            "trend_slope_per_day": round(float(trend_slope), 3),
            "dominant_period": "weekly",
            "pattern_type": pattern,
            "peak_day_of_week": days[peak_dow],
            "monthly_cv": round(float(monthly_cv), 3),
            "seasonal_component": [round(float(v), 2) for v in seasonal.values[:7]],
        }
    except Exception as e:
        log.warning(f"Decomposition failed: {e}")
        return {"seasonality_strength": 0, "trend_direction": "unknown",
                "dominant_period": "none", "pattern_type": "error"}


# ── Forecast engine ───────────────────────────────────────────────────────────
FEATURES = ["lag_7", "lag_14", "lag_28", "rolling_7", "rolling_28",
            "month", "day_of_week", "week_of_year", "quarter", "is_promotion"]


def _fit_and_forecast(sku_id: str, forecast_days: int, include_seasonality: bool = False) -> dict:
    df_all = get_data()
    sku_df = df_all[df_all["sku_id"] == sku_id].copy()

    if sku_df.empty:
        raise HTTPException(status_code=404, detail=f"SKU '{sku_id}' not found")
    if len(sku_df) < 30:
        raise HTTPException(status_code=422,
                            detail=f"SKU '{sku_id}' has only {len(sku_df)} rows — need ≥30")

    train = sku_df[sku_df["date"] < "2024-01-01"]
    test = sku_df[sku_df["date"] >= "2024-01-01"]

    if train.empty or test.empty:
        raise HTTPException(status_code=422, detail=f"Not enough data for train/test split")

    # Available features (check is_promotion exists)
    avail_features = [f for f in FEATURES if f in sku_df.columns]

    X_train = train[avail_features]
    y_train = train["quantity_demanded"]
    X_test = test[avail_features]
    y_test = test["quantity_demanded"]

    model = LGBMRegressor(n_estimators=200, learning_rate=0.05, random_state=42, verbose=-1)
    model.fit(X_train, y_train)

    pred = model.predict(X_test)
    pred = np.clip(pred, 0, None)  # no negatives

    forecast_count = min(forecast_days, len(pred))

    mape = float(mean_absolute_percentage_error(
        y_test.iloc[:forecast_count],
        pred[:forecast_count]
    ) * 100)

    results = []
    for i in range(forecast_count):
        pv = round(float(pred[i]), 2)
        results.append({
            "forecast_date": str(test.iloc[i]["date"].date()),
            "sku_id": sku_id,
            "predicted_demand": pv,
            "confidence_interval_low": round(pv * 0.88, 2),
            "confidence_interval_high": round(pv * 1.12, 2),
            "mape": round(mape, 2),
        })

    response = {
        "status": "success",
        "sku_id": sku_id,
        "forecast_days": forecast_count,
        "mape": round(mape, 2),
        "forecasts": results,
    }

    if include_seasonality:
        decomp = decompose_sku(sku_df)
        response["seasonality"] = decomp

        # Demand alert flag
        avg = float(sku_df["quantity_demanded"].mean())
        std = float(sku_df["quantity_demanded"].std())
        recent_avg = float(sku_df.tail(7)["quantity_demanded"].mean())
        if recent_avg > avg + 1.5 * std:
            alert = "⚠️ Demand unusually HIGH compared to seasonal norm"
        elif recent_avg < avg - 1.5 * std:
            alert = "⚠️ Demand unusually LOW compared to seasonal norm"
        else:
            alert = "✅ Demand within normal seasonal range"
        response["demand_alert"] = alert

        # Seasonal insight per forecast
        peak_day = decomp.get("peak_day_of_week", "")
        for f in response["forecasts"]:
            date_obj = datetime.strptime(f["forecast_date"], "%Y-%m-%d")
            day_name = date_obj.strftime("%A")
            seas_comp = decomp.get("seasonal_component", [0] * 7)
            dow = date_obj.weekday()
            seas_val = seas_comp[dow] if dow < len(seas_comp) else 0
            if seas_val > std * 0.3:
                f["seasonal_note"] = f"📈 High spike expected — {day_name} is near peak day ({peak_day})"
            elif seas_val < -std * 0.3:
                f["seasonal_note"] = f"📉 Below-average demand expected on {day_name}"
            else:
                f["seasonal_note"] = f"Normal demand expected on {day_name}"

    return response


# ── Request models ────────────────────────────────────────────────────────────
class ForecastRequest(BaseModel):
    sku_id: str
    forecast_days: int = 30


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/")
def home():
    return {"message": "SupplyMind Forecast API v2.0 running", "status": "active"}


@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@app.post("/api/forecast")
def forecast(req: ForecastRequest):
    """Standard forecast endpoint with logging."""
    t0 = time.perf_counter()
    status = 200
    try:
        result = _fit_and_forecast(req.sku_id, req.forecast_days)
        return result
    except HTTPException as e:
        status = e.status_code
        raise
    except Exception as e:
        status = 500
        log.error(f"Error for {req.sku_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal forecasting error")
    finally:
        latency_ms = (time.perf_counter() - t0) * 1000
        log_request(req.sku_id, req.forecast_days, latency_ms, status)


@app.get("/api/forecast/advanced/{sku_id}")
def advanced_forecast(
    sku_id: str,
    forecast_days: int = Query(default=30, ge=1, le=365),
    include_seasonality: bool = Query(default=True),
):
    """
    Advanced forecast endpoint with seasonal decomposition.
    Returns base forecast + seasonal component + demand alert flag.
    """
    t0 = time.perf_counter()
    status = 200
    try:
        result = _fit_and_forecast(sku_id, forecast_days, include_seasonality=include_seasonality)
        return result
    except HTTPException as e:
        status = e.status_code
        raise
    except Exception as e:
        status = 500
        log.error(f"Advanced forecast error for {sku_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal forecasting error")
    finally:
        latency_ms = (time.perf_counter() - t0) * 1000
        log_request(sku_id, forecast_days, latency_ms, status)


@app.post("/api/forecast/batch")
def forecast_batch(payload: dict):
    """Batch forecast for up to 50 SKUs."""
    from concurrent.futures import ThreadPoolExecutor, as_completed
    sku_ids = payload.get("sku_ids", [])[:50]
    forecast_days = payload.get("forecast_days", 30)
    t0 = time.perf_counter()
    results, errors = [], []

    def run_one(sku_id):
        try:
            return _fit_and_forecast(sku_id, forecast_days)
        except Exception as e:
            return {"sku_id": sku_id, "error": str(e)}

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(run_one, s): s for s in sku_ids}
        for future in as_completed(futures):
            res = future.result()
            (errors if "error" in res else results).append(res)

    return {
        "total_returned": len(results),
        "errors": errors,
        "elapsed_s": round(time.perf_counter() - t0, 3),
        "forecasts": results,
    }