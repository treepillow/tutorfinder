-- TutorFinder – Supabase Schema Initialisation
-- Run this once in the Supabase SQL Editor to create the schemas.
-- Each service manages its own tables via ORM (db.create_all / ddl-auto=update).

CREATE SCHEMA IF NOT EXISTS profile_schema;
CREATE SCHEMA IF NOT EXISTS match_schema;
CREATE SCHEMA IF NOT EXISTS availability_schema;
CREATE SCHEMA IF NOT EXISTS booking_schema;
CREATE SCHEMA IF NOT EXISTS payment_schema;
CREATE SCHEMA IF NOT EXISTS notification_schema;
