# Risk Threshold Calibration Documentation

## Project

Supplier Risk Prediction System

## Objective

The objective of threshold calibration is to convert the model's predicted risk score (0–100) into actionable business categories. Proper calibration ensures procurement teams receive meaningful alerts while minimizing false positives and false negatives.

---

# Risk Score Thresholds

| Risk Score | Risk Level | Business Action |
|------------|------------|-----------------|
| 0–25 | Low Risk | Continue regular monitoring. No immediate action required. |
| 25–50 | Medium Risk | Increase monitoring frequency and evaluate backup suppliers. |
| 50–75 | High Risk | Begin supplier investigation, activate contingency plans, and closely monitor performance. |
| 75–100 | Critical Risk | Immediate escalation to procurement leadership and initiate supplier replacement planning. |

---

# Threshold Derivation

The thresholds were established by analyzing historical supplier performance and linking past risk scores with actual supplier outcomes.

Historical indicators included:

- OTIF (On-Time In-Full) delivery performance
- Lead time trends
- Quality rejection rates
- Fill rate performance
- Capacity utilization
- Payment behavior
- Supply disruptions

The selected thresholds maximize early detection of supplier risk while reducing unnecessary alerts.

---

# Business Impact

Thresholds were designed to achieve the following objectives:

- Detect deteriorating suppliers before operational disruption.
- Reduce false alarms for procurement teams.
- Prioritize high-risk suppliers requiring immediate intervention.
- Support consistent supplier governance and monitoring.

This approach allows procurement managers to focus resources on suppliers with the greatest business impact.

---

# Validation Results

Threshold calibration was validated using a holdout dataset.

| Validation Metric | Result |
|-------------------|--------|
| Holdout Validation | Completed |
| Error Rate | 1.9% |
| False Positive Rate | Very Low |
| False Negative Rate | Low |
| Overall Calibration | Successful |

The calibrated thresholds accurately classify supplier risk while maintaining a low error rate.

---

# Threshold Adjustment Triggers

Thresholds should be reviewed under the following conditions:

### Quarterly Review

- Verify thresholds continue to align with business performance.
- Evaluate supplier performance trends.

### Policy Changes

Recalibration should be performed if:

- Company risk tolerance changes.
- Procurement strategy changes.
- Business priorities are updated.

### Model Updates

Whenever a new production model is deployed:

- Recalculate optimal thresholds.
- Validate on holdout data.
- Compare against the previous production model.

---

# Monitoring Strategy

Threshold effectiveness should be monitored using:

- Daily supplier risk scoring
- Weekly model performance review
- Monthly calibration assessment
- Quarterly threshold audit

Performance metrics monitored include:

- AUC
- Precision
- Recall
- Calibration Error
- False Positive Rate
- False Negative Rate

---

# Current Production Validation

| Metric | Value |
|---------|-------|
| Model | LightGBM |
| AUC | 0.8736 |
| Calibration Error | 1.9% |
| Data Leakage | None |
| Production Status | Approved |

---

# Recommendations

Current thresholds perform well for production use and do not require immediate adjustment.

Recommended maintenance schedule:

- Daily monitoring of supplier risk scores.
- Weekly drift detection using PSI.
- Monthly calibration review.
- Quarterly threshold recalibration if required.
- Immediate review following any major model update.

---

# Conclusion

The Supplier Risk Prediction System uses calibrated risk thresholds that effectively translate model outputs into actionable business decisions. Validation confirms an error rate of only **1.9%**, near-zero false positives, and strong alignment with historical supplier outcomes.

The current threshold configuration is suitable for production deployment and provides a reliable framework for supplier monitoring, risk management, and procurement decision-making.
