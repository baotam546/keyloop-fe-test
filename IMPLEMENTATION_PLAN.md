# Front-End Implementation Plan
## Appointment Scheduling System — Client (Customer) Role

**Date:** 2026-05-05
**Source:** [appointment_scheduling_prd.md](appointment_scheduling_prd.md)
**Scope:** Front-end only, client/customer role only, mocked backend with static data

---

## 1. Goals

Implement a React SPA that satisfies the three core requirements from the PRD for the customer persona:

1. **Resource-Constrained Booking** — A customer can request a service appointment for a specific vehicle, service type, and dealership at a desired time.
2. **Real-Time Availability Check** — Before confirming, the system checks for the availability of both a `ServiceBay` and a qualified `Technician` for the entire service duration.
3. **Confirmed Appointment Record** — On success, a persistent `Appointment` record is created associating customer, vehicle, technician, and service bay.

## 2. Out of Scope

- Dealer Admin / Technician / Super Admin roles
- Real authentication (a single customer is hard-coded)
- Real backend, real databases, real notifications, payments
- Mobile/React Native app
- Third-party API and webhooks
- Analytics dashboards
- PRD requirements outside the three core ones above (notifications, search, reporting, etc.)

## 3. Tech Stack (existing)

- React 19 + Vite + TypeScript
- No additional runtime dependencies planned (no router, no state lib, no UI lib)
- All state held in React + a small in-memory store with `localStorage` persistence

## 4. Mock Backend Layer

Lives in [src/services/](src/services/) and [src/mocks/data.ts](src/mocks/data.ts). All functions return `Promise`s with simulated latency (150–400ms) so loading states are realistic. `Appointment` and `Hold` records persist to `localStorage` so confirmations survive a page reload.

### 4.1 Seed data ([src/mocks/data.ts](src/mocks/data.ts))

- **Dealerships**: 3 locations with name, address, timezone, opening hours.
- **Service Bays**: ~6 per dealership; mix of `lift`, `flat`, `paint` types; status `active`.
- **Technicians**: ~6 per dealership; certifications array; weekly shift schedule.
- **Service Types**: ~5 (Oil Change, Brake Service, Tire Rotation, Diagnostic, Paint Touch-Up) with `estimated_duration_min`, `required_bay_type`, `required_certifications`.
- **Customer**: 1 hard-coded logged-in customer.
- **Vehicles**: 2 vehicles owned by the customer.

### 4.2 API surface ([src/services/](src/services/))

| Module | Function | Purpose |
|---|---|---|
| `dealerships.ts` | `list()` | Return all dealerships |
| `vehicles.ts` | `listForCustomer(customerId)` | Customer's vehicles |
| `serviceTypes.ts` | `list()` | All service types |
| `availability.ts` | `check({ dealershipId, serviceTypeId, startsAt })` | Return available `(technician, bay)` pairs for the requested window |
| `holds.ts` | `create(slot)` / `release(holdId)` | 30-second TTL hold on a `(technician, bay, time)` triple |
| `appointments.ts` | `confirm(holdId, { customerId, vehicleId })` | Create `Appointment` record |
| `appointments.ts` | `listForCustomer(customerId)` / `cancel(id)` | View / cancel appointments |
| `store.ts` | — | In-memory store + `localStorage` persistence |
| `delay.ts` | `simulate()` | Latency simulator |

### 4.3 Availability algorithm

For the requested `[start, start + serviceType.estimated_duration_min)` window:

1. Filter bays in the dealership where `bay.bay_type === serviceType.required_bay_type` AND status is `active`.
2. Filter technicians in the dealership whose certifications cover `serviceType.required_certifications` AND whose shift covers the entire window.
3. Drop any technician or bay that overlaps an existing `confirmed` or `in-progress` `Appointment`.
4. Drop any technician or bay covered by an unexpired `Hold`.
5. Return surviving `(technician, bay)` pairs.

This enforces requirements #1 and #2 deterministically.

## 5. Domain Types ([src/types/domain.ts](src/types/domain.ts))

