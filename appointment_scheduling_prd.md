# Product Requirements Document
## Appointment Scheduling System

**Domain:** Dealership Service Operations  
**Version:** 1.0  
**Date:** May 2026  
**Status:** Draft

---

## 1. Overview

### 1.1 Problem Statement

Dealership service departments currently manage appointments through phone calls, paper calendars, and fragmented spreadsheets. This results in:

- **Double-bookings** due to lack of real-time resource visibility
- **Idle service bays** and underutilized technicians from poor scheduling
- **Poor customer experience** caused by manual, error-prone processes
- **No self-service option** for customers to book outside business hours

### 1.2 Product Vision

Build a centralized, real-time Appointment Scheduling System that enforces resource constraints at booking time — ensuring that every confirmed appointment is backed by an available, qualified technician and a compatible service bay for the full duration of the service.

### 1.3 Goals

| Goal | Success Metric |
|------|---------------|
| Eliminate double-bookings | 0 double-booking incidents per month in production |
| Reduce idle bay time | ≥ 20% improvement in bay utilization within 6 months |
| Enable customer self-service | ≥ 60% of appointments booked via web/mobile (not phone) |
| Improve booking speed | End-to-end booking completion in under 2 minutes |
| Reliable confirmation | Confirmation latency p99 ≤ 2 seconds |

### 1.4 Non-Goals

- Vehicle diagnostics or service execution tracking
- Payment processing at time of booking
- Inventory management for parts and supplies
- Internal HR or payroll management for technicians

---

## 2. Users & Personas

### 2.1 Customer
A vehicle owner who wants to schedule a service appointment at a dealership. Expects a fast, self-service booking experience with clear confirmation and reminders.

**Key needs:**
- Browse available time slots without calling
- Receive instant booking confirmation
- Get reminders before the appointment
- Easily reschedule or cancel

### 2.2 Dealer Admin / Service Staff
Dealership employees responsible for managing day-to-day service operations.

**Key needs:**
- View and manage daily/weekly schedules
- Manage bay availability and technician shifts
- Override or manually reschedule appointments
- Access analytics on utilization and booking trends

### 2.3 Technician
A certified service professional assigned to specific appointment types.

**Key needs:**
- View personal schedule and upcoming appointments
- Be notified of new assignments or changes
- Access vehicle and service details before arrival

### 2.4 Third-Party Systems (OEMs, Fleet Managers, CRMs)
External platforms that need programmatic access to create or query appointments.

**Key needs:**
- REST API access with webhook callbacks
- Idempotent booking endpoints to prevent duplicates
- Structured appointment status updates

---

## 3. Functional Requirements

### 3.1 Booking & Scheduling

| ID | Requirement | Priority |
|----|-------------|----------|
| F-01 | Customers can search for a dealership by location | P0 |
| F-02 | Customers can select a vehicle, service type, and preferred date/time | P0 |
| F-03 | The system checks real-time availability of technicians and service bays before confirming | P0 |
| F-04 | The system places a short-lived hold (≤ 30 seconds TTL) on selected resources during checkout | P0 |
| F-05 | Booking is confirmed only when both a qualified technician and compatible bay are available for the full service duration | P0 |
| F-06 | If a held slot is taken by another user, the customer is immediately shown alternative available slots | P0 |
| F-07 | Customers can cancel or reschedule a confirmed appointment | P1 |
| F-08 | Dealer Admins can manually override, reschedule, or cancel appointments | P1 |
| F-09 | Third-party systems can create and query appointments via REST API | P1 |
| F-10 | API requests include idempotency keys to prevent duplicate bookings from retries | P1 |

### 3.2 Resource Management

| ID | Requirement | Priority |
|----|-------------|----------|
| F-11 | Admins can define and manage dealership locations, operating hours, and time zones | P0 |
| F-12 | Admins can manage service bays, including bay type (lift, flat, paint), equipment, and status | P0 |
| F-13 | Admins can manage technician profiles including certifications and shift schedules | P0 |
| F-14 | Admins can define the service catalog, including estimated duration, required bay type, and required technician certifications | P0 |
| F-15 | Resource changes (e.g., bay goes offline) automatically propagate to the availability engine | P1 |

### 3.3 Notifications

| ID | Requirement | Priority |
|----|-------------|----------|
| F-16 | Customers receive a booking confirmation via email and/or SMS immediately after booking | P0 |
| F-17 | Customers receive a reminder notification before their appointment | P1 |
| F-18 | Customers and technicians are notified when an appointment is rescheduled or cancelled | P1 |
| F-19 | Customers can set notification channel preferences (email, SMS, push) | P2 |

