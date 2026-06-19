# SupplyMind Analytics API Reference Guide
Owner: Pavan
Date: June 17, 2026
Base URL: https://supplymind-zmk0.onrender.com

---

## Endpoint 1: GET /api/analytics/supplier-details

Purpose: Get full details for a single supplier
including performance, trend and SKUs.

Parameters:
- supplier_id (required): e.g. SUP-0001

Example:
GET /api/analytics/supplier-details?supplier_id=SUP-0001

Response:
{
  "supplier_id": "SUP-0001",
  "city": "Madurai",
  "tier": "Tier 3",
  "current_otif": 95.2,
  "avg_lead_time_days": 42.9,
  "fill_rate_pct": 96.1,
  "trend": [{"month": "2024-12", "otif": 100}],
  "skus": ["SKU-00185", "SKU-00228"],
  "supplied_skus": ["SKU-00185", "SKU-00228"]
}

Error Codes:
- 404: Supplier not found
- 500: Server error

---

## Endpoint 2: GET /api/analytics/supplier-risks

Purpose: Get risk scores and tiers for
all 200 suppliers.

Parameters: None

Example:
GET /api/analytics/supplier-risks

Response:
[
  {
    "supplier_id": "SUP-0001",
    "city": "Madurai",
    "tier": "Tier 3",
    "current_otif": 95.2,
    "avg_lead_time_days": 42.9,
    "fill_rate_pct": 96.1,
    "risk_score": 80.0,
    "risk_tier": "Low",
    "trend": "Improving"
  }
]

Error Codes:
- 500: Server error

---

## Endpoint 3: GET /api/analytics/inventory-summary

Purpose: Get high level inventory KPIs
for the dashboard.

Parameters: None

Example:
GET /api/analytics/inventory-summary

Response:
{
  "report_date": "2026-06-17",
  "total_skus_tracked": 50,
  "critical_skus": 2,
  "warning_skus": 17,
  "healthy_skus": 31,
  "total_inventory_value": 3955203375,
  "stockout_risk_value": 0,
  "avg_days_of_cover": 43.6,
  "top_3_critical": [
    {
      "sku_name": "Raw Materials Component 195",
      "days_of_cover": 12.6,
      "current_stock": 2328
    }
  ]
}

Error Codes:
- 500: Server error

---

## Endpoint 4: GET /api/analytics/inventory-detail

Purpose: Get full SKU level inventory list
for the Inventory table on frontend.

Parameters:
- status (optional): critical / warning / healthy
- category (optional): e.g. Electronics

Example:
GET /api/analytics/inventory-detail
GET /api/analytics/inventory-detail?status=critical
GET /api/analytics/inventory-detail?category=Electronics

Response:
[
  {
    "sku_id": "SKU-00195",
    "sku_name": "Raw Materials Component 195",
    "category": "Raw Materials",
    "current_stock": 2328,
    "days_of_cover": 12.6,
    "status": "critical"
  }
]

Status Logic:
- critical = days_of_cover < 14
- warning = 14 to 30 days
- healthy = above 30 days

Error Codes:
- 500: Server error

---

## Endpoint 5: GET /api/analytics/forecast-accuracy

Purpose: Get 30 day forecast accuracy
metrics per SKU.

Parameters: None

Example:
GET /api/analytics/forecast-accuracy

Response:
{
  "report_date": "2026-06-17",
  "total_skus": 50,
  "avg_mape": 18.4,
  "skus": [
    {
      "sku_id": "SKU-00001",
      "mape": 12.3,
      "accuracy_tier": "Excellent"
    }
  ]
}

Error Codes:
- 500: Server error

---

## Endpoint 6: GET /api/analytics/disruption-risks

Purpose: Get SKUs that are at risk of
stockout based on days of cover.

Parameters: None

Example:
GET /api/analytics/disruption-risks

Response:
[
  {
    "sku_id": "SKU-00195",
    "sku_name": "Raw Materials Component 195",
    "days_of_cover": 12.6,
    "closing_stock_units": 2328,
    "urgency": "High"
  }
]

Error Codes:
- 500: Server error

---

## Endpoint 7: GET /api/analytics/supplier-scorecard/{supplier_id}

Purpose: Get enhanced scorecard with
benchmarks and percentile ranks
for a supplier.

Parameters:
- supplier_id (required): e.g. SUP-0001

Example:
GET /api/analytics/supplier-scorecard/SUP-0001

Response:
{
  "supplier_id": "SUP-0001",
  "supplier_name": "Biotique",
  "category": "Electronics",
  "kpis": {
    "otif_pct": 95.2,
    "fill_rate_pct": 96.1,
    "quality_reject_pct": 1.2,
    "avg_lead_time_days": 42.9
  },
  "benchmarks": {
    "otif_percentile": 78.0,
    "industry_avg_otif": 85.3,
    "best_otif_in_category": 99.7
  },
  "benchmark_summary": "This supplier OTIF is
  better than 78% of similar suppliers"
}

Error Codes:
- 404: Supplier not found
- 500: Server error

---

## Endpoint 8: GET /api/analytics/supplier-peers/{supplier_id}

Purpose: Get peer group comparison for
a supplier within same category.

Parameters:
- supplier_id (required): e.g. SUP-0001

Example:
GET /api/analytics/supplier-peers/SUP-0001

