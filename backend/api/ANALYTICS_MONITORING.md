# Analytics API Monitoring Plan
**SupplyMind — Week 5**
**Owner: Pavan**
**Last Updated: June 9, 2026**

---

## Daily Metrics to Track

| Metric | Target | Alert If |
|---|---|---|
| Requests Served | All endpoints | Any failure |
| Avg Latency | < 3000ms | > 500ms p99 |
| Success Rate | 100% | < 99.9% |
| Error Count | 0 | > 0 |

---

## Data Quality Checks

| Check | Frequency | Alert If |
|---|---|---|
| Row count drift | Daily | > 5% change |
| KPI drift day-over-day | Daily | > 10% change |
| Null/Zero count | Daily | Any new nulls |
| supplier-risks count | Daily | Not 200 |

---

## Alert Thresholds

| Alert | Threshold | Action |
|---|---|---|
| High Latency | p99 > 500ms | Check Render logs |
| Error Rate | > 0.1% | Check API logs |
| KPI Drift | > 10% | Cross-check SQL |
| Row Count Drift | > 5% | Check DB integrity |
| Timeout | Any | Restart service |

---

## Weekly Monday SQL Cross-Check

Every Monday run:
```sql
-- Verify supplier count
SELECT COUNT(*) FROM suppliers;
-- Expected: 200

-- Verify inventory positions
SELECT COUNT(DISTINCT sku_id)
FROM inventory_positions
WHERE date = (SELECT MAX(date)
FROM inventory_positions);
-- Expected: 50

-- Verify supplier performance
SELECT COUNT(DISTINCT supplier_id)
FROM supplier_performance;
-- Expected: 200