### 3.4 Appointment Lifecycle

The system manages each appointment through the following state machine:

```
Requested → Confirmed → In-Progress → Completed
                ↓
            Cancelled
```

All state transitions are persisted and auditable.

### 3.5 Search & Reporting

| ID | Requirement | Priority |
|----|-------------|----------|
| F-20 | Dealer Admins can search appointments by customer name, VIN, or service type | P1 |
| F-21 | Dealer Admins can view daily and weekly schedule summaries | P1 |
| F-22 | The dashboard surfaces utilization metrics: bay occupancy, technician workload, booking volume | P2 |

---

## 4. Non-Functional Requirements

### 4.1 Performance

| Metric | Target |
|--------|--------|
| Availability check response time | p95 ≤ 300ms |
| End-to-end booking confirmation latency | p99 ≤ 2 seconds |
| API Gateway throughput | ≥ 1,000 requests/second sustained |
| System uptime | ≥ 99.9% monthly |

### 4.2 Consistency & Correctness

- No two confirmed appointments may share the same technician or service bay for overlapping time windows.
- Database-level composite unique indexes on `(technician_id, scheduled_start)` and `(service_bay_id, scheduled_start)` enforce this as a last line of defense.
- All booking-critical operations use ACID transactions.

### 4.3 Security

- All API traffic is TLS-terminated at the gateway.
- Authentication via JWT; OAuth 2.0 for third-party integrations.
- Role-based access control (RBAC): Customer, Technician, Dealer Admin, Super Admin.
- IP-based rate limiting enforced at the gateway.

### 4.4 Scalability

- Horizontal pod autoscaling for all application services.
- Stateless services to support scale-out without session affinity.
- Redis caching layer to absorb read-heavy availability queries.

### 4.5 Observability

- All services must emit structured JSON logs with a correlation/trace ID.
- Prometheus metrics exposed per service; Grafana dashboards for real-time visibility.
- Distributed tracing via OpenTelemetry + Jaeger across all service calls.
- PagerDuty alerting for P1/P2 SLO breaches.

---

## 5. System Architecture Summary

The system follows a **microservices architecture** organized into five tiers:

### Client Tier
- **Web App** (React SPA) — primary customer booking interface
- **Mobile App** (React Native) — cross-platform with push notification support
- **Dealer Portal** — admin dashboard for dealership staff
- **Third-Party API** — REST endpoints and webhook callbacks for external systems

### API Gateway
- Kong/Nginx for routing, rate limiting, and TLS termination
- Auth Service for JWT issuance and OAuth 2.0
- Load Balancer with health-check-aware round-robin distribution

### Application Services

| Service | Responsibility |
|---------|---------------|
| **Appointment Service** | CRUD orchestrator; drives the booking state machine |
| **Availability Engine** | Queries and filters available (technician, bay) pairs for a given time window |
| **Scheduling Optimizer** | Manages Redis distributed locks for concurrency-safe reservations |
| **Notification Service** | Dispatches email, SMS, and push notifications from async queue events |
| **Resource Management Service** | Maintains reference data for bays, technicians, service types, and dealerships |

### Data Tier

| Store | Purpose |
|-------|---------|
| **PostgreSQL 16** | Primary transactional store; ACID guarantees for appointment records |
| **Redis 7** | Availability cache, distributed locks (Redlock), TTL-based tentative holds |
| **Elasticsearch 8** | Full-text appointment search and dashboard analytics |
| **Object Store (S3/MinIO)** | Service reports, inspection images, audit log archives |

### Observability Layer
Prometheus · Grafana · Jaeger · ELK Stack · PagerDuty

---

## 6. Data Model (Core Entities)

| Entity | Key Attributes | Relationships |
|--------|---------------|---------------|
| **Dealership** | id, name, address, timezone, operating_hours | Has many ServiceBays, Technicians |
| **ServiceBay** | id, dealership_id, bay_number, bay_type, status | Belongs to Dealership |
| **Technician** | id, dealership_id, name, certifications[], shift_schedule | Belongs to Dealership |
| **ServiceType** | id, name, estimated_duration_min, required_bay_type, required_certifications[] | Referenced by Appointment |
| **Customer** | id, name, email, phone, notification_prefs | Has many Vehicles, Appointments |
| **Vehicle** | id, customer_id, vin, make, model, year | Belongs to Customer |
| **Appointment** | id, customer_id, vehicle_id, technician_id, service_bay_id, service_type_id, scheduled_start, scheduled_end, status, created_at | Central join entity |

