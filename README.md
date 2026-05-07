# Distributed Ticket Booking System

A highly scalable, distributed ticket booking system demonstrating load balancing, fault tolerance, and strict database concurrency control.

## 🚀 Live Demo
- **Frontend (Vercel):** [https://distributed-ticket-booking.vercel.app](https://distributed-ticket-booking.vercel.app)
- **Backend API (Render):** [https://ticket-booking-backend-1vuk.onrender.com](https://ticket-booking-backend-1vuk.onrender.com)

## 🌟 Core Distributed Systems Features

- **Concurrency Control & ACID:** Handles simultaneous booking requests using PostgreSQL row-level locking (`SELECT FOR UPDATE`) to guarantee that two users cannot book the same seat, even down to the millisecond.
- **Load Balancing:** When running locally, Nginx acts as a reverse proxy to distribute incoming traffic across multiple backend servers using the Round-Robin algorithm.
- **Fault Tolerance:** Nginx health monitoring ensures that if one backend instance crashes, traffic is instantly routed to healthy instances, maintaining high availability.
- **Shared State Architecture:** The backend servers are completely stateless. All persistent state is centralized in the PostgreSQL database, allowing seamless horizontal scaling.
- **Multi-Seat Atomic Booking:** Booking multiple seats triggers atomic transactions across multiple rows, ensuring no partial bookings occur.

## 🏗️ Architecture Stack

- **Frontend:** React.js, CSS Variables, Axios (Deployed on Vercel)
- **Backend:** Python 3, Flask, Psycopg3, Gunicorn (Deployed on Render)
- **Database:** PostgreSQL (Hosted on Render)
- **Local Load Balancer:** Nginx (Listens on port 80 and manages traffic to local Flask instances)

## 🚀 Running Locally (Demonstrating Load Balancing & Fault Tolerance)

### Prerequisites
- Node.js & npm
- Python 3.10+
- Nginx (installed locally for load balancing demo)

### 1. Database Setup
The system is configured to connect to the cloud PostgreSQL database by default, so no local database setup is required.

### 2. Start the Backend Cluster
Navigate to the `ticket-booking-system` folder and double-click `start_servers.bat` (Windows). This automates the orchestration:
- Starts Flask Instance 1 (Port 5001)
- Starts Flask Instance 2 (Port 5002)
- Starts Flask Instance 3 (Port 5003)
- Boots up the Nginx Load Balancer (Port 80)

### 3. Run the Demonstration Script
Open a new terminal and run the provided Python script to visualize load balancing and fault tolerance:
```bash
cd ticket-booking-system
python demo_load_balancing.py
```
This script proves:
1. **Load Balancing:** Requests are distributed round-robin across ports 5001, 5002, 5003.
2. **Shared State:** Data read from any instance is identical.
3. **Fault Tolerance:** If you manually kill one of the Flask console windows, Nginx seamlessly routes traffic to the surviving instances.

### 4. Start the Frontend (Optional for Local Backend)
Navigate to `ticket-booking-frontend` and run:
```bash
npm install
npm start
```
*Note: To connect the local frontend to the local backend cluster, temporarily revert the `API_URL` in the React components back to `http://localhost:80/api`.*

### Stopping the System
Double-click `stop_servers.bat` to gracefully shut down the local Flask instances and the Nginx load balancer.
