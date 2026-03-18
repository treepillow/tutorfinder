# Booking Process Service — OutSystems Implementation Guide

This service is the **complex composite orchestrator** for TutorFinder's booking lifecycle. It is implemented in **OutSystems** (low-code platform) and coordinates multiple microservices to deliver end-to-end booking workflows.

---

## Why OutSystems?

OutSystems is used here because it handles the most intricate orchestration in the system:

- Multi-step workflow with conditional branching (confirm / reject / expire)
- **Timers** for 24-hour booking and payment timeouts
- REST API consumption (calling 5+ services) and REST API exposure (for frontend)
- Database entities for process state tracking
- Built-in retry and error handling

---

## What This Service Orchestrates

```
Tutee selects slot
       │
       ▼
[Reserve slot in Availability Service]
[Create booking in Booking Service]
[Notify tutor via Notification Service]
       │
       ▼  (Tutor action within 24h)
   ┌───┴───┐
Confirm    Reject
   │          │
   │    [Unreserve slot]
   │    [Cancel booking]
   │    [Notify tutee]
   │
[Notify tutee — awaiting payment]
[Create PaymentIntent via Payment Service]
       │
       ▼  (Tutee pays within 24h)
   ┌───┴───┐
 Paid    Not paid
   │          │
   │    [Capture void / cancel booking]
   │    [Unreserve slot]
   │    [Notify tutee]
   │
[Capture payment]
[Mark booking Confirmed]
[Update availability to Unavailable]
       │
       ▼  (After lesson date)
[Tutor marks lesson Complete]
[Release deposit to Tutor via Payment Service]
[Notify tutor deposit released]
```

---

## OutSystems Entities (Database Tables)

### BookingProcess
| Attribute          | Type    | Notes                              |
|--------------------|---------|------------------------------------|
| BookingProcessId   | Integer | Auto-number PK                     |
| BookingId          | Integer | FK → Booking Service               |
| TuteeId            | Integer |                                    |
| TutorId            | Integer |                                    |
| AvailabilityId     | Integer |                                    |
| PaymentId          | Long    | FK → Payment Service               |
| StripeIntentId     | Text    |                                    |
| ClientSecret       | Text    | Returned to frontend for Stripe    |
| ProcessStatus      | Text    | `AwaitingConfirmation`, `AwaitingPayment`, `Confirmed`, `Completed`, `Cancelled` |
| CreatedOn          | DateTime|                                    |
| LastUpdatedOn      | DateTime|                                    |

---

## REST APIs Consumed (Integrate → REST)

| Service              | Base URL                          | Port  |
|----------------------|-----------------------------------|-------|
| Availability Service | `http://availability-service`     | 5003  |
| Booking Service      | `http://booking-service`          | 5004  |
| Payment Service      | `http://payment-service`          | 8080  |
| Notification Service | `http://notification-service`     | 5007  |
| Profile Service      | `http://profile-service`          | 5001  |

### Methods to integrate:

**Availability Service**
- `PUT /availability/{availability_id}` — body `{"status": "Reserved" | "Available" | "Unavailable"}`

**Booking Service**
- `POST /booking` — create booking
- `PUT /booking/{id}/confirm` — confirm booking
- `PUT /booking/{id}/reject` — reject booking
- `PUT /booking/{id}/cancel` — cancel booking
- `PUT /booking/{id}/complete` — complete booking
- `GET /booking/expired?type=confirmation` — find stale confirmation bookings
- `GET /booking/expired?type=payment` — find stale payment bookings

**Payment Service**
- `POST /payment/create-intent` — create Stripe PaymentIntent
- `POST /payment/capture` — capture held payment
- `POST /payment/{paymentId}/release` — release to tutor
- `POST /payment/{paymentId}/refund` — refund to tutee

**Notification Service**
- `POST /notify/send` — body `{"user_id", "type", "message", "phone_number"}`

**Profile Service**
- `GET /profile/internal/{user_id}` — fetch name and phone (no auth required)

---

## REST APIs Exposed (Logic → Expose REST API)

Base path: `/booking-process`

### POST `/booking-process/initiate`
Initiate booking (called by frontend after tutee selects a slot).

**Request body:**
```json
{
  "tutee_id": 1,
  "tutor_id": 2,
  "availability_id": 5,
  "lesson_date": "2025-05-01",
  "start_time": "10:00:00",
  "end_time": "11:00:00",
  "amount": "50.00"
}
```

**Response:**
```json
{
  "booking_process_id": 1,
  "booking_id": 10,
  "status": "AwaitingConfirmation"
}
```

**Server Actions triggered:**
1. `PUT /availability/{availability_id}` → status = `Reserved`
2. `POST /booking` → create booking record
3. `GET /profile/internal/{tutor_id}` → fetch tutor phone
4. `POST /notify/send` → SMS to tutor: "New booking request…"
5. Save BookingProcess entity

---

### POST `/booking-process/confirm`
Tutor confirms the booking.

**Request body:**
```json
{ "booking_id": 10 }
```

**Server Actions triggered:**
1. `PUT /booking/{id}/confirm` → status = `AwaitingPayment`
2. `GET /profile/internal/{tutee_id}` → fetch tutee phone
3. `POST /payment/create-intent` → create Stripe PaymentIntent
4. `POST /notify/send` → SMS to tutee: "Booking confirmed! Please pay deposit…"
5. Update BookingProcess entity (status = `AwaitingPayment`, store ClientSecret)