The **Appointment** entity is the system of record, linking all domain entities in a single confirmed record.

---

## 7. Key User Flows

### 7.1 Customer Books an Appointment

1. Customer opens Web App or Mobile App
2. Searches for a dealership by location
3. Selects vehicle, service type, and preferred date/time
4. System queries Availability Engine → returns ranked (technician, bay) pairs
5. System places a 30-second distributed lock on the selected combination
6. Customer reviews summary and confirms
7. Appointment record is written to PostgreSQL; cache invalidated
8. Confirmation email and SMS dispatched via Notification Service

### 7.2 Conflict Resolution (Concurrent Booking)

1. User A and User B simultaneously select the same slot
2. User A's lock request succeeds first; User B's lock request fails
3. User B is immediately shown the next best available slot
4. If User A abandons, the lock expires after 30 seconds and the slot is released

### 7.3 Admin Overrides a Booking

1. Dealer Admin logs into the Dealer Portal
2. Locates appointment by customer name, VIN, or date
3. Reschedules or cancels the appointment
4. System updates appointment status in PostgreSQL
5. Notification Service dispatches rescheduled/cancelled notifications

---

## 8. Technology Stack

| Category | Technology | Rationale |
|----------|-----------|-----------|
| Backend Framework | Node.js (NestJS) | TypeScript-first, modular, built-in gRPC + REST support |
| Primary Database | PostgreSQL 16 | ACID transactions, JSONB, mature partitioning |
| Cache / Lock | Redis 7 | Sub-millisecond reads, Redlock, TTL-based key expiry |
| Message Queue | RabbitMQ 3.13 | Routing flexibility, dead-letter queues, low overhead |
| Search | Elasticsearch 8 | Full-text search, aggregation for analytics |
| API Gateway | Kong Gateway | Plugin-based, GitOps-friendly declarative config |
| Object Storage | AWS S3 / MinIO | Audit logs, inspection images, tiered lifecycle policies |
| Orchestration | Kubernetes (EKS) | HPA for seasonal traffic spikes, Helm-based deployments |
| CI/CD | GitHub Actions + ArgoCD | Integrated pipeline, progressive rollout |
| Frontend | React 19 + Vite | Fast HMR, code-splitting, shared logic with React Native |

---

## 9. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Redis lock contention during peak booking periods | Medium | High | Short TTL (30s), automatic fallback to next available slot |
| Cache inconsistency after resource changes | Medium | High | Resource Management Service emits events; Availability Engine invalidates cache on change |
| Database write failure after lock acquisition | Low | High | ACID transaction rollback; TTL ensures automatic lock release |
| Notification delivery failure (email/SMS) | Low | Medium | Dead-letter queues, retry logic, delivery status tracking |
| API abuse or scraping by third parties | Medium | Medium | Rate limiting, IP throttling, OAuth 2.0 for third-party access |
| Seasonal traffic spikes | High | Medium | Kubernetes HPA, Redis caching absorbs read load |

---

## 10. Open Questions

- [ ] Should customers be able to request a specific technician by name, or only by certification?
- [ ] What is the cancellation policy — how far in advance can a customer cancel without penalty?
- [ ] Do multi-location dealership groups need cross-location booking (customer books at any location in a chain)?
- [ ] Is there a waitlist feature needed for fully booked time slots?
- [ ] What is the data retention policy for completed and cancelled appointments?
- [ ] Are there regulatory or data-privacy requirements (e.g., GDPR, CCPA) that apply to customer and vehicle data?

---

## 11. Milestones & Phasing

### Phase 1 — Core Booking (MVP)
- Customer booking flow (web)
- Resource Management (bays, techs, service types)
- Real-time availability engine
- Distributed locking and conflict resolution
- Email/SMS confirmation notifications
- Dealer Portal (view schedules, manual overrides)

### Phase 2 — Mobile & Integrations
- React Native mobile app
- Third-party REST API + webhooks
- Appointment reminders
- Elasticsearch-powered search in Dealer Portal

### Phase 3 — Analytics & Optimization
- Dealer dashboard analytics (utilization, trends)
- Customer notification preferences
- Waitlist management
- Performance tuning and SLO hardening

---

*Document authored based on the Unified Service Scheduler System Design Document v1.0 (May 2026).*
