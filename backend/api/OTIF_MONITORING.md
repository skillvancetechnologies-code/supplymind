# OTIF Monitoring & Drift Detection
SupplyMind — Week 8 Wednesday
Owner: Pavan
Date: July 2, 2026

---

## OTIF Metrics (Per Supplier Per Week)

On-Time: Delivery date matches promised
         date (±1 day buffer)
In-Full: Quantity matches order quantity
         (±2% tolerance)
Combined OTIF: (On-time + In-full) / 2
Trend: Weekly OTIF tracked for drift

---

## Drift Detection Algorithm

Baseline: OTIF moving average (8 weeks)
Threshold: OTIF drops >5% week-over-week
Trigger: Auto-alert to procurement analyst
Action: Investigate supplier

---

## Response SLA

Alert sent: Immediately on detection
Investigation: Within 24 hours
Root cause: Documented by procurement lead
Resolution: Plan shared with supplier

Dashboard:
Supplier-wise and category-wise OTIF trend visualization.

Review Frequency:
OTIF monitored weekly for all suppliers.

---

## Endpoint

GET /api/analytics/otif-drift/{supplier_id}