**Response:**
```json
{
  "booking_id": 10,
  "client_secret": "pi_xxx_secret_yyy",
  "status": "AwaitingPayment"
}
```

---

### POST `/booking-process/reject`
Tutor rejects the booking.

**Request body:**
```json
{ "booking_id": 10 }
```

**Server Actions triggered:**
1. `PUT /booking/{id}/reject` → status = `Cancelled`
2. `PUT /availability/{availability_id}` → status = `Available`
3. `GET /profile/internal/{tutee_id}` → fetch tutee phone
4. `POST /notify/send` → SMS to tutee: "Booking rejected…"
5. Update BookingProcess entity (status = `Cancelled`)

---

### POST `/booking-process/payment-captured`
Called by the frontend (via webhook or direct call) after Stripe payment is confirmed on client.

**Request body:**
```json
{
  "booking_id": 10,
  "stripe_payment_intent_id": "pi_xxx"
}
```

**Server Actions triggered:**
1. `POST /payment/capture` → capture payment, status = `HELD`
2. `PUT /booking/{id}/status` → status = `Confirmed`
3. `PUT /availability/{availability_id}` → status = `Unavailable`
4. `GET /profile/internal/{tutee_id}` → fetch tutee phone
5. `POST /notify/send` → SMS to tutee: "Payment received! Lesson confirmed."
6. Update BookingProcess entity (status = `Confirmed`)

---

### POST `/booking-process/complete`
Tutor marks lesson as completed.

**Request body:**
```json
{ "booking_id": 10 }
```

**Server Actions triggered:**
1. `PUT /booking/{id}/complete` → status = `Completed`
2. `GET /profile/internal/{tutor_id}` → fetch tutor phone
3. `POST /payment/{paymentId}/release` → release to tutor
4. Update BookingProcess entity (status = `Completed`)

---

### POST `/booking-process/cancel`
Cancel a confirmed booking (tutee or tutor initiated).

**Request body:**
```json
{
  "booking_id": 10,
  "initiated_by": "tutee"
}
```

**Server Actions triggered:**
1. `PUT /booking/{id}/cancel`
2. `PUT /availability/{availability_id}` → status = `Available`
3. If payment status = `HELD`: `POST /payment/{paymentId}/refund`
4. `POST /notify/send` → SMS to both tutee and tutor
5. Update BookingProcess entity (status = `Cancelled`)

---

## Timers (Scheduled Tasks)

### Timer: `ExpireUnconfirmedBookings`
- **Schedule:** Every 1 hour
- **Logic:**
  1. `GET /booking/expired?type=confirmation` → list of bookings >24h without tutor confirmation
  2. For each booking:
     - `PUT /booking/{id}/cancel`
     - `PUT /availability/{availability_id}` → `Available`
     - `GET /profile/internal/{tutee_id}` → tutee phone
     - `POST /notify/send` → "Booking expired: tutor did not confirm in time."
     - Update BookingProcess entity (status = `Cancelled`)

### Timer: `ExpireUnpaidBookings`
- **Schedule:** Every 1 hour
- **Logic:**
  1. `GET /booking/expired?type=payment` → list of bookings >24h awaiting payment
  2. For each booking:
     - `PUT /booking/{id}/cancel`
     - `PUT /availability/{availability_id}` → `Available`
     - `GET /profile/internal/{tutee_id}` → tutee phone
     - `POST /notify/send` → "Booking cancelled: payment not received within 24 hours."
     - Update BookingProcess entity (status = `Cancelled`)

---

## OutSystems Setup Steps

1. **Create Application** in OutSystems Service Studio
   - Type: **Service** (not Reactive Web)
   - Name: `TutorFinder_BookingProcess`

2. **Add REST API Integrations** (Logic → Integrate with REST API)
   - Import each service URL with the methods listed above

3. **Create Entities** in the Data tab
   - Add `BookingProcess` entity with all attributes listed above

4. **Create Server Actions** for each flow (Initiate, Confirm, Reject, etc.)
   - Use Try-Catch for error handling around each REST call
   - Log errors to OutSystems built-in logging

5. **Create Expose REST API** (Logic → Expose REST API)
   - Add methods pointing to each Server Action

6. **Create Timers** (Processes → Timers)
   - `ExpireUnconfirmedBookings` — Schedule: `0 * * * *` (every hour)
   - `ExpireUnpaidBookings` — Schedule: `0 * * * *` (every hour)

7. **Deploy** to your OutSystems Personal Environment or on-prem server

---

## Environment Variables / Site Properties

Configure these in OutSystems as **Site Properties**:

| Property                   | Default Value                        |
|----------------------------|--------------------------------------|
| AvailabilityServiceBaseURL | `http://availability-service:5003`   |
| BookingServiceBaseURL      | `http://booking-service:5004`        |
| PaymentServiceBaseURL      | `http://payment-service:8080`        |
| NotificationServiceBaseURL | `http://notification-service:5007`   |
| ProfileServiceBaseURL      | `http://profile-service:5001`        |

> When running locally replace service names with `localhost` and the corresponding port.

---

## Error Handling Rules

- If **Availability Service** reservation fails → abort the entire initiate flow, return error to tutee
- If **Notification Service** fails → log the error but do **not** fail the main flow (best-effort SMS)
- If **Payment Service** fails → mark booking as `Cancelled`, unreserve slot, notify tutee
- All Timer failures should be retried on the next scheduled run (OutSystems handles this automatically)
