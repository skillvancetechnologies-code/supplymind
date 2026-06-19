# FORECAST_HANDOFF.md
**SupplyMind — Forecast System Handoff Guide**
*Week 6 Day 5 | Author: Rahul K | Date: 2026-06-19*
*For: Incoming team / Week 7 analytics team*

---

## 1. What Is the Forecast System?

The SupplyMind Forecast System predicts how much of each SKU (product) will be demanded over the next X days. It helps the supply chain team decide:

- How much stock to order
- When to reorder
- Which SKUs are at risk of stockout

**Model used:** LightGBM (gradient boosting) with seasonal decomposition via `statsmodels`
**Accuracy:** Average MAPE ~10% across 100 SKUs (meaning forecasts are ~10% off on average — well within acceptable range for supply chain planning)
**Data source:** `demand_history.csv` — one row per SKU per day with `quantity_demanded`

---

## 2. What Does It Do?

### Input
- A SKU ID (e.g. `SKU-00064`)
- Number of forecast days (e.g. 30)

### Output
For each forecast day:
- `predicted_demand` — the forecasted quantity
- `confidence_interval_low` / `confidence_interval_high` — the range of likely demand
- `seasonal_note` — a human-readable explanation (e.g. "High spike expected — Tuesday is peak day")

### Features the model uses
| Feature | What it captures |
|---------|-----------------|
| `lag_7` | Demand 7 days ago |
| `lag_14` | Demand 14 days ago |
| `lag_28` | Demand 28 days ago |
| `rolling_7` | 7-day rolling average |
| `rolling_28` | 28-day rolling average |
| `month` | Month of year (1–12) |
| `day_of_week` | Mon–Sun pattern |
| `week_of_year` | Annual week cycle |
| `quarter` | Q1–Q4 business cycle |
| `is_promotion` | Promotional flag (if present) |

### Seasonality detection
The advanced endpoint (`/api/forecast/advanced/{sku_id}`) also runs `statsmodels.seasonal_decompose` to detect:
- **Trend** — is demand growing, stable, or declining?
- **Seasonality** — weekly/monthly/quarterly patterns
- **Residual** — random noise after removing trend + seasonality
- **Pattern type** — classifies each SKU as `consistent`, `moderately_seasonal`, or `highly_seasonal`

---

## 3. API Endpoints

| Method | Endpoint | What it does |
|--------|----------|--------------|
| `POST` | `/api/forecast` | Standard 30-day forecast for one SKU |
| `GET` | `/api/forecast/advanced/{sku_id}` | Forecast + seasonal decomposition + demand alert |
| `POST` | `/api/forecast/batch` | Forecast up to 50 SKUs at once |
| `GET` | `/api/accuracy/dashboard` | Full accuracy dashboard (30 SKUs, 4-week history) |
| `GET` | `/api/accuracy/sku/{sku_id}` | Per-SKU weekly accuracy history |
| `GET` | `/api/accuracy/alerts` | Week-over-week deterioration alerts |
| `GET` | `/api/accuracy/alerts/final` | Combined Poor-MAPE + deterioration alerts |
| `POST` | `/api/accuracy/alerts/notify` | Send (or preview) alert email to distribution list |

**Swagger UI:** `http://127.0.0.1:8000/docs`

---

## 4. Alerts

### Alert 1 — Poor Forecast (MAPE > 15%)
- **What it means:** The model is >15% off for this SKU — not reliable enough for procurement decisions
- **What to do:** Check input data quality (gaps, outliers, wrong units)
- **Endpoint:** `GET /api/accuracy/alerts/final`

### Alert 2 — Accuracy Declining (MAPE increased >2% week-over-week)
- **What it means:** The model was accurate last week but got worse this week
- **What to do:** Check for a recent demand trend change (new promotion, supplier switch, seasonal shift not yet in training data)
- **Endpoint:** `GET /api/accuracy/alerts` or `GET /api/accuracy/alerts/final`

### Email notifications
- **File:** `accuracy_alerts_final.py`
- **Distribution list:** Configured in `DISTRIBUTION_LIST` variable
- **To enable:** Set `EMAIL_ENABLED = True` and fill in `SMTP_USER` / `SMTP_PASS`
- **Currently:** Running in preview mode (email content generated but not sent)

---

## 5. Retraining

| What | Detail |
|------|--------|
| Trigger | Automatic: MAPE >15% for 3+ consecutive SKUs OR manual |
| Frequency | Daily data refresh + monthly full retrain |
| Time per SKU | ~5 minutes (LightGBM fit on full history) |
| Training data | Last 2 years of `demand_history.csv` |
| How to retrain | Re-run `main.py` — model cache expires after 1 hour (TTL) |
| Script | `run_weekly_scoring.py --week YYYY-MM-DD` |

**Note:** The model cache (`_model_cache` dict in `main.py`) holds fitted models in memory for 1 hour. After TTL, the next request automatically refits. For manual retrain, restart the server.

