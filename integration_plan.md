# 🏟️ Champions Club — Final Bug-Fix & Integration Plan

> **Date:** 2026-10-04  
> **Status:** Ready for execution  
> **Developers:** Dev A · Dev B · Dev C  
> **Deadline:** TBD  

---

## 📋 Bug Classification (19 Items)

### 🟢 Guest Side (Public / Unauthenticated) — 7 Items

| # | Bug | Files Affected |
|---|-----|----------------|
| 5 | `/public` — Use "Outfit" font for "Champions Club" title | `PublicLandingPage.tsx`, `PublicWebsiteLayout.tsx`, `index.css` |
| 6 | `/public` — Remove notice bar at top and "Free Pass" button in navbar | `PublicWebsiteLayout.tsx`, `PublicLandingPage.tsx` |
| 7 | `/public/facilities` — Remove specification from card, remove filters in top right | `PublicFacilitiesPage.tsx` |
| 8 | `/public/shop` — Remove "Reserve at Club Desk" button | `PublicShopPage.tsx` |
| 9 | Remove `/public/slots` route entirely | `PublicSlotsPage.tsx`, `routes.tsx (adminPublic)`, `PublicWebsiteLayout.tsx` |
| 11 | `/public/trial` — Remove sports selection, preferred slot, exp level, state; connect to backend; use same date picker as signup | `PublicTrialPage.tsx`, `leads/public.routes.ts` (backend) |
| 4b | `/public/plans` — Check both plan name AND duration to show active plan | `PublicPlansPage.tsx` |

### 🔵 Member Side (Authenticated — member role) — 4 Items

| # | Bug | Files Affected |
|---|-----|----------------|
| 3 | Members cannot order food or equipment | `orders.routes.ts`, `orders.service.ts`, backend middleware, `NewOrderPage.tsx` |
| 4a | `/memberships` — Check both plan name AND duration to show active plan | `MembershipsPage.tsx`, `plans.service.ts` (backend) |
| 14 | `/members/:id` — Bookings not showing (fetch); remove square border from profile image | `MemberDetailPage.tsx`, `members.service.ts` (backend) |
| 15 | `/bookings/new` — Social Play only for Friday nights | `BookingWizard.tsx`, `SocialPlayForm.tsx`, `booking.service.ts` (backend) |

### 🔴 Admin Side (Authenticated — admin / staff roles) — 8 Items

| # | Bug | Files Affected |
|---|-----|----------------|
| 1 | `/bookings/calendar` — Only keep date picker (remove extra UI) | `BookingCalendarPage.tsx` |
| 2 | `/bookings/new` — UPI QR not showing; final payment price missing in UPI/Card/Cash | `BookingPaymentSection.tsx`, `BookingWizard.tsx` |
| 10 | `/leads` — Kanban board: add "assign lead to staff" feature on card | `LeadKanbanBoard.tsx`, `leads.service.ts`, `leads.controller.ts`, `leads.routes.ts` (backend) |
| 12 | Dashboard & `/reports` — Use same DB queries; connect bar analytics backend; remove court heatmap; add today/week/month earnings; sharable PDF | `DashboardPage.tsx`, `ReportsHubPage.tsx`, `reports.service.ts`, `reports.controller.ts` (backend) |
| 13 | Every list — Paginate every 10 rows; every search box — implement debouncing | All list pages, shared components/hooks |
| 16 | `/equipment` — Admin: remove Rent and Return buttons | `EquipmentPage.tsx`, `EquipmentDetailPage.tsx` |
| 17 | `/bar` — Member discount; fix user name in table card; add total earnings today | `TabDetailPage.tsx`, `OpenTabsPage.tsx`, `BarTablesPage.tsx`, `tabs.service.ts` (backend) |
| 18 | Remove `/invoices` entirely | `RenewalInvoicesPage.tsx`, `crm/routes.tsx`, `invoices/` (backend), `App.tsx` sidebar |
| 19 | `/settings` — Remove Club System & ERP options; keep admin full name & phone editable; fix save | `SettingsPage.tsx`, backend settings/auth endpoint |

---

## 👷 Developer Work Division (Zero Merge Conflicts)

### Ownership Principle

Each developer owns **distinct feature directories** — no two developers ever edit the same file.

