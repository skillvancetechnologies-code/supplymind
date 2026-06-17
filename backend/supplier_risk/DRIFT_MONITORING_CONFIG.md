# Risk Model Drift Monitoring Configuration

## Objective

Continuously monitor supplier risk model stability and detect changes in supplier behavior that may reduce prediction quality.

## Daily Monitoring

* Run supplier risk scoring on all new suppliers.
* Compare feature distributions with baseline.
* Calculate Population Stability Index (PSI).

## PSI Thresholds

| PSI Value | Status  | Action            |
| --------- | ------- | ----------------- |
| < 0.10    | Stable  | No action         |
| 0.10–0.20 | Monitor | Review next day   |
| > 0.20    | Alert   | Investigate drift |

## Risk Band Monitoring

Track percentage of suppliers in:

* Low Risk (0–40)
* Medium Risk (40–70)
* High Risk (70–100)

Trigger alert if any band changes by more than **15%** compared with the baseline.

## Performance Monitoring

Current baseline model AUC:

0.8736

If AUC falls more than **5% below baseline**, trigger model retraining.

Retraining Threshold:

AUC < 0.83

## Weekly Audit

Frequency:

* Every Monday

Tasks:

* Recalculate PSI
* Evaluate AUC
* Review prediction latency
* Compare risk band distribution
* Generate monitoring report

## Alerts

Alert Conditions:

* PSI > 0.20
* AUC < 0.83
* High-risk distribution shift >15%
* API latency p99 >500 ms

Escalation:

Notify engineering team and begin model validation before retraining.