---

## 6. Monitoring Schedule

### Daily
- Check alert count via `GET /api/accuracy/alerts/final`
- Alert count should be low (ideally <5% of active SKUs)
- Check `forecast.log` for any 5xx errors
- Review sign-off checklist in `forecast_accuracy_dashboard.html`

### Weekly (every Monday)
- Run `python run_weekly_scoring.py --week YYYY-MM-DD`
- Check avg MAPE (should remain ~10%)
- Review `GET /api/accuracy/dashboard` for trend direction
- Check `bottom_5_worst` — any new entries vs last week?

### Monthly
- Review feature importance (are lag features still most predictive?)
- Check if any SKU has changed demand pattern (new supplier, new product variant)
- Run full model benchmark — compare LightGBM vs naive baseline
- Update `FORECAST_BASELINE.txt` if avg MAPE improves significantly

---

## 7. Performance SLAs

| Metric | Target | Achieved (stress test) |
|--------|--------|----------------------|
| Single SKU avg response | < 1s | ✅ 0.28s |
| Single SKU p95 | < 1s | ✅ 0.65s |
| 50 concurrent requests p95 | < 1s | ✅ 0.74s |
| 100 concurrent requests p95 | < 1s | ✅ 0.94s |
| Batch 50 SKUs | < 2s | ✅ 1.74s |
| Error rate | 0% | ✅ 0% |
| Negative predictions | 0 | ✅ 0 |

---

## 8. If Something Breaks

### Forecast values look weird (very high or very low)
1. Check `demand_history.csv` — are recent rows present and correct?
2. Look for data gaps (missing dates) or spikes (data entry errors)
3. Check `execution_log.txt` for any warnings during data load
4. Clear model cache by restarting the server — it will refit on next request

### Alerts spamming (too many Poor-MAPE or deterioration alerts)
1. First check if there's a real demand shift (promotion, seasonality event, supplier issue)
2. If demand shift is real → retrain immediately with updated data
3. If it's a data quality issue (wrong numbers in CSV) → fix the CSV and restart
4. If it's a one-off spike → wait one week and monitor; alerts should self-clear

### Accuracy drops suddenly (avg MAPE goes from 10% to 20%+)
1. Check if `demand_history.csv` was updated correctly (last few rows)
2. Check if `is_promotion` flag is correctly populated for recent dates
3. Retrain immediately: restart server to clear cache, then run `run_weekly_scoring.py`
4. If MAPE doesn't recover after retrain → escalate to ML lead

### Server won't start
```cmd
# Check for import errors
python main.py

# Check if port 8000 is already in use
netstat -ano | findstr :8000

# Kill conflicting process (replace PID)
taskkill /PID <PID> /F

# Restart
uvicorn main:app --reload
```

---

## 9. File Map

| File | Purpose |
|------|---------|
| `main.py` | FastAPI app — all endpoints, data loading, model training |
| `accuracy_monitor.py` | Weekly accuracy scoring, classification, history storage |
| `accuracy_alerts_final.py` | Dual alert system + email distribution |
| `run_weekly_scoring.py` | CLI script to score 30 SKUs weekly |
| `accuracy_history.json` | 4-week rolling accuracy history (auto-updated) |
| `forecast.log` | Per-request structured log (timestamp, sku, latency, status) |
| `execution_log.txt` | Server-level logs (startup, data load, errors) |
| `demand_history.csv` | Source of truth for all historical demand data |
| `FORECAST_BASELINE.txt` | 30-SKU baseline metrics from Week 5 |
| `SEASONALITY_TEST.txt` | Before/after MAPE for 15 SKUs (Week 6 Day 1) |
| `ADVANCED_FORECAST_TEST.txt` | Advanced endpoint validation (Week 6 Day 1) |
| `FORECAST_ACCURACY_TEST.txt` | 30-SKU 4-week accuracy validation (Week 6 Day 2) |
| `FORECAST_MONITORING_FINAL.txt` | Final monitoring validation with dual alerts (Week 6 Day 3) |
| `FORECAST_STRESS_TEST.txt` | 100-SKU stress test results (Week 6 Day 4) |

---

## 10. Quick Start for New Team Member

```cmd
# 1. Activate virtual environment
"C:\Users\RAHUL K\supplymind\venv\Scripts\activate.bat"

# 2. Go to forecasting folder
cd backend\forecasting

# 3. Start the API
uvicorn main:app --reload

# 4. Open Swagger in browser
# http://127.0.0.1:8000/docs

# 5. Test a forecast
# POST /api/forecast
# Body: {"sku_id": "SKU-00064", "forecast_days": 30}

# 6. Check accuracy dashboard
# GET /api/accuracy/dashboard

# 7. Run weekly scoring
python run_weekly_scoring.py --week 2026-06-19
```

---

*Handoff prepared by Rahul K — Week 6, SupplyMind Forecasting Module*
*System is production-ready as of 2026-06-19. All SLA targets met.*