Response:
{
  "supplier_id": "SUP-0001",
  "peer_group": "Electronics",
  "total_peers": 45,
  "this_supplier_rank": 12,
  "top_performer": {
    "supplier_id": "SUP-0143",
    "avg_otif": 99.7
  },
  "median_performance": {
    "avg_otif": 85.3,
    "avg_fill_rate": 91.2
  }
}

Error Codes:
- 404: Supplier not found
- 500: Server error

---

## Endpoint 9: GET /api/supplier-actions/{supplier_id}

Purpose: Get recommended actions for a
supplier based on their performance metrics.

Parameters:
- supplier_id (required): e.g. SUP-0001

Example:
GET /api/supplier-actions/SUP-0001

Response:
{
  "supplier_id": "SUP-0001",
  "supplier_name": "Biotique",
  "total_actions": 1,
  "recommended_actions": [
    {
      "action": "Continue monitoring",
      "reason": "All KPIs within range",
      "urgency": "LOW",
      "act_within": "Monitor"
    }
  ]
}

Urgency Levels:
- URGENT: Act within 3 days
- HIGH: Act within 1 week
- MEDIUM: Act within 2 weeks
- LOW: Monitor only

Error Codes:
- 404: Supplier not found
- 500: Server error

--------
---

## Endpoint 10: GET /health

Purpose: Check if the API is running
and healthy.

Parameters: None

Example:
GET /health

Response:
{
  "status": "healthy",
  "message": "SupplyMind Analytics API is running"
}

Error Codes:
- 500: Server error

---

## Endpoint 11: GET /api/analytics/dashboard-summary

Purpose: Get overall supply chain summary
for the main dashboard command center.

Parameters: None

Example:
GET /api/analytics/dashboard-summary

Response:
{
  "total_suppliers": 200,
  "total_skus": 50,
  "critical_skus": 2,
  "at_risk_suppliers": 5,
  "avg_otif": 85.3,
  "avg_days_of_cover": 43.6
}

Error Codes:
- 500: Server error

---

## Endpoint 12: GET /api/analytics/refresh

Purpose: Refresh the dashboard data
and clear any cached values.

Parameters: None

Example:
GET /api/analytics/refresh

Response:
{
  "status": "refreshed",
  "message": "Dashboard data refreshed successfully"
}

Error Codes:
- 500: Server error

---

## Endpoint 13: GET /api/analytics/inventory-health

Purpose: Get overall health status of
inventory across all SKUs.

Parameters: None

Example:
GET /api/analytics/inventory-health

Response:
{
  "total_skus": 50,
  "healthy_count": 31,
  "warning_count": 17,
  "critical_count": 2,
  "health_score": 82.5,
  "stockout_risk_skus": [
    {
      "sku_id": "SKU-00195",
      "sku_name": "Raw Materials Component 195",
      "days_of_cover": 12.6
    }
  ]
}

Error Codes:
- 500: Server error

---

## Endpoint 14: GET /api/analytics/reorder-alerts

Purpose: Get list of SKUs that need
to be reordered urgently.

Parameters: None

Example:
GET /api/analytics/reorder-alerts

Response:
[
  {
    "sku_id": "SKU-00195",
    "sku_name": "Raw Materials Component 195",
    "current_stock": 2328,
    "reorder_point": 5000,
    "days_of_cover": 12.6,
    "alert_level": "urgent"
  }
]

Error Codes:
- 500: Server error

---

## Endpoint 15: GET /api/analytics/supplier-summary

Purpose: Get high level summary of
all suppliers performance.

Parameters: None

Example:
GET /api/analytics/supplier-summary

Response:
{
  "total_suppliers": 200,
  "avg_otif": 85.3,
  "avg_fill_rate": 91.2,
  "high_risk_count": 15,
  "medium_risk_count": 45,
  "low_risk_count": 140,
  "top_performer": {
    "supplier_id": "SUP-0143",
    "supplier_name": "Cummins India",
    "otif": 99.7
  }
}

Error Codes:
- 500: Server error

---

## Endpoint 16: GET /api/analytics/demand-accuracy

Purpose: Get demand forecast accuracy
metrics across all SKUs.

Parameters: None

Example:
GET /api/analytics/demand-accuracy

Response:
{
  "report_date": "2026-06-17",
  "total_skus": 50,
  "avg_accuracy": 81.6,
  "excellent_count": 15,
  "good_count": 20,
  "needs_improvement_count": 15,
  "skus": [
    {
      "sku_id": "SKU-00001",
      "accuracy_pct": 87.7,
      "accuracy_tier": "Good"
    }
  ]
}

Error Codes:
- 500: Server error

---

## Endpoint 17: GET /api/supplier-actions

Purpose: Get recommended actions for
ALL 200 suppliers in a single response.
Used by the global Recommended Actions
page on the frontend.

Parameters: None

Example:
GET /api/supplier-actions

Response:
[
  {
    "supplier_id": "SUP-0001",
    "supplier_name": "Biotique",
    "category": "Electronics",
    "total_actions": 1,
    "recommended_actions": [
      {
        "action": "Continue monitoring",
        "reason": "All KPIs within range",
        "urgency": "LOW",
        "act_within": "Monitor"
      }
    ]
  }
]

Urgency Levels:
- URGENT: Act within 3 days
- HIGH: Act within 1 week
- MEDIUM: Act within 2 weeks
- LOW: Monitor only

Error Codes:
- 500: Server error