| Scope | Dev A (Guest + Public) | Dev B (Member + Bookings) | Dev C (Admin + Commerce) |
|-------|----------------------|--------------------------|--------------------------|
| **Frontend dirs** | `features/public/*`, `features/adminPublic/routes.tsx` (public section only) | `features/bookings/*`, `features/members/*`, `features/memberships/*` | `features/leads/*`, `features/bar/*`, `features/equipment/*`, `features/reports/*`, `features/dashboard/*`, `features/invoices/*`, `features/settings/*`, `features/crm/routes.tsx` |
| **Backend dirs** | `modules/leads/public.routes.ts` | `modules/bookings/*`, `modules/members/*`, `modules/plans/*`, `modules/orders/*` | `modules/leads/*` (non-public), `modules/bar/*`, `modules/reports/*`, `modules/equipment/*`, `modules/invoices/*`, `modules/staff/*` |
| **Shared** | `index.css` (font import only) | `src/hooks/` (new shared hooks) | `App.tsx`, `routes.tsx` files (cleanup) |

---

## 📝 Detailed Task Breakdown

---

### DEV A — Guest / Public Portal (Bugs: 5, 6, 7, 8, 9, 11, 4b)

**Bug #5 — Outfit font for "Champions Club" title**
- **File:** `frontend/src/index.css`
  - Add Google Font import: `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800&display=swap');`
- **File:** `frontend/src/features/public/PublicLandingPage.tsx`
  - Apply `fontFamily: "'Outfit', sans-serif"` to the "Champions Club" title
- **File:** `frontend/src/features/public/PublicWebsiteLayout.tsx`
  - Apply same font to navbar brand "Champions Club" text

**Bug #6 — Remove notice bar & Free Pass button**
- **File:** `frontend/src/features/public/PublicWebsiteLayout.tsx`
  - Delete the top notice/announcement bar component/JSX
  - Remove "Free Pass" button from the navbar
- **File:** `frontend/src/features/public/PublicLandingPage.tsx`
  - Remove any "Free Pass" CTA if duplicated here

**Bug #7 — `/public/facilities` cleanup**
- **File:** `frontend/src/features/public/PublicFacilitiesPage.tsx`
  - Remove "Specification" section from facility cards
  - Remove filter controls in the top-right corner

**Bug #8 — `/public/shop` remove button**
- **File:** `frontend/src/features/public/PublicShopPage.tsx`
  - Remove "Reserve at Club Desk" button from shop items

**Bug #9 — Remove `/public/slots`**
- **File:** `frontend/src/features/public/PublicSlotsPage.tsx`
  - Delete this file entirely
- **File:** `frontend/src/features/adminPublic/routes.tsx`
  - Remove the `<Route path="slots" .../>` from both `publicJsxRoutes` and `adminPublicRoutes`
  - Remove the `import PublicSlotsPage` statement
- **File:** `frontend/src/features/public/PublicWebsiteLayout.tsx`
  - Remove "Slots" link from public navbar

**Bug #11 — `/public/trial` simplification + backend**
- **File:** `frontend/src/features/public/PublicTrialPage.tsx`
  - Remove fields: sports selection, preferred slot, experience level, state
  - Keep only: name, email, phone, date (using the same date picker component as signup page)
  - Connect form submission to `POST /api/leads/public/trial` backend endpoint
- **File (backend):** `backend/src/modules/leads/public.routes.ts`
  - Ensure the trial endpoint accepts simplified payload and creates a lead

**Bug #4b — `/public/plans` active plan logic**
- **File:** `frontend/src/features/public/PublicPlansPage.tsx`
  - When showing "Active" badge on plans, match by BOTH `planName` AND `duration` (not just name)

---

### DEV B — Member Side + Bookings (Bugs: 3, 4a, 14, 15, 1, 2, 13-hooks)

**Bug #1 — `/bookings/calendar` date picker only**
- **File:** `frontend/src/features/bookings/BookingCalendarPage.tsx`
  - Remove all extra calendar UI (weekly/monthly views, legend, etc.)
  - Keep ONLY the date picker control

**Bug #2 — `/bookings/new` payment display**
- **File:** `frontend/src/features/bookings/components/BookingPaymentSection.tsx`
  - Fix UPI QR code rendering — ensure the QR image/component is displayed when UPI is selected
  - Show the **final total price** for all payment methods: UPI, Card, and Cash
- **File:** `frontend/src/features/bookings/components/BookingWizard.tsx`
  - Ensure the calculated total is passed to the payment section correctly

**Bug #3 — Member ordering food/equipment**
- **File (backend):** `backend/src/modules/orders/orders.routes.ts`
  - Allow `member` role to access `POST /api/orders`
- **File (backend):** `backend/src/modules/orders/orders.service.ts`
  - When a member creates an order, auto-populate `memberId` from the authenticated user

**Bug #4a — `/memberships` active plan by name + duration**
- **File:** `frontend/src/features/memberships/MembershipsPage.tsx`
  - Fix active plan detection: compare BOTH `planName` AND `duration` to identify the currently active plan
