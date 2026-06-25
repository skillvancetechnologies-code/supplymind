# Frontend Monitoring Plan — SupplyMind

## Daily Metrics to Monitor

* Page load time for all major views
* API call latency for each backend endpoint
* Failed API calls
* Console errors
* Empty-state occurrences
* Zero/null KPI values where live data is expected
* CORS errors after deployment

## Alert Thresholds

Immediate attention is required if:

* Any page load time exceeds 3 seconds
* Any API call fails
* Console error count is greater than 0
* Any KPI shows empty, zero, null, or undefined value where live data is expected
* Any CORS error appears in the browser console
* Any page renders mock data instead of live data

## Weekly Stability Check

Every Monday, perform a full click-through test covering:

* Dashboard
* Inventory
* Suppliers
* Supplier Detail
* Disruptions
* Forecasts
* Response Plan

For each page, verify:

* Page loads successfully
* Correct live API is called
* API response status is 200
* Data renders correctly
* No console errors
* No CORS errors
* No broken or empty fields

## Escalation Plan

If any frontend view is broken or any API fails:

1. Capture a screenshot of the issue
2. Capture DevTools Network tab showing failed request
3. Capture Console tab if errors are present
4. Post the issue in #blockers
5. Tag the relevant backend owner if the API response is failing
6. Escalate within 2 hours for broken views, failed APIs, or missing live data

## Monitoring Owner

Frontend: Prem Sannith

## Status

Monitoring plan documented for Week 5 integration stability.
