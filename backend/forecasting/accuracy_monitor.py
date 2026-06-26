"""
SupplyMind — Forecast Accuracy Monitoring
accuracy_monitor.py | Week 6 Day 2
Computes MAPE, RMSE, Direction Accuracy, CI Coverage per SKU,
classifies SKUs, tracks weekly history, and triggers deterioration alerts.
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException
from sklearn.metrics import mean_absolute_percentage_error, mean_squared_error

router = APIRouter()

HISTORY_FILE = Path("accuracy_history.json")


def classify_sku(mape: float, ci_coverage: float) -> str:
    if mape < 8 and ci_coverage > 90:
        return "Excellent"
    elif mape <= 11 and ci_coverage > 85:
        return "Good"
    elif mape <= 15 and ci_coverage > 75:
        return "Fair"
    else:
        return "Poor"


def compute_direction_accuracy(actual: np.ndarray, predicted: np.ndarray) -> float:
    if len(actual) < 2:
        return 0.0
    actual_dir = np.sign(np.diff(actual))
    pred_dir = np.sign(np.diff(predicted))
    matches = (actual_dir == pred_dir).sum()
    return round(float(matches / len(actual_dir)) * 100, 1)


def compute_ci_coverage(actual: np.ndarray, ci_low: np.ndarray, ci_high: np.ndarray) -> float:
    within = ((actual >= ci_low) & (actual <= ci_high)).sum()
    return round(float(within / len(actual)) * 100, 1)


def compute_sku_metrics(actual: np.ndarray, predicted: np.ndarray,
                         ci_low: np.ndarray, ci_high: np.ndarray) -> dict:
    mask = actual > 0
    if mask.sum() == 0:
        return {"mape": 999.0, "rmse": 999.0, "direction_accuracy": 0.0, "ci_coverage": 0.0}

    mape = float(mean_absolute_percentage_error(actual[mask], predicted[mask]) * 100)
    rmse = float(np.sqrt(mean_squared_error(actual, predicted)))
    direction_acc = compute_direction_accuracy(actual, predicted)
    ci_cov = compute_ci_coverage(actual, ci_low, ci_high)

    return {
        "mape": round(mape, 2),
        "rmse": round(rmse, 2),
        "direction_accuracy": direction_acc,
        "ci_coverage": ci_cov,
    }


def load_history() -> dict:
    if HISTORY_FILE.exists():
        with open(HISTORY_FILE) as f:
            return json.load(f)
    return {}


def save_history(data: dict):
    with open(HISTORY_FILE, "w") as f:
        json.dump(data, f, indent=2)


def record_weekly_score(sku_id: str, week_label: str, metrics: dict):
    history = load_history()
    if sku_id not in history:
        history[sku_id] = {"weeks": []}

    classification = classify_sku(metrics["mape"], metrics["ci_coverage"])
    entry = {
        "week": week_label,
        "mape": metrics["mape"],
        "rmse": metrics["rmse"],
        "direction_accuracy": metrics["direction_accuracy"],
        "ci_coverage": metrics["ci_coverage"],
        "classification": classification,
    }

    weeks = history[sku_id]["weeks"]
    weeks = [w for w in weeks if w["week"] != week_label]
    weeks.append(entry)
    weeks.sort(key=lambda w: w["week"])
    history[sku_id]["weeks"] = weeks

    save_history(history)
    return entry


def get_deterioration_alerts(threshold: float = 2.0) -> list:
    history = load_history()
    alerts = []
    for sku_id, d in history.items():
        weeks = d["weeks"]
        if len(weeks) < 2:
            continue
        prev, curr = weeks[-2], weeks[-1]
        delta = round(curr["mape"] - prev["mape"], 2)
        if delta > threshold:
            alerts.append({
                "sku_id": sku_id,
                "prev_mape": prev["mape"],
                "curr_mape": curr["mape"],
                "delta": delta,
                "classification": curr["classification"],
            })
    alerts.sort(key=lambda a: -a["delta"])
    return alerts


def get_dashboard_summary() -> dict:
    history = load_history()
    if not history:
        raise HTTPException(status_code=404, detail="No accuracy history found. Run weekly scoring first.")

    current_rows = []
    for sku_id, d in history.items():
        if not d["weeks"]:
            continue
        latest = d["weeks"][-1]
        prev = d["weeks"][-2] if len(d["weeks"]) > 1 else latest
        current_rows.append({
            "sku_id": sku_id,
            "mape": latest["mape"],
            "rmse": latest["rmse"],
            "direction_accuracy": latest["direction_accuracy"],
            "ci_coverage": latest["ci_coverage"],
            "classification": latest["classification"],
            "delta_vs_prev_week": round(latest["mape"] - prev["mape"], 2),
        })

    current_rows.sort(key=lambda r: r["mape"])

    top5 = current_rows[:5]
    bottom5 = current_rows[-5:][::-1]

    all_weeks = sorted({w["week"] for d in history.values() for w in d["weeks"]})
    trend = []
    for wk in all_weeks:
        vals = [w["mape"] for d in history.values() for w in d["weeks"] if w["week"] == wk]
        if vals:
            trend.append({"week": wk, "avg_mape": round(float(np.mean(vals)), 2)})

    classification_counts = {}
    for r in current_rows:
        classification_counts[r["classification"]] = classification_counts.get(r["classification"], 0) + 1

    return {
        "total_skus": len(current_rows),
        "avg_mape": round(float(np.mean([r["mape"] for r in current_rows])), 2),
        "classification_distribution": classification_counts,
        "top_5_best": top5,
        "bottom_5_worst": bottom5,
        "weekly_trend": trend,
        "deterioration_alerts": get_deterioration_alerts(),
        "heatmap": current_rows,
    }


@router.get("/api/accuracy/dashboard")
def accuracy_dashboard():
    return get_dashboard_summary()


@router.get("/api/accuracy/sku/{sku_id}")
def sku_accuracy_history(sku_id: str):
    history = load_history()
    if sku_id not in history:
        raise HTTPException(status_code=404, detail=f"No accuracy history for {sku_id}")
    return {"sku_id": sku_id, "weeks": history[sku_id]["weeks"]}


@router.get("/api/accuracy/alerts")
def accuracy_alerts():
    alerts = get_deterioration_alerts()
    return {"count": len(alerts), "alerts": alerts}