- **File (backend):** `backend/src/modules/plans/` (if needed)
  - Ensure backend returns both fields for comparison

**Bug #14 — `/members/:id` bookings + profile image**
- **File:** `frontend/src/features/members/MemberDetailPage.tsx`
  - Fetch bookings for this member from `GET /api/bookings?memberId=:id` and display them
  - Remove square border from the profile image — use `border-radius: 50%` (circular)
- **File (backend):** `backend/src/modules/members/`
  - Ensure member detail endpoint includes or supports fetching related bookings

**Bug #15 — Social Play: Friday nights only**
- **File:** `frontend/src/features/bookings/components/BookingWizard.tsx`
  - Only show the "Social Play" option when the selected booking date is a **Friday**
  - If Social Play is toggled on and date changes to non-Friday, auto-disable it
- **File:** `frontend/src/features/bookings/components/SocialPlayForm.tsx`
  - Add evening-only time slot restriction for social play bookings
- **File (backend):** `backend/src/modules/bookings/booking.service.ts`
  - Add server-side validation: reject social play bookings on non-Friday dates

**Bug #13 (partial) — Create shared hooks**
- **File (new):** `frontend/src/hooks/usePagination.ts` — pagination hook (page size = 10)
- **File (new):** `frontend/src/hooks/useDebounce.ts` — debounce hook (300ms delay)
- Apply to: `BookingsPage.tsx`, `MembersPage.tsx`, `MembershipsPage.tsx`

---

### DEV C — Admin Side + Commerce + Cleanup (Bugs: 10, 12, 13-apply, 16, 17, 18, 19)

**Bug #10 — `/leads` Kanban: assign lead to staff**
- **File:** `frontend/src/features/leads/components/LeadKanbanBoard.tsx`
  - Add a staff dropdown/select on each Kanban card
  - On selection, call `PATCH /api/leads/:id` with `{ assignedTo: staffId }`
- **File (backend):** `backend/src/modules/leads/leads.service.ts`
  - Add `assignedTo` field support in update logic
- **File (backend):** `backend/src/modules/leads/leads.controller.ts`
  - Handle the `assignedTo` field in PATCH endpoint

**Bug #12 — Dashboard & Reports overhaul**
- **File:** `frontend/src/features/dashboard/DashboardPage.tsx`
  - Use the same backend queries as Reports for consistent data
  - Remove court heatmap section
  - Add earnings widgets: Today, This Week, This Month
- **File:** `frontend/src/features/reports/ReportsHubPage.tsx`
  - Connect bar analytics charts to real backend queries
  - Remove court heatmap
  - Add earnings: Today, This Week, This Month
  - Add "Download PDF" button using browser-side PDF generation (e.g., `jspdf` + `html2canvas`)
- **File (backend):** `backend/src/modules/reports/reports.service.ts`
  - Create unified query functions for both dashboard and reports
  - Add `/api/reports/earnings` endpoint with `period` param (today/week/month)
  - Add `/api/reports/bar-analytics` endpoint with real DB queries

**Bug #13 (partial) — Apply pagination + debouncing to admin lists**
- Import and use the shared hooks (created by Dev B in `src/hooks/`)
- Apply to: `LeadsListPage.tsx`, `EquipmentPage.tsx`, `OpenTabsPage.tsx`, `BarTablesPage.tsx`, `StaffListPage.tsx`, `PaymentsPage.tsx`

**Bug #16 — `/equipment` remove Rent/Return buttons (admin)**
- **File:** `frontend/src/features/equipment/EquipmentPage.tsx`
  - Remove "Rent" and "Return" action buttons from the equipment list
- **File:** `frontend/src/features/equipment/EquipmentDetailPage.tsx`
  - Remove "Rent" and "Return" action buttons from the equipment detail view

**Bug #17 — `/bar` member discount + name fix + today earnings**
- **File:** `frontend/src/features/bar/TabDetailPage.tsx`
  - Fix: display user/member name on the tab card (currently not showing)
  - Apply member discount logic when tab belongs to a member
- **File:** `frontend/src/features/bar/OpenTabsPage.tsx`
  - Fix user name display in the tabs list cards
- **File:** `frontend/src/features/bar/BarTablesPage.tsx`
  - Add "Total Earnings Today" widget at the top
- **File (backend):** `backend/src/modules/bar/tabs/`
  - Add member discount calculation in tab total
  - Add `GET /api/bar/earnings/today` endpoint

