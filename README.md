# Distributed Ticket Booking System

A highly scalable, distributed ticket booking system demonstrating load balancing, fault tolerance, and strict database concurrency control.

## 🌟 Features

- **Concurrency Control:** Handles simultaneous booking requests using ACID-compliant MySQL transactions to prevent double-booking.
- **Load Balancing:** Nginx is configured as a Reverse Proxy to distribute incoming traffic across multiple backend servers using the Round-Robin algorithm.
- **Fault Tolerance:** Passive health monitoring by Nginx ensures that if one backend instance crashes, traffic is instantly routed to healthy instances, maintaining high availability.
- **Horizontal Scaling:** The backend is stateless, allowing seamless addition of new server instances.

## 🏗️ Architecture

- **Frontend:** React.js (Provides a seamless, dynamic user interface)
- **Load Balancer:** Nginx (Listens on port 80 and actively manages traffic)
- **Backend Cluster:** 3 identical Python Flask server instances (Ports 5001, 5002, 5003)
- **Database:** MySQL (Transaction-safe schema)

## 🚀 Getting Started

### Prerequisites
- Node.js & npm
- Python 3.x
- MySQL
- Nginx

### Database Setup
Run the included SQL script to seed your MySQL database:
```bash
mysql -u root -p < ticket-booking-system/setup_db.sql
```

### Running the System
Automation scripts are provided for easy orchestration.

1. **Start the Backend Cluster:**
Double-click `start_servers.bat` inside the `ticket-booking-system` folder. This will automatically:
- Start Flask Instance 1 (Port 5001)
- Start Flask Instance 2 (Port 5002)
- Start Flask Instance 3 (Port 5003)
- Boot up the Nginx Load Balancer

2. **Start the Frontend:**
Navigate to `ticket-booking-frontend` and run:
```bash
npm install
npm start
```
The application will be running on `http://localhost:3000`.

### Stopping the System
Double-click `stop_servers.bat` to gracefully shut down the Flask instances and the Nginx load balancer.

## 🧪 Testing Concurrency 
Included in the backend is a `test_concurrency.py` script.
Run this script to simulate 4 simultaneous users trying to book the exact same seat at the exact same millisecond. The database transactions will successfully block 3 requests and allow only 1, proving the system's concurrency safety!
