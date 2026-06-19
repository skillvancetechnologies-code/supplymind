# Analytics API Handoff Guide
SupplyMind — Week 6 Day 5
Owner: Pavan
Date: June 20, 2026
For: Next team taking over analytics API

---

## Overview

This API serves all supply chain analytics
data to the SupplyMind dashboard. It connects
to Supabase PostgreSQL and runs on Render.

Base URL: https://supplymind-zmk0.onrender.com
Swagger: https://supplymind-zmk0.onrender.com/docs
GitHub: skillvancetechnologies-code/supplymind

---

## All 9 Core Endpoints

### 1. GET /api/analytics/supplier-scorecard/{id}
What it does: Returns supplier KPIs with
benchmarking percentiles vs peer group
Returns: OTIF, fill rate, quality, percentile rank
Speed: ~2.5s (warm), ~3s (cold)
Common errors: 404 if supplier_id invalid

### 2. GET /api/analytics/supplier-peers/{id}
What it does: Compares supplier to peers
in same category
Returns: Top performer, median, supplier rank
Speed: ~2.5s
Common errors: 404 if supplier_id invalid

### 3. GET /api/analytics/inventory-summary
What it does: Dashboard inventory KPIs
Returns: Critical/warning/healthy SKU counts,
total inventory value
Speed: ~2.4s
Common errors: 500 if database connection drops

### 4. GET /api/analytics/disruption-risks
What it does: Lists SKUs at risk of stockout
Returns: SKU name, days of cover, urgency
Speed: ~1.5s
Common errors: 500 if no critical SKUs found

### 5. GET /api/analytics/supplier-risks
What it does: Risk scores for all 200 suppliers
Returns: OTIF, risk score, risk tier, trend
Speed: ~1.1s
Common errors: None typically — stable endpoint

### 6. GET /api/supplier-actions
What it does: Recommended actions for ALL
suppliers based on performance
Returns: Action, reason, urgency for each supplier
Speed: ~3s (loops through 200 suppliers)
Common errors: 500 if performance data missing

### Supplier Specific Endpoint

GET /api/supplier-actions/{supplier_id}

What it does:
Returns recommended actions for one supplier.

Returns:
Supplier information, recommended actions, urgency, reason, and action timeline.

Common errors:
404 if supplier_id is invalid.


### 7. GET /api/analytics/forecast-accuracy
What it does: 30-day demand forecast accuracy
Returns: MAPE per SKU, accuracy tier
Speed: ~2.6s
Common errors: 500 if demand_history empty

### 8. GET /api/analytics/dashboard-summary
What it does: Overall supply chain health
for main dashboard
Returns: Total suppliers, SKUs, at-risk counts
Speed: ~2s
Common errors: 500 if any source table is empty

### 9. GET /api/health
What it does: Simple health check
Speed: <100ms
Common errors: None — always fast

---

## Performance Summary

Single endpoint requests generally respond within 1–3 seconds under normal usage.

Stress Test Results

• 50 concurrent requests
  - Average Response: 8.37 seconds
  - p95: 15.15 seconds
  - Error Rate: 0%

• 100 concurrent requests
  - Average Response: 18.06 seconds
  - p95: 25.24 seconds
  - Error Rate: 0%

Note:
The application is deployed on Render Free Tier. During heavy concurrent load, response times increase, but no request failures were observed.

Note:
Higher latency is expected because the application is deployed on Render Free Tier.
No request failures occurred during testing.

---

## Daily Monitoring Checklist

- [ ] Check response time — should stay under 2s
- [ ] Check error rate — should be 0%
- [ ] Check Render service status — should be live
- [ ] Check Supabase connection — should be stable

## Weekly Monitoring Checklist

- [ ] Review slow queries in analytics_api.log
- [ ] Run SQL cross-check vs raw tables
- [ ] Run load test with 50 concurrent users
- [ ] Review any error patterns in logs

---

## Troubleshooting Guide

### If endpoint is slow (>3 seconds):
1. Check Render dashboard for CPU/memory usage
2. Check Supabase dashboard for connection pool usage
3. Check if database query needs optimization
4. Consider adding caching for frequently called data

### If endpoint returns errors:
1. Check analytics_api.log for error details
2. Check Render logs for stack trace
3. Verify database column names haven't changed
4. Verify DATABASE_URL environment variable is set

### If connection limit is hit:
1. Increase SQLAlchemy pool size in create_engine()
2. Check for connection leaks (unclosed connections)
3. Consider upgrading Supabase plan if persistent

### If Render service is down:
1. Check Render dashboard for crash logs
2. Redeploy from GitHub main branch
3. Verify environment variables are still set
4. Check Supabase database is not paused

---

## Key Files in Repository

- api.py — Main FastAPI application with all endpoints
- API_REFERENCE.md — Full endpoint documentation
- SERVICE_LEVEL_AGREEMENT.md — SLA details
- ANALYTICS_BASELINE.txt — Performance baseline
- ANALYTICS_MONITORING_PLAN.md — Monitoring strategy
- API_STRESS_TEST.txt — Load test results
- analytics_api.log — Live request logs
- supplier_action_test.py — Script used to validate supplier action recommendations

---

## Contact for Questions

Maintained by: Pavan
GitHub: pk9285433-rgb
For historical context, check commit history
in skillvancetechnologies-code/supplymind repo