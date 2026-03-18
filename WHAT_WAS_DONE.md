# TutorFinder — What Was Built

## Project Overview

TutorFinder is a tutor-student matching platform built as a microservices system for the ESD (Enterprise Systems Design) module. Tutees discover tutors, match with them, book lessons, pay a deposit, and receive SMS notifications at every step.

---

## Architecture

```
                        ┌─────────────────┐
                        │  Frontend / App  │
                        └────────┬────────┘
                                 │ REST
          ┌──────────────────────┼───────────────────────┐
          ▼                      ▼                       ▼
  ┌───────────────┐    ┌──────────────────┐    ┌────────────────┐
  │ Profile Svc   │    │ Match Service    │    │Availability Svc│
  │ (Flask :5001) │    │ (Flask :5002)    │    │ (Flask :5003)  │
  └───────────────┘    └────────┬─────────┘    └────────────────┘
                                │ RabbitMQ
                                │ match.created
          ┌─────────────────────┼────────────────────────┐
          ▼                     ▼                        ▼
  ┌───────────────┐   ┌──────────────────┐    ┌──────────────────────┐
  │ Booking Svc   │   │ Payment Service  │    │ Notification Service  │
  │ (Flask :5004) │   │ (Java/Spring:8080│    │ (Flask :5007)         │
  └───────────────┘   └──────────────────┘    └──────────────────────┘
          ▲                     ▲
          │    REST calls        │
          └────────┬────────────┘
                   │
        ┌──────────────────────┐
        │  Booking Process Svc  │
        │  (OutSystems — complex│
        │   composite orchestr.)│
        └──────────────────────┘
```

---

## Services

### 1. Profile Service — `profile-service/` (Flask, port 5001)
Handles user registration, login (JWT), and profile management.

**Key features:**
- JWT authentication (HS256, 24-hour expiry)
- Tiered profile visibility: public data before matching, full data (phone + email) after
- Radius-based tutor search using the Haversine formula
- Calls Match Service to check match status before revealing personal details
- Enriches search results with tutor availability from Availability Service
- Internal endpoint `/profile/internal/<id>` for service-to-service calls (no auth)

**Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| POST | `/profile/register` | Register new user |
| POST | `/profile/login` | Login, returns JWT |
| GET  | `/profile/<id>` | Get profile (auth required) |
| GET  | `/profile/internal/<id>` | Internal fetch (no auth) |
| PUT  | `/profile/<id>` | Update own profile |
| POST | `/profile/search` | Search tutors/students by subject, price, radius |
| POST | `/profile/verify-token` | Validate a JWT |
| GET  | `/health` | Health check |

---

### 2. Match Service — `match-service/` (Flask, port 5002)
Tinder-style swipe system with mutual-like detection.

**Key features:**
- Two-table design: `swipes` + `matches` (required by professor)
- Unique constraint on `(swiper_id, swiped_id)` to prevent duplicate swipes
- On mutual like: creates a Match record, fetches phones from Profile Service, publishes `match.created` to RabbitMQ

**Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| POST | `/match/swipe` | Record a swipe (like/pass) |
| GET  | `/match/status?userA=&userB=` | Check if two users are matched |
| GET  | `/match/matches/<user_id>` | Get all matches for a user |
| PUT  | `/match/<match_id>/archive` | Archive a match |
| GET  | `/health` | Health check |

---

### 3. Availability Service — `availability-service/` (Flask, port 5003)
Tutors post their available time slots; tutees browse them before booking.

**Key features:**
- Slot status lifecycle: `Available` → `Reserved` (held during booking process) → `Unavailable` (lesson confirmed)
- Reserved slots are released back to `Available` if booking is rejected or expires

**Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| POST   | `/availability` | Add a new time slot |
| GET    | `/availability/<user_id>` | Get all slots for a tutor |
| GET    | `/availability/slot/<id>` | Get a specific slot |
| POST   | `/availability/check` | Check if a slot is available |
| PUT    | `/availability/<id>` | Update slot status |
| DELETE | `/availability/<id>` | Delete an available slot |
| GET    | `/health` | Health check |

---

### 4. Booking Service — `booking-service/` (Flask, port 5004)
Stores and manages booking records.

**Key features:**
- Booking status lifecycle: `AwaitingConfirmation` → `AwaitingPayment` → `Confirmed` → `Completed` (also `Cancelled`, `Disputed`)
- `confirmed_at` timestamp for 24-hour payment timeout tracking
- `/booking/expired` endpoint used by OutSystems Timers to find stale bookings

**Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| POST | `/booking` | Create booking |
| GET  | `/booking/<id>` | Get booking |
| GET  | `/booking/user/<id>` | Get bookings for a user |
| PUT  | `/booking/<id>/confirm` | Tutor confirms |
| PUT  | `/booking/<id>/reject` | Tutor rejects |
| PUT  | `/booking/<id>/cancel` | Cancel booking |
| PUT  | `/booking/<id>/complete` | Mark lesson complete |
| PUT  | `/booking/<id>/dispute` | Raise a dispute |
| PUT  | `/booking/<id>/status` | Generic status update |
| GET  | `/booking/expired?type=confirmation\|payment` | Find expired bookings |
| GET  | `/health` | Health check |

---

### 5. Booking Process Service — `booking-process-service/` (OutSystems)
Complex composite orchestrator. See `booking-process-service/README.md` for full implementation guide.

