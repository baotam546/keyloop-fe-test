# Appointment Scheduler

A service appointment scheduling application built with React, TypeScript, and Vite. It supports two flows: a **customer booking flow** for scheduling vehicle service appointments, and a **technician dashboard** for viewing and managing those appointments.

---

## Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later

---

## Getting Started

### Install dependencies

```bash
npm install
```

### Run in development mode

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for production

```bash
npm run build
```

The compiled output is written to `dist/`. To preview the production build locally:

```bash
npm run preview
```

### Run tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Lint

```bash
npm run lint
```

### Type-check

```bash
node_modules/.bin/tsc --noEmit
```

---

## Application Overview

### Routes

| Path | Description |
|---|---|
| `/` | Customer booking flow (multi-step wizard) |
| `/appointments` | Customer's appointment list with cancel option |
| `/technician` | Technician dashboard — view, filter, and update appointment status |

### Customer Booking Flow

1. Enter guest customer info
2. Select a dealership
3. Select a vehicle (existing or enter a new one)
4. Select a service type
5. Pick a date and available time slot (slot is held for 10 minutes)
6. Review and confirm — appointment is created from the held slot

### Technician Dashboard

- **Today's Jobs** tab — active appointments scheduled for today
- **Upcoming** tab — future appointments not yet completed
- **History** tab — completed and cancelled appointments
- **Search** — filter by service type, vehicle make/model/year, VIN, or appointment ID
- **Status actions** — inline buttons to progress appointment state:
  - `requested` → Confirm or Cancel
  - `confirmed` → Start Job or Cancel
  - `in-progress` → Complete

### Status Color Key

| Status | Color |
|---|---|
| `requested` | Yellow |
| `confirmed` | Blue |
| `in-progress` | Yellow |
| `completed` | Green |
| `cancelled` | Red |

### Data Persistence

All appointment data is stored in `localStorage` under the key `appt-scheduler`. There is no backend; availability, holds, and lookups are all computed in-memory from mock data in `src/mocks/data.ts`.

---

## Testing

Tests are written with [Vitest](https://vitest.dev/) and cover the three layers of core business logic.

### Test files

| File | What it covers |
|---|---|
| `src/utils/time.test.ts` | Pure time utilities: `windowsOverlap`, `isOnShift`, `isDealershipOpen`, `getTimeSlots`, `addMinutes` |
| `src/services/store.test.ts` | In-memory store operations: appointment CRUD, hold lifecycle, expired-hold cleanup |
| `src/services/availability.test.ts` | Slot availability engine: bay/tech eligibility, certification checks, shift validation, conflict detection from appointments and holds, expiry rules |
| `src/services/appointments.test.ts` | Appointment lifecycle: `confirm` (happy path + hold-expired paths), `cancel`, `setStatus`, `enrichAppointment` |

### Key testing decisions

- **`store.test.ts`** uses `vi.resetModules()` + dynamic `import()` in `beforeEach` so each test gets a fresh singleton with no leftover state.
- **`availability.test.ts`** and **`appointments.test.ts`** mock `./store` with `vi.mock` and control the returned data directly — no module resets needed.
- **`simulateDelay`** is mocked to `() => Promise.resolve()` in all service tests to keep the suite fast.
- Test times are built with `toISO('2025-05-05', '10:00')` (local-time constructor) rather than hardcoded UTC strings, so `isOnShift`'s `getHours()` check is timezone-independent.

## Project Structure

```
src/
  components/       # Shared UI components (pickers, cards, stepper, etc.)
  components/ui/    # shadcn base components (Button, Badge, Card, Input, …)
  hooks/            # useBookingFlow, useCountdown
  mocks/            # Static seed data (dealerships, technicians, bays, services)
  pages/            # BookingPage, AppointmentsPage, TechnicianDashboardPage
  services/         # Business logic — appointments, availability, holds, store
  types/            # domain.ts — all shared TypeScript interfaces
  utils/            # time.ts helpers
```

---

## AI Collaboration Narrative

### Strategy for Guiding the AI

The approach was to work top-down: start with a full read of the existing codebase before writing a single line, then issue targeted instructions rather than open-ended ones.

Before each implementation step I pointed the AI at the exact files that needed to change — `src/services/appointments.ts`, `src/App.tsx`, `src/components/Header.tsx` — rather than asking it to "add a technician feature" and letting it guess the surface area. Each prompt included the constraint context: what the data model looked like, what the store already supported, and what the implementation plan specified. This kept the output narrow and coherent with the existing patterns.

For the status badge colors the instruction was intentionally minimal — "success is green, in progress yellow" — because the Badge component already had the right variants; the AI only needed to fix the mapping, not invent new infrastructure.

### Verifying and Refining Output

Every generated file was cross-checked against three things:

1. **Type correctness** — `tsc --noEmit` after each change. The only error reported was a pre-existing `baseUrl` deprecation warning, confirming no new type issues were introduced.
2. **Build integrity** — `npm run build` passed cleanly (323 kB JS bundle, 184 ms), verifying tree-shaking and import resolution were sound.
3. **Logic review** — the filtering logic in `TechnicianDashboardPage` was read manually to confirm the tab predicates (`today`, `upcoming`, `completed`) correctly handled edge cases like cancelled appointments appearing only in History, not Today or Upcoming.

Where the AI made a reasonable but imperfect choice — using `customerId` as a display label for customer name in the technician card (since the mock data doesn't have a direct customer lookup from appointment) — it was left as-is rather than over-engineered, consistent with the project's mock-data constraints.

### Ensuring Final Quality

- **No new abstractions were introduced** beyond what the task required. The `setStatus` service function is four lines; the dashboard reuses the existing `enrichAppointment` helper and `listAll` service without duplicating them.
- **The AI was not allowed to modify test-adjacent infrastructure** (the store, mock data, or type definitions) except to add one exported function. All changes were additive.
- **Color semantics were verified against the existing Badge component** before accepting the change — the variants `success`, `warning`, `blue`, and `destructive` were already defined in `badge.tsx`, so no custom CSS was needed.
- **Commit hygiene**: changes were grouped logically — service layer first, page component second, routing and navigation last — so the diff tells a coherent story.
