# Risk Monitoring & Alerting System

## Project

Supplier Risk Prediction System

## Objective

The Risk Monitoring & Alerting System continuously evaluates supplier risk scores in production. It ensures that procurement teams receive timely notifications whenever supplier risk increases, enabling proactive intervention before supply chain disruptions occur.

---

# Daily Risk Assessment Process

### Schedule

- **Execution Time:** Every day at **12:00 AM (Midnight)**
- **Execution Type:** Automated batch scoring

### Process Flow

1. Load the latest supplier performance data.
2. Retrieve updated operational and financial metrics.
3. Generate features required by the LightGBM model.
4. Score all active suppliers (200+ suppliers).
5. Compare current risk score with the previous day's score.
6. Identify significant changes in supplier risk.
7. Generate alerts when thresholds are exceeded.
8. Store prediction results and alerts in monitoring logs.

---

# Input Data Sources

The model uses the following updated information during each daily run:

- OTIF (On-Time In-Full) delivery performance
- Lead Time
- Quality Reject Rate
- Fill Rate
- Capacity Utilization
- Payment Performance (if available)
- Revenue and profitability indicators (if available)
- Supply network updates

These inputs provide a comprehensive view of supplier operational performance.

---

# Risk Prediction Model

**Model:** LightGBM

### Production Performance

| Metric | Value |
|---------|-------|
| AUC | 0.8736 |
| Calibration Error | 1.9% |
| Data Leakage | None |
| Status | Production Ready |

The model generates a risk score between **0 and 100** for every supplier.

---

# Output

For every supplier, the monitoring system generates:

- Supplier ID
- Current Risk Score
- Previous Risk Score
- Risk Tier
- Risk Score Change
- Alert Status
- Prediction Timestamp

---

# Alerting Rules

## High Priority Alert

**Condition**

- Risk score increases by **more than 20 points**

**Action**

- Notify Procurement Lead

**Priority**

- High

---

## Critical Risk Alert

**Condition**

- Risk Score exceeds **75**

**Action**

- Notify Supplier Manager
- Notify VP of Supply Chain

**Priority**

- Urgent

---

## Supplier Improvement Alert

**Condition**

- Risk score decreases by **more than 30 points**

**Action**

- Notify Procurement Team

**Purpose**

Recognize supplier improvement and reduce unnecessary monitoring.

---

# Dashboard Design

The monitoring dashboard displays:

- Current supplier risk scores
- Risk Tier
- Daily risk changes
- High-risk suppliers
- Alert history
- Prediction latency
- Model AUC
- Drift Monitoring Status

Suppliers are automatically sorted by **highest risk score first**, allowing procurement teams to focus on the most critical suppliers.

---

# Audit Logging

Every prediction and alert is recorded for traceability.

Each log entry contains:

- Timestamp
- Supplier ID
- Previous Risk Score
- Current Risk Score
- Risk Tier
- Alert Trigger
- Action Taken
- Prediction Status

Example:

```
Timestamp: 2026-07-10 00:00:03
Supplier: SUP-018
Previous Score: 58
Current Score: 82
Alert: Critical Risk
Action: VP Supply Chain Notified
Status: SUCCESS
```

---

# Monitoring Frequency

| Activity | Frequency |
|-----------|-----------|
| Supplier Risk Scoring | Daily |
| Prediction Logging | Daily |
| Alert Generation | Daily |
| AUC Monitoring | Daily |
| Drift Detection (PSI) | Weekly |
| Calibration Review | Monthly |
| Threshold Review | Quarterly |

---

# Performance Targets

| Metric | Target |
|---------|---------|
| Prediction Latency | <500 ms |
| Batch Processing | 200+ suppliers in <5 seconds |
| Production AUC | ≥0.87 |
| Calibration Error | <3% |
| Drift Threshold (PSI) | ≤0.20 |

---

# Validation Results

The monitoring framework was validated using historical supplier data.

Validation Summary:

- Daily batch scoring completed successfully.
- Alert rules triggered correctly.
- High-risk suppliers detected accurately.
- Improvement alerts generated correctly.
- Audit logs recorded successfully.
- Dashboard displays suppliers in descending risk order.
- No monitoring failures observed.

---

# Recommendations

To maintain production performance:

- Run daily automated scoring at midnight.
- Monitor prediction latency and AUC continuously.
- Review alert history weekly.
- Perform PSI-based drift detection every week.
- Retrain the model if AUC falls below **0.85** or PSI exceeds **0.20**.

---

# Conclusion

The Risk Monitoring & Alerting System provides a reliable production framework for continuous supplier risk assessment. Automated daily scoring, rule-based alerts, comprehensive audit logging, and dashboard monitoring enable procurement teams to detect supplier deterioration early and respond quickly.

The monitoring system is fully aligned with the deployed LightGBM production model and supports proactive supply chain risk management.
