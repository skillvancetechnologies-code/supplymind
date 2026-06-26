"""
SupplyMind — Weekly Accuracy Scorer
run_weekly_scoring.py | Week 6 Day 2

Run this once a week (e.g. via cron / Task Scheduler) to:
1. Pull a forecast for each SKU from the live API
2. Compare against actuals for that period
3. Compute MAPE, RMSE, Direction Accuracy, CI Coverage
4. Classify the SKU (Excellent/Good/Fair/Poor)
5. Append the result to accuracy_history.json

Usage:
    python run_weekly_scoring.py --sku-list skus_30.txt --week 2026-06-09
"""

import argparse
import json
import sys
from datetime import datetime

import numpy as np
import pandas as pd
import requests

from accuracy_monitor import compute_sku_metrics, record_weekly_score, classify_sku

BASE_URL = "http://127.0.0.1:8000"
DATA_PATH = "demand_history.csv"


def score_sku(sku_id: str, week_label: str) -> dict:
    """Fetch forecast for a SKU and score it against held-out actuals."""
    try:
        resp = requests.get(
            f"{BASE_URL}/api/forecast/advanced/{sku_id}",
            params={"forecast_days": 7, "include_seasonality": True},
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        print(f"  {sku_id}: ERROR fetching forecast — {e}")
        return None

    forecasts = data.get("forecasts", [])
    if not forecasts:
        print(f"  {sku_id}: no forecast data returned")
        return None

    # Load actuals for the matching dates
    df_all = pd.read_csv(DATA_PATH, parse_dates=["date"])
    sku_df = df_all[df_all["sku_id"] == sku_id].set_index("date")

    actual, predicted, ci_low, ci_high = [], [], [], []
    for f in forecasts:
        d = pd.Timestamp(f["forecast_date"])
        if d in sku_df.index:
            actual.append(sku_df.loc[d, "quantity_demanded"])
            predicted.append(f["predicted_demand"])
            ci_low.append(f["confidence_interval_low"])
            ci_high.append(f["confidence_interval_high"])

    if len(actual) == 0:
        print(f"  {sku_id}: no matching actuals for forecast period")
        return None

    metrics = compute_sku_metrics(
        np.array(actual), np.array(predicted), np.array(ci_low), np.array(ci_high)
    )
    entry = record_weekly_score(sku_id, week_label, metrics)
    print(f"  {sku_id}: MAPE={entry['mape']}%  CI={entry['ci_coverage']}%  [{entry['classification']}]")
    return entry


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--sku-list", default=None, help="Text file, one SKU per line")
    parser.add_argument("--week", default=datetime.now().strftime("%Y-%m-%d"))
    args = parser.parse_args()

    if args.sku_list:
        with open(args.sku_list) as f:
            skus = [line.strip() for line in f if line.strip()]
    else:
        # Default 30-SKU baseline list
        skus = [
            "SKU-00064", "SKU-00278", "SKU-00216", "SKU-00477", "SKU-00269",
            "SKU-00247", "SKU-00361", "SKU-00474", "SKU-00377", "SKU-00463",
            "SKU-00383", "SKU-00343", "SKU-00129", "SKU-00495", "SKU-00218",
            "SKU-00244", "SKU-00115", "SKU-00310", "SKU-00391", "SKU-00112",
            "SKU-00451", "SKU-00151", "SKU-00350", "SKU-00026", "SKU-00179",
            "SKU-00351", "SKU-00453", "SKU-00201", "SKU-00062", "SKU-00193",
        ]

    print(f"Scoring {len(skus)} SKUs for week {args.week}...")
    results = []
    for sku in skus:
        r = score_sku(sku, args.week)
        if r:
            results.append(r)

    print(f"\nDone. {len(results)}/{len(skus)} SKUs scored successfully.")
    print("Results saved to accuracy_history.json")


if __name__ == "__main__":
    main()