```ts
type BayType = 'lift' | 'flat' | 'paint';
type AppointmentStatus = 'requested' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';

interface Dealership { id; name; address; timezone; openingHours; }
interface ServiceBay { id; dealershipId; bayNumber; bayType: BayType; status; }
interface Technician { id; dealershipId; name; certifications: string[]; shiftSchedule; }
interface ServiceType { id; name; estimatedDurationMin; requiredBayType: BayType; requiredCertifications: string[]; }
interface Customer { id; name; email; phone; }
interface Vehicle { id; customerId; vin; make; model; year; }
interface Appointment { id; customerId; vehicleId; technicianId; serviceBayId; serviceTypeId; dealershipId; scheduledStart; scheduledEnd; status: AppointmentStatus; createdAt; }
interface Hold { id; technicianId; serviceBayId; startsAt; endsAt; expiresAt; }
```

## 6. UI Flow

A booking stepper inside a single page. No router; one top-level `view` state in `App.tsx` toggles between **Book** and **My Appointments**.

| Step | Component | Action |
|---|---|---|
| 1 | `DealershipPicker` | Pick a dealership |
| 2 | `VehiclePicker` | Pick one of the customer's vehicles |
| 3 | `ServiceTypePicker` | Pick a service type (shows duration + required bay type) |
| 4 | `DateTimePicker` | Pick a date and time-of-day slot |
| 5 | `SlotPicker` | List of available `(technician, bay)` pairs from `availability.check` |
| 6 | `BookingReview` + `HoldCountdown` | Summary + 30s hold TTL countdown; confirm → `appointments.confirm` |
| 7 | `ConfirmationCard` | Show appointment ID and all linked entities |

If the hold expires or is gone (req **F-06**), the UI re-queries availability and surfaces alternatives.

## 7. File Layout

```
src/
  main.tsx
  App.tsx
  index.css
  types/
    domain.ts
  mocks/
    data.ts
  services/
    store.ts
    delay.ts
    dealerships.ts
    vehicles.ts
    serviceTypes.ts
    availability.ts
    holds.ts
    appointments.ts
  hooks/
    useBookingFlow.ts
    useCountdown.ts
  components/
    Header.tsx
    Stepper.tsx
    DealershipPicker.tsx
    VehiclePicker.tsx
    ServiceTypePicker.tsx
    DateTimePicker.tsx
    SlotPicker.tsx
    BookingReview.tsx
    HoldCountdown.tsx
    ConfirmationCard.tsx
    AppointmentList.tsx
  pages/
    BookingPage.tsx
    AppointmentsPage.tsx
  utils/
    time.ts
```

## 8. PRD Requirements Coverage

| PRD ID | Requirement | Coverage |
|---|---|---|
| F-01 | Search dealership by location | `DealershipPicker` (list with city) |
| F-02 | Select vehicle, service type, preferred date/time | Steps 2–4 |
| F-03 | Real-time availability check before confirming | `availability.check` algorithm in §4.3 |
| F-04 | Short-lived hold (≤ 30 s TTL) | `holds.create` + `HoldCountdown` |
| F-05 | Booking confirmed only when both tech and bay are available for the full duration | Algorithm filters on full-window overlap |
| F-06 | If a held slot is taken, show alternatives | On expiry/loss, re-query availability |
| F-07 | Cancel a confirmed appointment | `appointments.cancel` + `AppointmentList` |
| F-16 | Confirmation immediately after booking | `ConfirmationCard` (UI only — no real notifications) |
| Core 1 | Resource-constrained booking | Full booking stepper |
| Core 2 | Real-time availability check | §4.3 algorithm |
| Core 3 | Confirmed appointment record | `appointments.confirm` writes to store + `localStorage` |

## 9. Phasing

### Phase A — Backbone
- Domain types
- Seed data
- Mock services with simulated latency
- App shell + view toggle

### Phase B — Booking Flow
- Stepper + all pickers
- Availability check wiring
- Hold lifecycle + countdown

### Phase C — Confirmation & Appointments View
- Confirm + persist
- My Appointments list + cancel

### Phase D — Polish
- Error states (hold expired, no slots, etc.)
- Empty / loading states
- Responsive layout
- Manual smoke test in the browser

## 10. Tradeoffs

- **No router**: zero added deps; trade is no shareable URLs per step.
- **localStorage persistence**: enough to demo a "persistent record"; swapping for a real API is a single-module change in [src/services/](src/services/).
- **Plain CSS** (using existing [src/index.css](src/index.css)): no Tailwind / UI lib; trade is more hand-styling.
- **Single hard-coded customer**: skips an auth flow that is out of scope for the three core requirements.