**Handles:**
- Multi-step booking lifecycle coordination across 5 microservices
- `POST /booking-process/initiate` — tutee selects slot
- `POST /booking-process/confirm` — tutor confirms
- `POST /booking-process/reject` — tutor rejects
- `POST /booking-process/payment-captured` — payment confirmed
- `POST /booking-process/complete` — lesson complete
- `POST /booking-process/cancel` — cancellation with optional refund
- **Timer:** `ExpireUnconfirmedBookings` — runs hourly, cancels bookings with no tutor confirmation after 24h
- **Timer:** `ExpireUnpaidBookings` — runs hourly, cancels bookings with no payment after 24h

---

### 6. Payment Service — `payment-service/` (Java / Spring Boot, port 8080)
Manages Stripe escrow payments.

**Key features:**
- Stripe `PaymentIntent` with `capture_method=manual` — funds are authorised at checkout and only captured after confirmation
- `releaseToTutor` — Stripe Transfer to tutor's connected account after lesson complete
- `refundToTutee` — Stripe Refund if booking is cancelled post-payment
- Mock mode when `STRIPE_SECRET_KEY` is not set (logs to console)
- Publishes `payment.success`, `payment.failed`, `deposit.released`, `deposit.refunded` to RabbitMQ

**Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| POST | `/payment/create-intent` | Create Stripe PaymentIntent |
| POST | `/payment/capture` | Capture authorised payment |
| POST | `/payment/{id}/release` | Release deposit to tutor |
| POST | `/payment/{id}/refund` | Refund deposit to tutee |
| GET  | `/payment/booking/{bookingId}` | Get payment by booking |
| GET  | `/payment/{paymentId}` | Get payment by ID |
| GET  | `/health` | Health check |

---

### 7. Notification Service — `notification-service/` (Flask, port 5007)
Sends SMS notifications via Twilio and stores a log in MySQL.

**Key features:**
- Background RabbitMQ consumer thread listens to `#` (all routing keys) on `notification_queue`
- Twilio mock mode — when credentials are missing, SMS is printed to console
- Handles 10 event types automatically via RabbitMQ
- Also exposes `POST /notify/send` for direct calls from OutSystems

**RabbitMQ events handled:**
| Routing Key | Recipient | Message |
|-------------|-----------|---------|
| `match.created` | Both users | "You have a new match!" |
| `booking.created` | Tutor | "New booking request…" |
| `booking.confirmed` | Tutee | "Booking confirmed, please pay…" |
| `booking.rejected` | Tutee | "Booking rejected…" |
| `booking.expired` | Tutee | "Booking cancelled (expired)" |
| `booking.cancelled` | Both | "Booking cancelled" |
| `payment.success` | Tutee | "Payment received, lesson confirmed" |
| `payment.failed` | Tutee | "Payment failed, please retry" |
| `deposit.released` | Tutor | "Deposit released to your account" |
| `deposit.refunded` | Tutee | "Deposit refunded, allow 3-5 days" |

---

## Infrastructure

### RabbitMQ
- Exchange: `esd_exchange` (topic, durable)
- Notification queue: `notification_queue`, binding key `#`
- Payment queue: `payment_queue`, binding key `booking.confirmed`

### MySQL
- Single container, 6 databases: `profile_db`, `match_db`, `availability_db`, `booking_db`, `payment_db`, `notification_db`
- All schemas created automatically by ORM on first startup
- `init.sql` pre-creates all databases

### Docker Compose
- All services, MySQL, and RabbitMQ wired together on `tutorfinder_net`
- Healthchecks ensure MySQL and RabbitMQ are ready before services start
- Pass in optional secrets via environment variables:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_FROM_NUMBER`

---

## Running Locally

```bash
cd tutorfinder/

# Optional: set real API keys
export STRIPE_SECRET_KEY=sk_test_...
export TWILIO_ACCOUNT_SID=AC...
export TWILIO_AUTH_TOKEN=...
export TWILIO_FROM_NUMBER=+65...

# Build and start everything
docker compose up --build

# Check services
curl http://localhost:5001/health   # Profile
curl http://localhost:5002/health   # Match
curl http://localhost:5003/health   # Availability
curl http://localhost:5004/health   # Booking
curl http://localhost:8080/health   # Payment
curl http://localhost:5007/health   # Notification

# RabbitMQ Management UI
open http://localhost:15672   # guest / guest
```

---

## Quick API Walkthrough

```bash
# 1. Register a tutor
curl -X POST http://localhost:5001/profile/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@test.com","password":"pass123",
       "phone":"+6591234567","role":"Tutor","subject":"Math",
       "price_rate":50,"latitude":1.3521,"longitude":103.8198}'

# 2. Register a student
curl -X POST http://localhost:5001/profile/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob","email":"bob@test.com","password":"pass456",
       "phone":"+6598765432","role":"Student",
       "latitude":1.3500,"longitude":103.8200}'

# 3. Login as Bob
TOKEN=$(curl -s -X POST http://localhost:5001/profile/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@test.com","password":"pass456"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

# 4. Search for tutors
curl -X POST http://localhost:5001/profile/search \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"subject":"Math","radius":5}'

# 5. Swipe right on Alice (user_id=1)
curl -X POST http://localhost:5002/match/swipe \
  -H "Content-Type: application/json" \
  -d '{"swiper_id":2,"swiped_id":1,"is_like":true}'
```

---

## Team

| Name | Role |
|------|------|
| Aaron | Developer |
| Jia Hong | Developer |
| Sze Teng | Developer |
| Warren | Developer |
| Yu Bing | Developer |
