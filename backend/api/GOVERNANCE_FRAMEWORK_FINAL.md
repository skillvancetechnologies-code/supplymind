# Governance Framework Documentation
SupplyMind — Week 8
Owner: Pavan
Date: June 30, 2026

---
## Governance Overview

The SupplyMind governance framework continuously monitors 200 suppliers,
classifies supplier health into RED, YELLOW, and GREEN categories,
tracks resilience metrics, and triggers escalation workflows to reduce
supply chain disruption risk.

---
## Governance Endpoints Live
Base URL: https://supplymind-zmk0.onrender.com

GET /api/analytics/governance-status
GET /api/analytics/escalations
POST /api/analytics/escalation/{supplier_id}

---

## Resilience Status Metrics (200 Suppliers)
Red (Critical): 8.5% — 17 suppliers
Yellow (Warning): 86.5% — 173 suppliers
Green (Healthy): 5.0% — 10 suppliers
Critical SKUs without backup: 0/200
Resilience achieved: 100%

---

## Supplier Relationship Mapping

Upstream Relationships:
Suppliers depending on other suppliers
for raw materials and components.
Criticality scoring based on:
- Single source dependency
- Contract value threshold
- OTIF performance history

Downstream Relationships:
Suppliers supplying components to
other suppliers in the chain.
Network analysis identifies single
points of failure — if one supplier
fails, which other suppliers are
affected downstream.

---

## Escalation Framework

RED Status (Critical):
- Trigger: OTIF < 70% AND single source
- Action: Escalate to supply chain lead
- Timeline: Within 2 hours
- PM notified immediately

YELLOW Status (Warning):
- Trigger: OTIF 70-85% OR quality issues
- Action: Alert procurement analyst
- Timeline: Monitor daily
- Action plan within 7 days

GREEN Status (Healthy):
- Trigger: OTIF > 85%, quality good
- Action: Standard monitoring
- Timeline: Weekly review

---

## Approval Workflow

Risk Assessment:
PM approves governance thresholds
before they go live in production.

Policy Exceptions:
Senior supplier manager approves
any deviations from standard policy.

Documentation:
All escalations logged in
/api/analytics/escalations endpoint
for full audit trail.

---

## Testing Results

✅ Governance-status endpoint tested successfully
✅ Escalation trigger endpoint tested successfully
✅ Escalations endpoint returns active escalations
✅ 200 suppliers analyzed
✅ Render deployment successful
✅ Swagger responses verified

---

## Governance Dashboard

The governance dashboard displays:
- Supplier health distribution (RED/YELLOW/GREEN)
- Critical suppliers requiring immediate action
- Active escalations
- Resilience status
- Overall supply chain health trends