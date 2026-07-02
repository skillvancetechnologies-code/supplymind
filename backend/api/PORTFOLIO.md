# Internship Portfolio — Pavan
Role: Analytics Engineer — SupplyMind
Company: Skillvance Technologies
Duration: May 2026 – July 2026

---

## Role Overview

I was responsible for building and
maintaining the Analytics API layer
for SupplyMind — an AI-driven supply
chain intelligence platform. My work
powered all dashboard analytics for
200+ suppliers across the system.

---

## Key Achievements

1. Built 17+ REST API endpoints serving
   real supply chain data to the frontend

2. Governed 200+ suppliers with automated
   RED/YELLOW/GREEN health classification

3. Achieved 100% resilience — 0 critical
   SKUs without backup supplier

4. Built supplier segmentation engine
   grouping 200 suppliers into 4 tiers:
   High-Performing, Medium-Performing,
   Low-Performing and Strategic

5. Built action recommendations engine
   with URGENT/HIGH/MEDIUM/LOW urgency
   classification per supplier

6. Built resilience scoring (1-10) and
   3 scenario analysis for supply chain
   disruption planning

7. Built governance framework with
   automated escalation triggers and
   audit trail logging

8. Deployed entire API to production on
   Render with Supabase cloud PostgreSQL

---

## Technical Challenges

Challenge 1 — Supplier Relationship Mapping
The biggest technical challenge was
mapping supplier interdependencies.
Each SKU can have a primary and backup
supplier, creating a complex network.
I solved this by using SQL JOINs across
the skus and suppliers tables to build
a network graph with nodes and links
that the frontend could render directly.

Challenge 2 — Escalation Workflow Design
Designing the escalation framework
required balancing automation with
human oversight. I used in-memory
tracking with timestamp-based deadlines,
which works for the current scale but
would need a persistent database for
production-grade deployment.

Challenge 3 — Cold Start Latency
Render's free tier sleeps after 15
minutes of inactivity. The first request
after sleep takes 30-50 seconds. I
solved this by adding connection pooling
to SQLAlchemy and documenting the warm-up
procedure for demos.

---

## Results and Metrics

200 suppliers governed continuously
17 API endpoints live in production
0 critical SKUs without backup supplier
0% error rate under 50 concurrent users
100% resilience score achieved
Week-over-week OTIF drift detection live
Load tested at 50 and 100 concurrent users

---

## Technical Skills Demonstrated

Backend Development:
Python, FastAPI, SQLAlchemy, Pandas, NumPy

Database:
PostgreSQL, Supabase, complex SQL JOINs

Cloud Deployment:
Render, GitHub, environment variables

API Design:
REST endpoints, error handling, logging,
rate limiting, CORS, SLA documentation

Analytics:
Supplier segmentation, risk scoring,
drift detection, percentile ranking,
resilience planning, governance framework

---

## Learnings

Supply Chain Complexity:
I underestimated how interconnected
supply chain data is. A single SKU
touches suppliers, purchase orders,
inventory positions and demand history.
Understanding these relationships took
time but made my APIs much more accurate.

Data-Driven Governance:
Automating RED/YELLOW/GREEN classification
taught me that governance frameworks need
clear, measurable thresholds. Vague rules
cannot be automated. I learned to define
exact numeric boundaries for every rule.

Stakeholder Communication:
Working with Prem (frontend) taught me
to document API response formats before
building endpoints. Several times the
frontend needed different field names
than what I had built, requiring
rework that could have been avoided.

Team Collaboration:
Covering Dhanush's validation tasks
when he was unavailable taught me
the importance of understanding the
full system, not just my own module.

---

## What I Would Do Differently

1. Document API contracts with the
   frontend team before building —
   not after. Field names and response
   formats should be agreed upfront.

2. Use a persistent database for
   escalation tracking instead of
   in-memory storage. In-memory resets
   every time Render restarts the service.

3. Add caching for heavy endpoints
   like supplier-risks which loops
   through 200 suppliers. Redis cache
   with 5-minute TTL would reduce
   response time significantly.

4. Write unit tests for each endpoint
   before deployment. Manual Swagger
   testing caught bugs but automated
   tests would have been faster.

5. Set up proper monitoring from Day 1
   instead of adding it in Week 5.
   Earlier monitoring would have caught
   the cold-start latency issue sooner.

---

## Summary

This internship gave me hands-on
experience building a production-grade
analytics API from scratch. I learned
FastAPI, PostgreSQL, cloud deployment,
governance framework design and
supply chain analytics — all within
a real team environment with real
deadlines and real frontend consumers
depending on my work.

The most valuable skill I gained was
systematic problem-solving — breaking
complex requirements into small steps
and delivering incrementally rather
than trying to build everything at once.