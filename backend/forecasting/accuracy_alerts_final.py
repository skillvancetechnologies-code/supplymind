"""
SupplyMind — Forecast Performance Monitoring (Final)
accuracy_alerts_final.py | Week 6 Day 3
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import List

from fastapi import APIRouter
from accuracy_monitor import load_history, get_deterioration_alerts

router = APIRouter()

EMAIL_ENABLED = False
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "your_alert_account@gmail.com"
SMTP_PASS = "app_password_here"
DISTRIBUTION_LIST = [
    "rahul@skillvancetechnologies.com",
    "pavan@skillvancetechnologies.com",
    "ml-lead@skillvancetechnologies.com",
]

POOR_MAPE_THRESHOLD = 15.0
DETERIORATION_THRESHOLD = 2.0


def get_poor_mape_alerts() -> List[dict]:
    history = load_history()
    alerts = []
    for sku_id, d in history.items():
        weeks = d.get("weeks", [])
        if not weeks:
            continue
        latest = weeks[-1]
        if latest["mape"] > POOR_MAPE_THRESHOLD:
            alerts.append({
                "sku_id": sku_id,
                "mape": latest["mape"],
                "ci_coverage": latest["ci_coverage"],
                "classification": latest["classification"],
                "week": latest["week"],
                "alert_type": "poor_mape",
                "message": f"{sku_id} MAPE is {latest['mape']}% — exceeds 15% Poor threshold",
            })
    alerts.sort(key=lambda a: -a["mape"])
    return alerts


def get_deterioration_alerts_tagged() -> List[dict]:
    raw = get_deterioration_alerts(threshold=DETERIORATION_THRESHOLD)
    for a in raw:
        a["alert_type"] = "deterioration"
        a["message"] = (
            f"{a['sku_id']} MAPE rose {a['delta']} pts "
            f"({a['prev_mape']}% → {a['curr_mape']}%) week-over-week"
        )
    return raw


def get_all_alerts() -> dict:
    poor = get_poor_mape_alerts()
    deteriorating = get_deterioration_alerts_tagged()
    affected_skus = {a["sku_id"] for a in poor} | {a["sku_id"] for a in deteriorating}

    return {
        "total_alerts": len(poor) + len(deteriorating),
        "affected_skus": len(affected_skus),
        "poor_mape_alerts": poor,
        "deterioration_alerts": deteriorating,
        "generated_at": datetime.utcnow().isoformat(),
    }


def format_alert_email(alert_summary: dict) -> str:
    lines = []
    lines.append(f"SupplyMind Forecast Alert — {alert_summary['generated_at']}")
    lines.append(f"Total alerts: {alert_summary['total_alerts']}  |  Affected SKUs: {alert_summary['affected_skus']}")
    lines.append("")

    if alert_summary["poor_mape_alerts"]:
        lines.append(f"POOR ACCURACY (MAPE > {POOR_MAPE_THRESHOLD}%):")
        for a in alert_summary["poor_mape_alerts"]:
            lines.append(f"  - {a['message']}")
        lines.append("")

    if alert_summary["deterioration_alerts"]:
        lines.append(f"DETERIORATING (MAPE +{DETERIORATION_THRESHOLD}% WoW):")
        for a in alert_summary["deterioration_alerts"]:
            lines.append(f"  - {a['message']}")
        lines.append("")

    if not alert_summary["poor_mape_alerts"] and not alert_summary["deterioration_alerts"]:
        lines.append("No alerts this period. All SKUs within acceptable range.")

    return "\n".join(lines)


def send_alert_email(alert_summary: dict) -> dict:
    body = format_alert_email(alert_summary)

    if not EMAIL_ENABLED:
        return {
            "sent": False,
            "reason": "EMAIL_ENABLED is False — set SMTP credentials and flip the flag to enable",
            "preview": body,
        }

    try:
        msg = MIMEMultipart()
        msg["From"] = SMTP_USER
        msg["To"] = ", ".join(DISTRIBUTION_LIST)
        msg["Subject"] = f"[SupplyMind] Forecast Alert — {alert_summary['total_alerts']} alert(s)"
        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_USER, DISTRIBUTION_LIST, msg.as_string())

        return {"sent": True, "recipients": DISTRIBUTION_LIST}
    except Exception as e:
        return {"sent": False, "reason": str(e), "preview": body}


@router.get("/api/accuracy/alerts/final")
def all_alerts():
    return get_all_alerts()


@router.post("/api/accuracy/alerts/notify")
def notify_distribution_list():
    summary = get_all_alerts()
    email_result = send_alert_email(summary)
    return {"alert_summary": summary, "email_result": email_result}