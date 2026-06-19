# Supplier Risk Model Handoff Guide

## Overview

The Supplier Risk Model predicts supplier operational risk using machine learning and classifies suppliers into Low, Medium, and High Risk categories.

The model enables procurement teams to identify supplier issues early and prioritize interventions.

---

## Model Inputs

The model uses supplier performance metrics including:

* OTIF (On Time In Full)
* Lead Time Trend
* Quality Reject Rate
* Fill Rate
* Capacity Utilization

---

## Model Output

Outputs include:

* Risk Score (0–100)
* Risk Tier
* Top Risk Factors
* Risk Trend
* Early Warning
* Days Until High Risk

Model Accuracy:

AUC = **0.8736**

---

## Risk Prediction

Available Endpoints

GET /supplier-risk

GET /api/analytics/risk-prediction/{supplier_id}

GET /api/supplier-risk-trends/{supplier_id}

---

## Drift Monitoring

Population Stability Index (PSI)

Thresholds

PSI < 0.10
Stable

PSI 0.10–0.20
Monitor

PSI > 0.20
Alert

Weekly PSI audit is recommended.

---

## Model Retraining

Retraining is required when:

* PSI exceeds 0.20
* Model AUC falls below 0.83
* Significant supplier behavior drift is detected

Estimated retraining time:

Approximately 30 minutes.

---

## Monitoring Schedule

Daily

* PSI calculation
* Risk band monitoring
* Prediction logs

Weekly

* Model AUC validation
* Drift report
* Latency review

Monthly

* False positive audit
* Model performance review

---

## Performance

Prediction latency:

Less than 500 ms

Batch prediction:

200 suppliers in less than 5 seconds

---

## Troubleshooting

Issue:
PSI remains high

Action:
Validate supplier input data and monitor feature distributions.

Issue:
Incorrect predictions

Action:
Verify data quality and feature engineering.

Issue:
AUC degradation

Action:
Retrain model using latest supplier performance data.

---

## Repository Files

main.py

drift_monitor.py

DRIFT_MONITORING_CONFIG.md

DRIFT_VALIDATION.txt

DEGRADATION_TEST.txt

RISK_MODEL_HANDOFF.md

---

## Final Status

The Supplier Risk Prediction System is production-ready with:

* Risk scoring
* Trend prediction
* Early warning
* Drift monitoring
* Visualization
* Performance monitoring
