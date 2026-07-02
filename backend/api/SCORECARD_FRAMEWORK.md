# Supplier Scorecard Framework
SupplyMind — Week 8 Tuesday
Owner: Pavan
Date: July 1, 2026

---

## Scorecard Components (Updated Daily)

OTIF (On-Time-In-Full): 40% weight
→ % of shipments meeting deadlines
→ Most important for operations

Risk Score: 30% weight
→ Based on quality reject rate
→ Higher quality = higher score

Resilience: 20% weight
→ Backup supplier available = 100
→ No backup = 0
→ Binary for now, can be refined

Compliance: 10% weight
→ Payment terms honored
→ Certifications current
→ Currently baseline 80%

---

## Overall Score Calculation

Overall = (OTIF x 0.40) + (Risk x 0.30)
        + (Resilience x 0.20)
        + (Compliance x 0.10)

---

## Performance Tiers

Tier 1 (90-100): Excellent
→ Increase order volume

Tier 2 (70-89): Good
→ Maintain current relationship

Tier 3 (50-69): At Risk
→ Increase monitoring frequency

Tier 4 (0-49): Critical
→ Activate backup, prepare transition

---

## Action Thresholds

Drop below 70: Escalate to procurement lead
Drop below 50: Activate backup supplier
Improve above 85: Recognize supplier
               (discount incentive, increase volume)

---

## Endpoint

GET /api/analytics/supplier-scorecard-weighted/{supplier_id}

Purpose:
Returns the weighted supplier scorecard, overall score,
performance tier, and recommended action for a supplier.

---

## Testing Results

✅ Endpoint deployed successfully
✅ Swagger endpoint tested
✅ Weighted score calculated correctly
✅ Performance tiers assigned correctly
✅ Recommended actions returned successfully