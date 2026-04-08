# TutorFinder

A microservices-based tutor-matching platform built for SMU IS213 Enterprise Solution Development.

## Prerequisites

- Deployed Website Link: https://www.tutorfinder.world/
- Docker and Docker Compose installed
- A Supabase account with a PostgreSQL database

## Setup

1. Clone the repository
2. Copy the environment file and fill in your credentials:
   ```
   cp .env.example .env
   ```
3. Edit `.env` with your Supabase credentials (required) and optional Stripe/Resend keys

## Running Locally

```bash
docker-compose up --build
```

This starts the following services:
| Service | Port |
|---|---|
| RabbitMQ Management UI | http://localhost:15672 (guest/guest) |
| Profile Service | http://localhost:5001 |
| Match Service | http://localhost:5002 |
| Availability Service | http://localhost:5003 |
| Booking Service | http://localhost:5004 |
| Payment Service | http://localhost:8080 |
| Notification Service | http://localhost:5007 |

## Frontend

The frontend is a Vite/React app. To run it locally:

```bash
cd frontend
npm install
npm run dev
```

Configure `frontend/.env` based on `frontend/.env.example` to point to the local service ports.

## OutSystems Services

Two services run on OutSystems (cloud-hosted, no local setup needed):
- **BookingProcessLogic** — orchestrator for the booking workflow
- **ReviewService** — atomic service for tutor reviews and ratings

## Architecture

- **HTTP communication**: Frontend → Services, OutSystems → Services
- **Message-based (AMQP/RabbitMQ)**: Booking/Payment events → Notification Service
- **External services**: Stripe (payments), Resend (email notifications)
