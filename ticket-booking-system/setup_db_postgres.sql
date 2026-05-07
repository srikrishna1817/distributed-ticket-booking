-- PostgreSQL schema for Ticket Booking System
-- Run this against your PostgreSQL database (ticket_booking) to initialize tables and seed data.
-- Usage: psql -U postgres -d ticket_booking -f setup_db_postgres.sql

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS seats    CASCADE;
DROP TABLE IF EXISTS matches  CASCADE;
DROP TABLE IF EXISTS users    CASCADE;

-- ─── Users ───────────────────────────────────────────────────────────────────
CREATE TABLE users (
    user_id       SERIAL PRIMARY KEY,
    full_name     VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Matches ──────────────────────────────────────────────────────────────────
CREATE TABLE matches (
    match_id   SERIAL PRIMARY KEY,
    match_name VARCHAR(255) NOT NULL,
    venue      VARCHAR(255) NOT NULL,
    match_date VARCHAR(255) NOT NULL
);

-- Sample matches
INSERT INTO matches (match_name, venue, match_date) VALUES
('Sunrisers Hyderabad vs Chennai Super Kings',          'Rajiv Gandhi International Cricket Stadium, Hyderabad', 'April 5, 2026 - 19:30 IST'),
('Sunrisers Hyderabad vs Mumbai Indians',               'Rajiv Gandhi International Cricket Stadium, Hyderabad', 'April 10, 2026 - 19:30 IST'),
('Sunrisers Hyderabad vs Royal Challengers Bangalore',  'Rajiv Gandhi International Cricket Stadium, Hyderabad', 'April 18, 2026 - 19:30 IST');

-- ─── Seats ────────────────────────────────────────────────────────────────────
CREATE TABLE seats (
    seat_id     SERIAL PRIMARY KEY,
    match_id    INT     NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    is_booked   BOOLEAN DEFAULT FALSE,
    booking_id  INT,
    FOREIGN KEY (match_id) REFERENCES matches(match_id)
);

-- 15 seats per match (rows A–C, columns 1–5)
INSERT INTO seats (match_id, seat_number, is_booked) VALUES
(1, 'A1', FALSE), (1, 'A2', FALSE), (1, 'A3', FALSE), (1, 'A4', FALSE), (1, 'A5', FALSE),
(1, 'B1', FALSE), (1, 'B2', FALSE), (1, 'B3', FALSE), (1, 'B4', FALSE), (1, 'B5', FALSE),
(1, 'C1', FALSE), (1, 'C2', FALSE), (1, 'C3', FALSE), (1, 'C4', FALSE), (1, 'C5', FALSE),

(2, 'A1', FALSE), (2, 'A2', FALSE), (2, 'A3', FALSE), (2, 'A4', FALSE), (2, 'A5', FALSE),
(2, 'B1', FALSE), (2, 'B2', FALSE), (2, 'B3', FALSE), (2, 'B4', FALSE), (2, 'B5', FALSE),
(2, 'C1', FALSE), (2, 'C2', FALSE), (2, 'C3', FALSE), (2, 'C4', FALSE), (2, 'C5', FALSE),

(3, 'A1', FALSE), (3, 'A2', FALSE), (3, 'A3', FALSE), (3, 'A4', FALSE), (3, 'A5', FALSE),
(3, 'B1', FALSE), (3, 'B2', FALSE), (3, 'B3', FALSE), (3, 'B4', FALSE), (3, 'B5', FALSE),
(3, 'C1', FALSE), (3, 'C2', FALSE), (3, 'C3', FALSE), (3, 'C4', FALSE), (3, 'C5', FALSE);

-- ─── Bookings ─────────────────────────────────────────────────────────────────
CREATE TABLE bookings (
    booking_id   SERIAL PRIMARY KEY,
    user_name    VARCHAR(255) NOT NULL,
    email        VARCHAR(255) NOT NULL,
    seat_id      INT NOT NULL,
    match_id     INT NOT NULL,
    status       VARCHAR(50) DEFAULT 'confirmed',
    booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seat_id)  REFERENCES seats(seat_id),
    FOREIGN KEY (match_id) REFERENCES matches(match_id)
);
