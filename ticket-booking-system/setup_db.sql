CREATE DATABASE IF NOT EXISTS ticket_booking;
USE ticket_booking;

DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS seats;
DROP TABLE IF EXISTS matches;

-- Create matches table (formerly trains)
CREATE TABLE matches (
    match_id INT AUTO_INCREMENT PRIMARY KEY,
    match_name VARCHAR(255) NOT NULL,
    venue VARCHAR(255) NOT NULL,
    match_date VARCHAR(255) NOT NULL
);

-- Insert sample matches
INSERT INTO matches (match_name, venue, match_date) VALUES 
('Sunrisers Hyderabad vs Chennai Super Kings', 'Rajiv Gandhi International Cricket Stadium, Hyderabad', 'April 5, 2026 - 19:30 IST'),
('Sunrisers Hyderabad vs Mumbai Indians', 'Rajiv Gandhi International Cricket Stadium, Hyderabad', 'April 10, 2026 - 19:30 IST'),
('Sunrisers Hyderabad vs Royal Challengers Bangalore', 'Rajiv Gandhi International Cricket Stadium, Hyderabad', 'April 18, 2026 - 19:30 IST');

-- Create seats table
CREATE TABLE seats (
    seat_id INT AUTO_INCREMENT PRIMARY KEY,
    match_id INT NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    booking_id INT,
    FOREIGN KEY (match_id) REFERENCES matches(match_id)
);

-- Insert 15 seats for each match
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

-- Create bookings table
CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    seat_id INT NOT NULL,
    match_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed',
    booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seat_id) REFERENCES seats(seat_id),
    FOREIGN KEY (match_id) REFERENCES matches(match_id)
);