**Bug #18 — Remove `/invoices`**
- **File:** `frontend/src/features/crm/routes.tsx`
  - Remove the invoice route and import
- **File:** `frontend/src/features/invoices/RenewalInvoicesPage.tsx`
  - Delete or mark for deletion
- **Backend:** Remove `/api/invoices` routes from `api.router.ts` if registered
- **Sidebar/Navigation:** Remove "Invoices" link from the app shell sidebar

**Bug #19 — `/settings` cleanup**
- **File:** `frontend/src/features/settings/SettingsPage.tsx`
  - Remove "Club System" section
  - Remove "ERP" option/section
  - In the Administrator section:
    - Make "Full Name" field editable (remove `disabled`/`readOnly`)
    - Make "Contact Phone Number" field editable
  - Fix "Save Preferences" button to actually call `PATCH /api/auth/profile` or equivalent
- **Backend:** Ensure the profile update endpoint accepts `fullName` and `phone`

---

## 🔄 Execution Order (3-Phase)

### Phase 1 — Quick UI Removals & Fixes (Day 1)
*All 3 devs work in parallel — no file conflicts*

| Dev A | Dev B | Dev C |
|-------|-------|-------|
| #6 Remove notice bar + Free Pass | #1 Calendar date picker only | #16 Remove Rent/Return buttons |
| #7 Facilities card cleanup | #2 Payment display fix | #18 Remove invoices |
| #8 Shop button removal | #14 Profile image border fix | #19 Settings cleanup |
| #9 Remove /public/slots | | |

### Phase 2 — Logic Fixes & Backend Connections (Day 2)

| Dev A | Dev B | Dev C |
|-------|-------|-------|
| #5 Outfit font | #4a Memberships active plan | #10 Kanban assign to staff |
| #4b Plans active plan | #3 Member ordering | #17 Bar discount + name + earnings |
| #11 Trial page simplification | #15 Social Play Friday only | |

### Phase 3 — Complex Features & Polish (Day 3)

| Dev A | Dev B | Dev C |
|-------|-------|-------|
| Final testing of public pages | #13 Create shared hooks + apply to member/booking lists | #12 Dashboard + Reports overhaul |
| | #14 Fetch member bookings (backend) | #13 Apply pagination/debounce to admin lists |
| | | PDF export for reports |

---

## ⚠️ Coordination Points

1. **Shared Hooks (Bug #13):** Dev B creates `usePagination` and `useDebounce` hooks in `src/hooks/`. Dev C waits until these are pushed before applying them to admin list pages. Alternatively, Dev C can create separate utility functions in their own files if there's a time crunch.

2. **Sidebar Navigation (Bug #18):** Dev C removes the "Invoices" link. If the sidebar component is in `components/layout/`, coordinate with Dev B to avoid editing the same file. Fallback: Dev C owns sidebar changes exclusively.

3. **Backend API Router:** Dev C owns `backend/src/routes/api.router.ts` changes (removing invoice routes). Dev B's backend changes are in separate module files.

4. **Database Schema:** If `assignedTo` for leads (Bug #10) needs a Prisma migration, Dev C creates and runs it. No other dev touches `schema.prisma` during this sprint.

---

## ✅ Completion Checklist

| # | Bug | Owner | Status |
|---|-----|-------|--------|
| 1 | Calendar date picker only | Dev B | ⬜ |
| 2 | UPI QR + payment price | Dev B | ⬜ |
| 3 | Member ordering | Dev B | ⬜ |
| 4a | Membership active plan (name+duration) | Dev B | ⬜ |
| 4b | Public plans active plan (name+duration) | Dev A | ✅ |
| 5 | Outfit font | Dev A | ✅ |
| 6 | Remove notice bar + Free Pass | Dev A | ✅ |
| 7 | Facilities card cleanup | Dev A | ✅ |
| 8 | Shop button removal | Dev A | ✅ |
| 9 | Remove /public/slots | Dev A | ✅ |
| 10 | Kanban assign to staff | Dev C | ⬜ |
| 11 | Trial page simplification | Dev A | ✅ |
| 12 | Dashboard + Reports overhaul | Dev C | ⬜ |
| 13 | Pagination + debouncing | Dev B (hooks) + Dev C (apply) | ⬜ |
| 14 | Member bookings + profile image | Dev B | ⬜ |
| 15 | Social Play Friday only | Dev B | ⬜ |
| 16 | Remove Rent/Return buttons | Dev C | ⬜ |
| 17 | Bar discount + name + earnings | Dev C | ⬜ |
| 18 | Remove invoices | Dev C | ⬜ |
| 19 | Settings cleanup + save fix | Dev C | ⬜ |
