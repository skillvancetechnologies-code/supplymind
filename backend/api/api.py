from tracemalloc import start

import pandas as pd
import numpy as np
import math
from sqlalchemy import create_engine
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import date, timedelta
import uvicorn
import time
import logging
from datetime import datetime

logging.basicConfig(
    filename='analytics_api.log',
    level=logging.INFO,
    format='%(message)s'
)

def log_request(endpoint, latency_ms, row_count, status):
    msg = f"{datetime.now()} | {endpoint} | {latency_ms}ms | rows:{row_count} | {status}"
    print(msg)
    logging.info(msg)


# PostgreSQL connection
import os
engine = create_engine(
    os.environ.get("DATABASE_URL")
)
supplier_df=pd.read_sql("SELECT * FROM suppliers",engine)

# FastAPI app
app = FastAPI(title="SupplyMind Analytics API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# KPI Cache
cached_kpis = {}

def compute_dashboard_kpis():
    global cached_kpis

    # Inventory KPIs
    inv = pd.read_sql("""
        SELECT
            COUNT(DISTINCT sku_id) as total_skus,
            SUM(CASE WHEN days_of_cover < 7
                THEN 1 ELSE 0 END) as critical,
            SUM(CASE WHEN days_of_cover
                BETWEEN 7 AND 14
                THEN 1 ELSE 0 END) as warning,
            ROUND(AVG(days_of_cover)::numeric,1)
                as avg_doc
        FROM inventory_positions
        WHERE date = (
            SELECT MAX(date)
            FROM inventory_positions
        )
    """, engine).to_dict(orient='records')[0]

    # Supplier KPIs
    sup = pd.read_sql("""
        SELECT
            ROUND(AVG(otif_percentage)::numeric,2)
                as avg_otif,
            COUNT(DISTINCT CASE
                WHEN otif_percentage < 75
                THEN supplier_id END)
                as high_risk_count,
            COUNT(DISTINCT supplier_id)
                as total_suppliers
        FROM supplier_performance
        WHERE month = (
            SELECT MAX(month)
            FROM supplier_performance
        )
    """, engine).to_dict(orient='records')[0]

    # Store in cache
    cached_kpis = {
        'total_skus': inv['total_skus'],
        'critical_alerts': inv['critical'],
        'warning_alerts': inv['warning'],
        'avg_days_of_cover': inv['avg_doc'],
        'avg_otif': sup['avg_otif'],
        'high_risk_suppliers': sup['high_risk_count'],
        'total_suppliers': sup['total_suppliers']
    }

    print("KPIs refreshed successfully")

compute_dashboard_kpis()
scheduler = BackgroundScheduler()
scheduler.add_job(compute_dashboard_kpis, 'interval', hours=24)
scheduler.start()


@app.get("/api/analytics/inventory-health")
def inventory_health():

    query = """
    SELECT
        COUNT(DISTINCT sku_id) as total_skus,
        SUM(CASE WHEN days_of_cover < 7
            THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN days_of_cover
            BETWEEN 7 AND 14
            THEN 1 ELSE 0 END) as warning,
        SUM(CASE WHEN days_of_cover > 60
            THEN 1 ELSE 0 END) as overstock,
        ROUND(AVG(days_of_cover)::numeric,1)
            as avg_doc
    FROM inventory_positions
    WHERE date = (
        SELECT MAX(date)
        FROM inventory_positions
    )
    """

    result = pd.read_sql(query, engine)

    return result.to_dict(orient='records')[0]


@app.get("/api/analytics/reorder-alerts")
def reorder_alerts():

    query = """
    SELECT
        sk.sku_name,
        sk.category,
        ip.closing_stock_units,
        sk.reorder_point_units,
        ip.days_of_cover,
        CASE
            WHEN ip.days_of_cover < 7
            THEN 'Critical'
            WHEN ip.days_of_cover < 14
            THEN 'Warning'
            ELSE 'OK'
        END as urgency
    FROM skus sk
    JOIN inventory_positions ip
        ON sk.sku_id = ip.sku_id
    WHERE ip.date = (
        SELECT MAX(date)
        FROM inventory_positions
    )
    AND ip.is_low_stock_alert = 1
    ORDER BY ip.days_of_cover ASC
    LIMIT 20
    """

    result = pd.read_sql(query, engine)

    return result.to_dict(orient='records')


@app.get("/api/analytics/supplier-summary")
def supplier_summary():

    query = """
    SELECT
        ROUND(AVG(otif_percentage)::numeric,2)
            as avg_otif,
        COUNT(DISTINCT CASE
            WHEN otif_percentage < 75
            THEN supplier_id END)
            as high_risk_count,
        COUNT(DISTINCT supplier_id)
            as total_suppliers
    FROM supplier_performance
    WHERE month = (
        SELECT MAX(month)
        FROM supplier_performance
    )
    """

    result = pd.read_sql(query, engine)

    return result.to_dict(orient='records')[0]


@app.get("/api/analytics/demand-accuracy")
def demand_accuracy():

    query = """
    SELECT
        sk.category,
        COUNT(DISTINCT dh.sku_id) as sku_count,
        ROUND(AVG(dh.quantity_demanded)::numeric,1)
            as avg_daily_demand,
        SUM(CASE WHEN dh.is_promotion = 1
            THEN 1 ELSE 0 END) as promotion_days,
        SUM(CASE WHEN dh.month IN (10,11)
            THEN dh.quantity_demanded
            ELSE 0 END) as festive_demand,
        SUM(CASE WHEN dh.month NOT IN (10,11)
            THEN dh.quantity_demanded
            ELSE 0 END) as normal_demand
    FROM demand_history dh
    JOIN skus sk
        ON dh.sku_id = sk.sku_id
    WHERE dh.date >= '2024-01-01'
    GROUP BY sk.category
    ORDER BY avg_daily_demand DESC
    """

    result = pd.read_sql(query, engine)

    return result.to_dict(orient='records')


@app.get("/api/analytics/dashboard-summary")
def dashboard_summary():

    return cached_kpis


@app.get("/api/analytics/refresh")
def refresh_dashboard():

    compute_dashboard_kpis()

    return {
        "status": "success",
        "message": "KPI cache refreshed",
        "cached_kpis": cached_kpis
    }


@app.get("/health")
def health():

    return {
        "status": "ok",
        "service": "SupplyMind Analytics API"
    }


@app.get("/api/analytics/disruption-risks")
def get_disruption_risks():
    start = time.time()
    try:
        query = """
            SELECT
      sk.sku_name,

      sk.category,

      ip.closing_stock_units,

      ip.daily_consumption_units,

      ip.days_of_cover,

      sk.reorder_point_units,

      sp.otif_percentage,

      sp.avg_lead_time_days as lead_time_days,

      sp.supplier_id as alternate_supplier,

      CASE
        WHEN ip.days_of_cover < 7
        THEN 'Critical'

        WHEN ip.days_of_cover < 14
        THEN 'Warning'

        ELSE 'Monitor'

      END as urgency

    FROM skus sk

    JOIN inventory_positions ip
      ON sk.sku_id = ip.sku_id

    JOIN supplier_performance sp
      ON sk.primary_supplier_id = sp.supplier_id

    WHERE ip.date = (
      SELECT MAX(date)
      FROM inventory_positions
    )

    AND sp.month = (
      SELECT MAX(month)
      FROM supplier_performance
    )

    AND ip.days_of_cover < 14

    ORDER BY ip.days_of_cover ASC

    LIMIT 20
        """
        result = pd.read_sql(query, engine)
        latency = round((time.time() - start) * 1000, 2)
        log_request("disruption-risks", latency, len(result), "200")
        return result.to_dict(orient="records")
    except Exception as e:
        latency = round((time.time() - start) * 1000, 2)
        log_request("disruption-risks", latency, 0, f"ERROR: {str(e)}")
        return {"error": str(e)}

@app.get("/api/analytics/supplier-risks")
def get_supplier_risks():
    start = time.time()
    try:
        df = pd.read_sql("""
            SELECT 
                s.supplier_id,
                s.city,
                s.city_tier,
                s.avg_lead_time_days,
                AVG(p.otif_percentage) as current_otif,
                AVG(p.fill_rate_pct) as fill_rate_pct
            FROM suppliers s
            LEFT JOIN supplier_performance p 
                ON s.supplier_id = p.supplier_id
            GROUP BY 
                s.supplier_id, s.city, 
                s.city_tier, s.avg_lead_time_days
        """, engine)

        result = []
        for _, row in df.iterrows():
            otif = float(row.get("current_otif") or 0)
            lead = float(row.get("avg_lead_time_days") or 0)
            fill = float(row.get("fill_rate_pct") or 0)

            score = 100
            if otif < 40: score -= 40
            elif otif < 70: score -= 20
            if lead > 20: score -= 20
            elif lead > 10: score -= 10
            if fill < 70: score -= 20
            elif fill < 85: score -= 10

            result.append({
                "supplier_id": str(row.get("supplier_id", "")),
                "city": str(row.get("city", "")),
                "tier": str(row.get("city_tier", "")),
                "current_otif": round(otif, 1),
                "avg_lead_time_days": round(lead, 1),
                "fill_rate_pct": round(fill, 1),
                "risk_score": round(max(score, 0), 1),
                "risk_tier": "High" if otif < 40 else "Medium" if otif < 70 else "Low",
                "trend": "Improving" if otif > 80 else "Declining" if otif < 50 else "Stable"
            })
        latency = round((time.time() - start) * 1000, 2)
        log_request("supplier-risks", latency, len(result), "200")
        return result
    except Exception as e:
        latency = round((time.time() - start) * 1000, 2)
        log_request("supplier-risks", latency, 0, f"ERROR: {str(e)}")
        return {"error": str(e)}
@app.get(
    "/api/analytics/forecast-accuracy",
    summary="Forecast Accuracy Metrics",
    description="Returns 30-day MAPE forecast accuracy metrics for all SKUs"
)
def forecast_accuracy():
    start = time.time()

    try:

        # Load last 30 days WITH date, sorted
        df = pd.read_sql("""
    SELECT
        sku_id,
        date::date,
        quantity_demanded
    FROM demand_history
    WHERE date::date >= (
        SELECT MAX(date::date) FROM demand_history
    ) - INTERVAL '30 days'
    ORDER BY sku_id, date::date
""", engine)

        # Rolling 7-day average as forecast (stable, avoids 100%+ MAPE)
        df['forecast'] = (
            df.groupby('sku_id')['quantity_demanded']
            .transform(lambda x: x.rolling(window=30, min_periods=7).mean().shift(1))
        )

        # Remove nulls and zero actuals
        df = df.dropna()
        df = df[df['quantity_demanded'] != 0]

        # Calculate APE
        df['ape'] = (
            abs(df['quantity_demanded'] - df['forecast'])
            / df['quantity_demanded'] * 100
        )

        # MAPE per SKU
        result = df.groupby('sku_id')['ape'].mean().reset_index()
        result.rename(columns={'ape': 'mape_30day'}, inplace=True)
        

        # Remove inf and NaN from MAPE
        result = result.replace([np.inf, -np.inf], np.nan)
        result = result.dropna(subset=['mape_30day'])

        # Add SKU details
        sku_info = pd.read_sql("""
            SELECT sku_id, sku_name, category
            FROM skus
        """, engine)

        result = result.merge(sku_info, on='sku_id', how='left')

        # Accuracy tiers
        result['accuracy_tier'] = result['mape_30day'].apply(
            lambda x:
                "Excellent"         if x < 15 else
                "Good"              if x < 25 else
                "Needs Improvement"
        )

        # Convert to records and clean any remaining inf/nan
        skus_list = result.to_dict(orient='records')
        for sku in skus_list:
            for key, val in sku.items():
                if isinstance(val, float) and (math.isnan(val) or math.isinf(val)):
                    sku[key] = None

        # Clean avg_mape
        avg_mape = result['mape_30day'].mean()
        if math.isnan(avg_mape) or math.isinf(avg_mape):
            avg_mape = 0.0
        latency = round((time.time() - start) * 1000, 2)
        log_request("forecast-accuracy", latency,len(skus_list), "200")

        return {
            "report_date":  str(date.today()),
            "total_skus":   int(len(result)),
            "avg_mape":     float(round(avg_mape, 2)),
            "skus":         skus_list
        }

    except Exception as e:
        latency = round((time.time() - start) * 1000, 2)
        log_request("forecast-accuracy", latency, 0, f"ERROR: {str(e)}")
        return {"error": str(e)}


@app.get(
    "/api/analytics/inventory-summary",
    summary="Inventory Health Summary",
    description="Returns inventory risk KPIs and top critical SKUs"
)
def inventory_summary():
    start = time.time()

    try:
       # Thresholds adjusted because this dataset
       # has high baseline inventory coverage.
       # Below 14 days is treated as critical risk.
        summary = pd.read_sql("""
            SELECT
                COUNT(DISTINCT sku_id)
                    as total_skus_tracked,
                SUM(
                    CASE
                        WHEN days_of_cover < 14
                        THEN 1
                        ELSE 0
                    END
                ) as critical_skus,
                SUM(
                    CASE
                        WHEN days_of_cover >= 14
                        AND days_of_cover < 30
                        THEN 1
                        ELSE 0
                    END
                ) as warning_skus,
                SUM(
                    CASE
                        WHEN days_of_cover >= 30
                        THEN 1
                        ELSE 0
                    END
                ) as healthy_skus,
                ROUND(
                    AVG(days_of_cover)::numeric,
                    1
                ) as avg_days_of_cover
            FROM inventory_positions
            WHERE date = (
                SELECT MAX(date)
                FROM inventory_positions
            )
        """, engine)

        top_critical = pd.read_sql("""
    SELECT
        sk.sku_name,
        ip.days_of_cover,
        ip.closing_stock_units as current_stock,
        sk.unit_cost_inr
    FROM inventory_positions ip
    JOIN skus sk
        ON ip.sku_id = sk.sku_id
    WHERE ip.date = (
        SELECT MAX(date)
        FROM inventory_positions
    )
    ORDER BY ip.days_of_cover ASC
    LIMIT 3
""", engine)
        total_inventory_value = int(pd.read_sql("""
    SELECT SUM(ip.closing_stock_units * sk.unit_cost_inr) as total
    FROM inventory_positions ip
    JOIN skus sk ON ip.sku_id = sk.sku_id
    WHERE ip.date = (SELECT MAX(date) FROM inventory_positions)
""", engine).iloc[0]["total"] or 0)
        latency = round((time.time() - start) * 1000, 2)
        log_request("inventory_summary", latency, 1, "200")
        

        return {
            "report_date": str(date.today()),
            "total_skus_tracked":
                int(summary.iloc[0]['total_skus_tracked']),
            "critical_skus":
                int(summary.iloc[0]['critical_skus']),
            "warning_skus":
                int(summary.iloc[0]['warning_skus']),
            "healthy_skus":
                int(summary.iloc[0]['healthy_skus']),
            "total_inventory_value": total_inventory_value,
            "stockout_risk_value": 0,
            "avg_days_of_cover":
                float(summary.iloc[0]['avg_days_of_cover']),
            "top_3_critical": [
    {
        "sku_name": row["sku_name"],
        "days_of_cover": round(float(row["days_of_cover"]), 1),
        "current_stock": int(row["current_stock"] or 0)
    }
    for _, row in top_critical.iterrows()
]
        }

    except Exception as e:
        latency = round((time.time() - start) * 1000, 2)
        log_request("inventory_summary", latency, 0, f"ERROR: {str(e)}")
        return {"error": str(e)}
@app.get("/api/analytics/supplier-details")
def get_supplier_details(supplier_id: str):
    start = time.time()
    try:
        sup_df = pd.read_sql(
            "SELECT * FROM suppliers WHERE supplier_id = %(sid)s",
            engine, params={"sid": supplier_id}
        )
        if sup_df.empty:
            return {"detail": "Not Found"}
        s = sup_df.iloc[0].to_dict()

        perf_df = pd.read_sql(
            "SELECT * FROM supplier_performance WHERE supplier_id = %(sid)s ORDER BY month DESC LIMIT 6",
            engine, params={"sid": supplier_id}
        )

        if not perf_df.empty:
            latest = perf_df.iloc[0].to_dict()
            otif = float(latest.get("otif_percentage") or 0)
            fill = float(latest.get("fill_rate_pct") or 0)
            trend = [
                {
                    "month": str(row.get("month", "")),
                    "otif": float(row.get("otif_percentage") or 0)
                }
                for row in perf_df.to_dict(orient="records")
            ]
        else:
            otif = 0.0
            fill = 0.0
            trend = []
        skus_df = pd.read_sql(
            "SELECT DISTINCT sku_id FROM purchase_orders WHERE supplier_id = %(sid)s LIMIT 10",
            engine,
            params={"sid": supplier_id}
        )
        sku_list = skus_df["sku_id"].tolist() if not skus_df.empty else []
        latency = round((time.time() - start) * 1000, 2)
        log_request("supplier-details", latency,1,"200")
        return {
            "supplier_id": str(s.get("supplier_id", "")),
            "city": str(s.get("city", "")),
            "tier": str(s.get("city_tier", "")),
            "current_otif": otif,
            "avg_lead_time_days": float(s.get("avg_lead_time_days") or 0),
            "fill_rate_pct": fill,
            "trend": trend,
            "skus": sku_list,
            "supplied_skus": sku_list
        }
    except Exception as e:
        latency = round((time.time() - start) * 1000, 2)
        log_request("supplier-details",latency,0,f"ERROR: {str(e)}")
        return {"error": str(e)}

@app.get("/api/analytics/inventory-detail")
def inventory_detail(status: str = None, category: str = None):
    start = time.time()
    try:
        query = """
            SELECT
                ip.sku_id,
                sk.sku_name,
                sk.category,
                ip.closing_stock_units as current_stock,
                ip.days_of_cover,
                CASE
                    WHEN ip.days_of_cover < 14 THEN 'critical'
                    WHEN ip.days_of_cover >= 14
                    AND ip.days_of_cover < 30 THEN 'warning'
                    ELSE 'healthy'
                END as status
            FROM inventory_positions ip
            JOIN skus sk ON ip.sku_id = sk.sku_id
            WHERE ip.date = (
                SELECT MAX(date)
                FROM inventory_positions
            )
            ORDER BY ip.days_of_cover ASC
        """
        df = pd.read_sql(query, engine)

        if status:
            df = df[df['status'] == status.lower()]

        if category:
            df = df[df['category'].str.lower() == category.lower()]

        result = df.to_dict(orient='records')

        latency = round((time.time()-start)*1000, 2)
        log_request("inventory-detail", latency, len(result), "200")
        return result

    except Exception as e:
        latency = round((time.time()-start)*1000, 2)
        log_request("inventory-detail", latency, 0, f"ERROR:{str(e)}")
        return {"error": str(e)}
@app.get("/api/analytics/supplier-scorecard/{supplier_id}")
def supplier_scorecard(supplier_id: str):
    start = time.time()
    try:
        # Get supplier info
        sup_df = pd.read_sql("""
            SELECT s.supplier_id, s.supplier_name,
                   s.category, s.city, s.city_tier,
                   s.avg_lead_time_days
            FROM suppliers s
            WHERE s.supplier_id = %(sid)s
        """, engine, params={"sid": supplier_id})

        if sup_df.empty:
            return {"detail": "Supplier not found"}

        sup = sup_df.iloc[0].to_dict()
        category = sup.get("category", "")

        # Get this supplier performance
        perf_df = pd.read_sql("""
            SELECT AVG(otif_percentage) as avg_otif,
                   AVG(fill_rate_pct) as avg_fill_rate,
                   AVG(quality_reject_rate_pct) as avg_quality_reject,
                   AVG(avg_lead_time_days) as avg_lead_time
            FROM supplier_performance
            WHERE supplier_id = %(sid)s
        """, engine, params={"sid": supplier_id})

        if perf_df.empty:
            return {"detail": "No performance data found"}

        p = perf_df.iloc[0].to_dict()
        supplier_otif = float(p.get("avg_otif") or 0)
        supplier_fill = float(p.get("avg_fill_rate") or 0)
        supplier_quality = float(p.get("avg_quality_reject") or 0)
        supplier_lead = float(p.get("avg_lead_time") or 0)

        # Get all suppliers in same category for benchmarking
        peers_df = pd.read_sql("""
            SELECT sp.supplier_id,
                   AVG(sp.otif_percentage) as avg_otif,
                   AVG(sp.fill_rate_pct) as avg_fill_rate,
                   AVG(sp.quality_reject_rate_pct) as avg_quality,
                   AVG(sp.avg_lead_time_days) as avg_lead_time
            FROM supplier_performance sp
            JOIN suppliers s ON sp.supplier_id = s.supplier_id
            WHERE s.category = %(cat)s
            GROUP BY sp.supplier_id
        """, engine, params={"cat": category})

        # Calculate percentiles
        def percentile_rank(value, series):
            series = series.dropna()
            if len(series) == 0:
                return 50
            below = (series < value).sum()
            return round((below / len(series)) * 100, 1)

        otif_percentile = percentile_rank(
            supplier_otif, peers_df["avg_otif"])
        fill_percentile = percentile_rank(
            supplier_fill, peers_df["avg_fill_rate"])
        quality_percentile = percentile_rank(
            supplier_quality,
            peers_df["avg_quality"].max() - peers_df["avg_quality"])

        # Industry averages
        industry_avg_otif = round(
            float(peers_df["avg_otif"].mean()), 1)
        industry_avg_fill = round(
            float(peers_df["avg_fill_rate"].mean()), 1)
        best_otif = round(
            float(peers_df["avg_otif"].max()), 1)
        best_fill = round(
            float(peers_df["avg_fill_rate"].max()), 1)

        latency = round((time.time()-start)*1000, 2)
        log_request("supplier-scorecard", latency, 1, "200")

        return {
            "supplier_id": supplier_id,
            "supplier_name": sup.get("supplier_name", ""),
            "category": category,
            "city": sup.get("city", ""),
            "tier": sup.get("city_tier", ""),
            "kpis": {
                "otif_pct": round(supplier_otif, 1),
                "fill_rate_pct": round(supplier_fill, 1),
                "quality_reject_pct": round(supplier_quality, 1),
                "avg_lead_time_days": round(supplier_lead, 1)
            },
            "benchmarks": {
                "otif_percentile": otif_percentile,
                "fill_rate_percentile": fill_percentile,
                "quality_percentile": quality_percentile,
                "otif_vs_industry_avg": round(
                    supplier_otif - industry_avg_otif, 1),
                "fill_vs_industry_avg": round(
                    supplier_fill - industry_avg_fill, 1),
                "industry_avg_otif": industry_avg_otif,
                "industry_avg_fill": industry_avg_fill,
                "best_otif_in_category": best_otif,
                "best_fill_in_category": best_fill
            },
            "benchmark_summary": f"This supplier's OTIF is better than {otif_percentile}% of similar suppliers in {category} category",
            "peer_count": len(peers_df)
        }

    except Exception as e:
        latency = round((time.time()-start)*1000, 2)
        log_request("supplier-scorecard", latency, 0, f"ERROR:{str(e)}")
        return {"error": str(e)}
@app.get("/api/analytics/supplier-peers/{supplier_id}")
def supplier_peers(supplier_id: str):
    start = time.time()
    try:
        # Get supplier category
        sup_df = pd.read_sql("""
            SELECT supplier_id, supplier_name,
                   category, city_tier
            FROM suppliers
            WHERE supplier_id = %(sid)s
        """, engine, params={"sid": supplier_id})

        if sup_df.empty:
            return {"detail": "Supplier not found"}

        sup = sup_df.iloc[0].to_dict()
        category = sup.get("category", "")

        # Get all peers in same category
        peers_df = pd.read_sql("""
            SELECT
                s.supplier_id,
                s.supplier_name,
                s.city,
                AVG(sp.otif_percentage) as avg_otif,
                AVG(sp.fill_rate_pct) as avg_fill_rate,
                AVG(sp.quality_reject_rate_pct) as avg_quality
            FROM supplier_performance sp
            JOIN suppliers s ON sp.supplier_id = s.supplier_id
            WHERE s.category = %(cat)s
            GROUP BY s.supplier_id, s.supplier_name, s.city
            ORDER BY avg_otif DESC
        """, engine, params={"cat": category})

        if peers_df.empty:
            return {"detail": "No peers found"}

        # Top performer
        top = peers_df.iloc[0].to_dict()

        # Median performance
        median_otif = round(
            float(peers_df["avg_otif"].median()), 1)
        median_fill = round(
            float(peers_df["avg_fill_rate"].median()), 1)

        # This supplier rank
        supplier_row = peers_df[
            peers_df["supplier_id"] == supplier_id]
        rank = peers_df.index[
            peers_df["supplier_id"] == supplier_id
        ].tolist()
        supplier_rank = rank[0] + 1 if rank else "N/A"

        latency = round((time.time()-start)*1000, 2)
        log_request("supplier-peers", latency,
                   len(peers_df), "200")

        return {
            "supplier_id": supplier_id,
            "supplier_name": sup.get("supplier_name", ""),
            "peer_group": category,
            "total_peers": len(peers_df),
            "this_supplier_rank": supplier_rank,
            "top_performer": {
                "supplier_id": top.get("supplier_id"),
                "supplier_name": top.get("supplier_name"),
                "city": top.get("city"),
                "avg_otif": round(float(top.get("avg_otif") or 0), 1),
                "avg_fill_rate": round(float(top.get("avg_fill_rate") or 0), 1)
            },
            "median_performance": {
                "avg_otif": median_otif,
                "avg_fill_rate": median_fill
            },
            "peer_list": [
                {
                    "supplier_id": row["supplier_id"],
                    "supplier_name": row["supplier_name"],
                    "avg_otif": round(float(row["avg_otif"] or 0), 1),
                    "avg_fill_rate": round(float(row["avg_fill_rate"] or 0), 1),
                    "rank": i + 1
                }
                for i, (_, row) in enumerate(peers_df.iterrows())
            ]
        }

    except Exception as e:
        latency = round((time.time()-start)*1000, 2)
        log_request("supplier-peers", latency, 0, f"ERROR:{str(e)}")
        return {"error": str(e)}
@app.get("/api/supplier-actions/{supplier_id}")
def supplier_actions(supplier_id: str):
    start = time.time()
    try:
        # Get supplier info
        sup_df = pd.read_sql("""
            SELECT s.supplier_id, s.supplier_name,
                   s.category, s.avg_lead_time_days
            FROM suppliers s
            WHERE s.supplier_id = %(sid)s
        """, engine, params={"sid": supplier_id})

        if sup_df.empty:
            return {"detail": "Supplier not found"}

        sup = sup_df.iloc[0].to_dict()

        # Get latest performance
        perf_df = pd.read_sql("""
            SELECT
                AVG(otif_percentage) as avg_otif,
                AVG(fill_rate_pct) as avg_fill_rate,
                AVG(quality_reject_rate_pct) as avg_quality,
                AVG(avg_lead_time_days) as avg_lead_time,
                AVG(capacity_utilization_pct) as avg_capacity
            FROM supplier_performance
            WHERE supplier_id = %(sid)s
        """, engine, params={"sid": supplier_id})

        if perf_df.empty:
            return {"detail": "No performance data"}

        p = perf_df.iloc[0].to_dict()
        otif = float(p.get("avg_otif") or 0)
        fill = float(p.get("avg_fill_rate") or 0)
        quality = float(p.get("avg_quality") or 0)
        lead_time = float(p.get("avg_lead_time") or 0)
        capacity = float(p.get("avg_capacity") or 0)

        # Get peer average for cost comparison
        peers_df = pd.read_sql("""
            SELECT AVG(otif_percentage) as peer_avg_otif
            FROM supplier_performance sp
            JOIN suppliers s ON sp.supplier_id = s.supplier_id
            WHERE s.category = %(cat)s
        """, engine, params={"cat": sup.get("category", "")})

        peer_avg_otif = float(
            peers_df.iloc[0].get("peer_avg_otif") or 0)

        # Build recommended actions
        actions = []

        # Rule 1 — Low OTIF + High Lead Time
        if otif < 70 and lead_time > 30:
            actions.append({
                "action": "Schedule urgent meeting with supplier to discuss delivery performance",
                "reason": f"OTIF is {round(otif,1)}% (below 70%) and lead time is {round(lead_time,1)} days (above 30 days)",
                "urgency": "URGENT",
                "act_within": "3 days"
            })

        # Rule 2 — Low OTIF only
        elif otif < 70:
            actions.append({
                "action": "Issue formal performance improvement notice to supplier",
                "reason": f"OTIF is {round(otif,1)}% which is below acceptable threshold of 70%",
                "urgency": "HIGH",
                "act_within": "1 week"
            })

        # Rule 3 — OTIF below peers
        elif otif < peer_avg_otif - 10:
            actions.append({
                "action": "Schedule performance review meeting with supplier",
                "reason": f"OTIF {round(otif,1)}% is {round(peer_avg_otif-otif,1)}% below peer average of {round(peer_avg_otif,1)}%",
                "urgency": "MEDIUM",
                "act_within": "2 weeks"
            })

        # Rule 4 — Quality issues
        if quality > 5:
            actions.append({
                "action": "Initiate quality audit immediately",
                "reason": f"Quality reject rate is {round(quality,1)}% which exceeds 5% threshold",
                "urgency": "URGENT",
                "act_within": "3 days"
            })
        elif quality > 3:
            actions.append({
                "action": "Request quality improvement plan from supplier",
                "reason": f"Quality reject rate is {round(quality,1)}% — above 3% warning threshold",
                "urgency": "HIGH",
                "act_within": "1 week"
            })

        # Rule 5 — High lead time
        if lead_time > 30:
            actions.append({
                "action": "Renegotiate lead time terms in contract",
                "reason": f"Average lead time is {round(lead_time,1)} days — above 30 day target",
                "urgency": "HIGH",
                "act_within": "1 week"
            })

        # Rule 6 — Low fill rate
        if fill < 85:
            actions.append({
                "action": "Review order fulfillment process with supplier",
                "reason": f"Fill rate is {round(fill,1)}% — below 85% minimum threshold",
                "urgency": "HIGH",
                "act_within": "1 week"
            })

        # Rule 7 — High capacity utilization
        if capacity > 90:
            actions.append({
                "action": "Reduce order quantity and diversify sourcing",
                "reason": f"Capacity utilization at {round(capacity,1)}% — risk of delays due to overload",
                "urgency": "MEDIUM",
                "act_within": "2 weeks"
            })

        # Rule 8 — Cost renegotiation
        if otif > 90 and fill > 95 and quality < 2:
            actions.append({
                "action": "Renegotiate pricing for next contract — leverage strong performance",
                "reason": f"Top performer: OTIF {round(otif,1)}%, Fill {round(fill,1)}%, Quality {round(quality,1)}%",
                "urgency": "LOW",
                "act_within": "Monitor"
            })

        # If no issues found
        if not actions:
            actions.append({
                "action": "Continue monitoring — no immediate action required",
                "reason": f"All KPIs within acceptable range: OTIF {round(otif,1)}%, Fill {round(fill,1)}%, Quality {round(quality,1)}%",
                "urgency": "LOW",
                "act_within": "Monitor"
            })

        latency = round((time.time()-start)*1000, 2)
        log_request("supplier-actions", latency,
                   len(actions), "200")

        return {
            "supplier_id": supplier_id,
            "supplier_name": sup.get("supplier_name", ""),
            "category": sup.get("category", ""),
            "current_metrics": {
                "otif_pct": round(otif, 1),
                "fill_rate_pct": round(fill, 1),
                "quality_reject_pct": round(quality, 1),
                "avg_lead_time_days": round(lead_time, 1),
                "capacity_utilization_pct": round(capacity, 1)
            },
            "total_actions": len(actions),
            "recommended_actions": actions
        }

    except Exception as e:
        latency = round((time.time()-start)*1000, 2)
        log_request("supplier-actions", latency, 0,
                   f"ERROR:{str(e)}")
        return {"error": str(e)}
@app.get("/api/supplier-actions")
def all_supplier_actions():
    start = time.time()
    try:
        # Get all suppliers
        suppliers_df = pd.read_sql("""
            SELECT s.supplier_id, s.supplier_name,
                   s.category, s.avg_lead_time_days
            FROM suppliers s
        """, engine)

        # Get all performance data
        perf_df = pd.read_sql("""
            SELECT
                supplier_id,
                AVG(otif_percentage) as avg_otif,
                AVG(fill_rate_pct) as avg_fill_rate,
                AVG(quality_reject_rate_pct) as avg_quality,
                AVG(avg_lead_time_days) as avg_lead_time,
                AVG(capacity_utilization_pct) as avg_capacity
            FROM supplier_performance
            GROUP BY supplier_id
        """, engine)

        # Get peer averages by category
        peer_df = pd.read_sql("""
            SELECT s.category,
                   AVG(sp.otif_percentage) as peer_avg_otif
            FROM supplier_performance sp
            JOIN suppliers s ON sp.supplier_id = s.supplier_id
            GROUP BY s.category
        """, engine)

        peer_dict = dict(zip(
            peer_df["category"],
            peer_df["peer_avg_otif"]
        ))

        all_actions = []

        for _, sup in suppliers_df.iterrows():
            sid = sup["supplier_id"]
            category = sup.get("category", "")

            perf = perf_df[perf_df["supplier_id"] == sid]
            if perf.empty:
                continue

            p = perf.iloc[0].to_dict()
            otif = float(p.get("avg_otif") or 0)
            fill = float(p.get("avg_fill_rate") or 0)
            quality = float(p.get("avg_quality") or 0)
            lead_time = float(p.get("avg_lead_time") or 0)
            capacity = float(p.get("avg_capacity") or 0)
            peer_avg = float(peer_dict.get(category) or 0)

            actions = []

            if otif < 70 and lead_time > 30:
                actions.append({
                    "action": "Schedule urgent meeting to discuss delivery",
                    "reason": f"OTIF {round(otif,1)}% and lead time {round(lead_time,1)} days",
                    "urgency": "URGENT",
                    "act_within": "3 days"
                })
            elif otif < 70:
                actions.append({
                    "action": "Issue performance improvement notice",
                    "reason": f"OTIF {round(otif,1)}% below 70% threshold",
                    "urgency": "HIGH",
                    "act_within": "1 week"
                })
            elif otif < peer_avg - 10:
                actions.append({
                    "action": "Schedule performance review meeting",
                    "reason": f"OTIF {round(otif,1)}% is below peer average {round(peer_avg,1)}%",
                    "urgency": "MEDIUM",
                    "act_within": "2 weeks"
                })

            if quality > 5:
                actions.append({
                    "action": "Initiate quality audit immediately",
                    "reason": f"Quality reject rate {round(quality,1)}% exceeds 5%",
                    "urgency": "URGENT",
                    "act_within": "3 days"
                })
            elif quality > 3:
                actions.append({
                    "action": "Request quality improvement plan",
                    "reason": f"Quality reject rate {round(quality,1)}% above 3%",
                    "urgency": "HIGH",
                    "act_within": "1 week"
                })

            if lead_time > 30:
                actions.append({
                    "action": "Renegotiate lead time in contract",
                    "reason": f"Lead time {round(lead_time,1)} days above 30 day target",
                    "urgency": "HIGH",
                    "act_within": "1 week"
                })

            if fill < 85:
                actions.append({
                    "action": "Review order fulfillment process",
                    "reason": f"Fill rate {round(fill,1)}% below 85% minimum",
                    "urgency": "HIGH",
                    "act_within": "1 week"
                })

            if capacity > 90:
                actions.append({
                    "action": "Reduce order quantity and diversify sourcing",
                    "reason": f"Capacity utilization {round(capacity,1)}% — risk of delays",
                    "urgency": "MEDIUM",
                    "act_within": "2 weeks"
                })

            if not actions:
                actions.append({
                    "action": "Continue monitoring — no action required",
                    "reason": f"All KPIs within range: OTIF {round(otif,1)}%, Fill {round(fill,1)}%",
                    "urgency": "LOW",
                    "act_within": "Monitor"
                })

            all_actions.append({
                "supplier_id": sid,
                "supplier_name": sup.get("supplier_name", ""),
                "category": category,
                "total_actions": len(actions),
                "recommended_actions": actions
            })

        latency = round((time.time()-start)*1000, 2)
        log_request("supplier-actions-all", latency,
                   len(all_actions), "200")
        return all_actions

    except Exception as e:
        latency = round((time.time()-start)*1000, 2)
        log_request("supplier-actions-all", latency,
                   0, f"ERROR:{str(e)}")
        return {"error": str(e)}
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
