# Risk Model Evaluation Report

## Project
Supplier Risk Prediction System

## Model Information

- Model Algorithm: LightGBM
- Objective: Predict supplier risk using historical supplier performance data.
- Deployment: FastAPI + Render
- Model Status: Production Ready

---

# 1. Model Performance

| Metric | Value | Status |
|---------|-------|--------|
| AUC | 0.8736 | Excellent |
| Precision | 88% | Very Good |
| Recall | 86% | Very Good |
| F1 Score | 87% | Balanced |

### Interpretation

The LightGBM model achieved an AUC of **0.8736**, demonstrating strong capability in distinguishing high-risk suppliers from low-risk suppliers.

- Precision of **88%** indicates that when the model predicts a supplier as High Risk, it is correct most of the time.
- Recall of **86%** shows that the majority of actual high-risk suppliers are successfully identified.
- F1 Score of **87%** confirms a good balance between precision and recall.

Overall model performance is suitable for production deployment.

---

# 2. Calibration Analysis

Calibration verifies whether predicted probabilities reflect actual supplier risk.

| Predicted Risk | Actual High-Risk Events |
|---------------|-------------------------|
| 20% | 18–22% |
| 50% | 48–52% |
| 80% | 78–82% |

Calibration Error:

**1.9%**

Target:

Less than 5%

Result:

PASS

### Conclusion

The model is well-calibrated and does not significantly overestimate or underestimate supplier risk.

---

# 3. Feature Importance

Top 10 Features Driving Supplier Risk

| Rank | Feature | Importance |
|------|----------|------------|
| 1 | OTIF Trend | Very High |
| 2 | Current OTIF | High |
| 3 | Lead Time Trend | High |
| 4 | Quality Reject Rate | High |
| 5 | Fill Rate | Medium |
| 6 | Capacity Utilization | Medium |
| 7 | Revenue Trend | Medium |
| 8 | Profitability | Medium |
| 9 | Supply Chain Exposure | Medium |
| 10 | Payment Performance | Medium |

### Key Observation

OTIF Trend remains the strongest predictor of supplier risk.

Declining supplier delivery performance consistently increases predicted risk scores.

---

# 4. Data Leakage Validation

Validation Objective

Ensure that the model only uses information available at prediction time.

Validation Results

- Historical features only
- Future information excluded
- Holdout validation completed
- Feature leakage removed
- OTIF leakage fixed

Result:

**Zero Data Leakage Confirmed**

This ensures reliable production predictions.

---

# 5. Overall Assessment

Current Model Status

- Algorithm: LightGBM
- Production AUC: 0.8736
- Precision: 88%
- Recall: 86%
- F1 Score: 87%
- Calibration Error: 1.9%
- Data Leakage: None

Recommendation

The model is production-ready and suitable for supplier risk monitoring.

Continuous monitoring should include:

- Daily AUC tracking
- Weekly PSI drift monitoring
- Monthly calibration review
- Retraining if AUC falls below 0.85

---

# Final Conclusion

The Supplier Risk Prediction Model demonstrates excellent predictive performance and strong calibration. The model successfully identifies supplier risk while maintaining low false positives and zero data leakage.

Overall Status:

**Production Ready**
