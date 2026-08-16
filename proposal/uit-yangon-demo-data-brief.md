# UIT Yangon Demo Data Brief

## Purpose

This brief defines the curated demo dataset for the Set Thwal UIT-first student welfare pilot. It is designed for an admin/judging presentation where the same numbers can be shown in the app dashboard, screenshots, proposal tables, and slide narration.

All people, phone numbers, provider accounts, and request records are fictional. The dataset is presentation-safe and should be described as a realistic UIT Yangon pilot scenario, not as collected production data.

## Demo Dataset Snapshot

| Area | Presentation Number | What It Means |
| --- | ---: | --- |
| Verified student profiles | 12 | Fictional UIT students across year levels and Yangon townships |
| Approved providers | 21 | Active tutor, hostel, restaurant, and transportation providers |
| Providers awaiting approval | 4 | One pending provider review in each welfare category |
| Approved service records | 31 | 6 tutors, 5 hostels, 8 food packages, and 12 transportation routes |
| Student welfare requests | 24 | Six requests in each of the four support categories |
| Active requests | 13 | Pending or confirmed requests requiring provider/school follow-up |
| Completed support cases | 7 | Requests completed through the supervised workflow |
| Cancelled requests | 4 | Requests closed because of schedule, capacity, budget, or route-fit issues |

## Admin Dashboard Metrics

| Category | Total Requests | Active Requests | Approved Providers | Pending Approval | Demand Share |
| --- | ---: | ---: | ---: | ---: | ---: |
| Tutors | 6 | 4 | 6 | 1 | 25% |
| Hostels | 6 | 3 | 5 | 1 | 25% |
| Food packages | 6 | 3 | 4 | 1 | 25% |
| Transportation | 6 | 3 | 6 | 1 | 25% |
| Total | 24 | 13 | 21 | 4 | 100% |

These values are intentionally balanced so judges can immediately understand how the reporting layer works. The story is not that every real category has equal demand; the story is that Set Thwal can separate demand, active workload, approved supply, and pending approval by category.

## Category Stories

Tutors: Six approved UIT-focused tutors cover programming, data structures, databases, web development, statistics, and networks. The strongest slide point is that academic support is visible to the school instead of being handled only through informal peer chats.

Hostels: Five approved hostel listings cover Hlaing, Hledan, Kamayut, Mayangone, and North Okkalapa. The strongest slide point is that accommodation support can be reviewed for location, room type, meals, and availability.

Food packages: Four approved food providers offer eight monthly meal plans. The strongest slide point is that student food support becomes a monthly welfare option with capacity and provider accountability.

Transportation: Six approved drivers operate twelve UIT commute routes. The strongest slide point is that route demand, pickup stops, seat availability, and unresolved transport needs become visible to administrators.

## Request Lifecycle Mix

| Status | Count | Presentation Meaning |
| --- | ---: | --- |
| Pending | 6 | New requests waiting for provider response |
| Confirmed | 7 | Requests accepted but not fully completed |
| Completed | 7 | Support cases with both sides resolved |
| Cancelled | 4 | Requests closed with a clear reason |

Use this lifecycle mix to show that the system is not just a directory. It creates a school-visible record from student request through provider response and completion.

## 24-Slide Presentation Outline

1. Title: Set Thwal UIT-First E-Government Student Welfare Pilot
2. The current gap: fragmented student support
3. Why UIT needs a supervised channel
4. The governance pivot: from marketplace to school-administered welfare
5. Verified student access
6. Approved provider participation
7. The request lifecycle
8. Admin reporting dashboard
9. Dataset snapshot: 12 students, 21 approved providers, 31 services, 24 requests
10. Tutor support deep dive
11. Hostel support deep dive
12. Food package support deep dive
13. Transportation support deep dive
14. Category demand comparison
15. Active requests and follow-up workload
16. Provider approval queue
17. Completed support cases
18. Cancelled and unresolved requests
19. Audit trail and accountability
20. Demo walkthrough: student request
21. Demo walkthrough: provider response
22. Demo walkthrough: admin review
23. Pilot success measures
24. Replication path for other universities

## Slide-Ready Claims

- Set Thwal gives UIT a single operating view for four welfare categories: tutors, hostels, food packages, and transportation.
- The demo pilot includes 12 verified student profiles and 21 approved providers.
- The admin view separates approved supply from pending provider approvals.
- The request dashboard shows 24 student welfare requests across the four categories.
- Thirteen requests are active, showing the current follow-up workload for providers and school administrators.
- Seven requests are completed, showing how the system records welfare outcomes instead of losing them in informal chats.
- Four cancelled requests show why rejection reasons matter: schedule mismatch, hostel capacity, food budget, and route-fit issues.

## Demo Account Note

Every seeded account uses the password `SatThwalDemo123!`. Recommended presenter accounts:

| Role | Email |
| --- | --- |
| Admin | `admin@sat-thwal.local` |
| Student | `student01@sat-thwal.local` |
| Tutor provider | `tutor01@sat-thwal.local` |
| Hostel provider | `hostel01@sat-thwal.local` |
| Restaurant provider | `restaurant01@sat-thwal.local` |
| Transportation provider | `driver01@sat-thwal.local` |

## Source of Truth

The dataset lives in `supabase/migrations/0036_uit_yangon_demo_dataset.sql`. If presentation numbers change, update the migration first, then revise this brief so the deck and live demo stay aligned.
