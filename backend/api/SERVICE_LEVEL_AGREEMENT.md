# Service Level Agreement (SLA)
SupplyMind Analytics APIs
Owner: Pavan
Date: June 17, 2026

---

## Response Time Guarantee

- p95 latency must be less than 2 seconds
  (95% of requests respond within 2 seconds)
- p99 latency must be less than 3 seconds
  (99% of requests respond within 3 seconds)
- Average latency target: less than 1 second
  when API is warm

---

## Availability Guarantee

- 99.5% uptime
  (system works 99.5% of the time)
- Planned maintenance: Sundays 2 AM IST
- Max unplanned downtime: 2 hours per month

---

## Rate Limiting

- 1000 requests per hour per user
- If exceeded: HTTP 429 Too Many Requests
- Max concurrent users: 50
- Request timeout: 30 seconds

---

## Support Response Times

- Critical issues (API down):
  Response within 1 hour
- Performance issues (slow responses):
  Response within 2 hours
- Non-critical issues:
  Response within 24 hours
- Post in #blockers channel for all issues

---

## How We Monitor SLA

- Every endpoint logs latency to
  analytics_api.log file
- Check p95 and p99 latency weekly
- Track uptime on Render dashboard
- Run load test monthly (50 users)
- Weekly SQL cross-check vs raw tables
- Alert if error rate goes above 0.1%

---

## Current Performance Baseline

Endpoint              | Avg Latency | SLA Status
supplier-details      | 2.8s        | OK when warm
supplier-risks        | 1.1s        | OK
inventory-summary     | 2.4s        | OK when warm
inventory-detail      | 2.0s        | OK
forecast-accuracy     | 2.6s        | OK when warm
disruption-risks      | 1.5s        | OK
supplier-scorecard    | 2.5s        | OK when warm
supplier-peers        | 2.5s        | OK when warm
supplier-actions      | 2.0s        | OK

Note: Free tier has cold start delay of
30-50 seconds after 15 minutes inactivity.
Warm up API before demo by opening docs
page 30 seconds before presenting.

---

## What Happens If SLA Is Breached

Response time breach (p99 above 3 seconds):
1. Check Render logs immediately
2. Check Supabase connection health
3. Post in #blockers within 2 hours
4. Fix and redeploy within 4 hours
5. Document what went wrong

Availability breach (downtime above 2 hours):
1. Check Render service status immediately
2. Manual redeploy if needed
3. Post in #blockers immediately
4. Fix within 30 minutes
5. Write post-mortem report

---

## Infrastructure Details

Hosting: Render Free Tier
Database: Supabase PostgreSQL
Region: US West Oregon
GitHub: skillvancetechnologies-code/supplymind
Live URL: https://supplymind-zmk0.onrender.com