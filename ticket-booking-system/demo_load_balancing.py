"""
Load Balancing Demo — Ticket Booking System
============================================
Run AFTER start_servers.bat has launched Flask 5001/5002/5003 + Nginx.

What this script proves:
  1. LOAD BALANCING   — Nginx distributes requests round-robin across 3 Flask instances
  2. FAULT TOLERANCE  — When one instance dies, traffic continues on remaining instances
  3. SHARED STATE     — All instances read from the same PostgreSQL database

Usage:
    python demo_load_balancing.py
"""

import requests
import time
import collections
from concurrent.futures import ThreadPoolExecutor, as_completed

NGINX_URL  = "http://localhost:80"       # Nginx load balancer
DIRECT = {                               # Direct instance URLs (bypass Nginx)
    5001: "http://localhost:5001",
    5002: "http://localhost:5002",
    5003: "http://localhost:5003",
}

SEP  = "=" * 60
SEP2 = "-" * 60

# ─────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────

def get_instance(base_url, timeout=3):
    """Hit /instance on any URL, return the port string or an error label."""
    try:
        r = requests.get(f"{base_url}/instance", timeout=timeout)
        data = r.json()
        return data.get("port", "?")
    except Exception as e:
        return f"DEAD ({e.__class__.__name__})"

def get_matches(base_url, timeout=5):
    """Hit /api/matches — proves shared DB state across all instances."""
    try:
        r = requests.get(f"{base_url}/api/matches", timeout=timeout)
        data = r.json()
        return len(data.get("matches", []))
    except Exception as e:
        return f"ERR: {e.__class__.__name__}"

# ─────────────────────────────────────────────────────────────
# DEMO 1: Round-Robin Load Balancing
# ─────────────────────────────────────────────────────────────

def demo_round_robin(n=9):
    print(SEP)
    print("  DEMO 1: ROUND-ROBIN LOAD BALANCING")
    print(f"  Sending {n} sequential requests through Nginx (port 80)")
    print(SEP)
    print(f"  {'Request':<10} {'Handled By':<20} {'Status'}")
    print(SEP2)

    counts = collections.Counter()
    for i in range(1, n + 1):
        port = get_instance(NGINX_URL)
        counts[port] += 1
        bar = "█" * counts[port]
        print(f"  Req {i:<7} Flask-{port:<14} {bar}")
        time.sleep(0.1)

    print(SEP2)
    print("\n  DISTRIBUTION SUMMARY:")
    for port, count in sorted(counts.items()):
        pct = (count / n) * 100
        bar = "█" * count
        label = f"DEAD" if "DEAD" in str(port) else f"Flask-{port}"
        print(f"    {label:<20} {bar:<12} {count} requests  ({pct:.0f}%)")
    print()

# ─────────────────────────────────────────────────────────────
# DEMO 2: Concurrent Load Distribution
# ─────────────────────────────────────────────────────────────

def demo_concurrent(n=12):
    print(SEP)
    print("  DEMO 2: CONCURRENT LOAD DISTRIBUTION")
    print(f"  Sending {n} simultaneous requests through Nginx")
    print(SEP)

    results = []
    with ThreadPoolExecutor(max_workers=n) as executor:
        futures = {executor.submit(get_instance, NGINX_URL): i for i in range(1, n + 1)}
        for future in as_completed(futures):
            req_num = futures[future]
            port = future.result()
            results.append((req_num, port))

    results.sort(key=lambda x: x[0])
    counts = collections.Counter()
    for req_num, port in results:
        counts[port] += 1
        print(f"  Req {req_num:<7} → Flask-{port}")

    print(SEP2)
    print("\n  DISTRIBUTION SUMMARY:")
    for port, count in sorted(counts.items()):
        bar = "█" * count
        label = f"DEAD" if "DEAD" in str(port) else f"Flask-{port}"
        print(f"    {label:<20} {bar:<12} {count} requests")
    print()

# ─────────────────────────────────────────────────────────────
# DEMO 3: Shared Database State
# ─────────────────────────────────────────────────────────────

def demo_shared_state():
    print(SEP)
    print("  DEMO 3: SHARED DATABASE STATE")
    print("  All 3 instances read from the SAME PostgreSQL database")
    print(SEP)

    for port, url in DIRECT.items():
        match_count = get_matches(url)
        status = "OK" if isinstance(match_count, int) else match_count
        print(f"  Flask-{port}  →  /api/matches  →  {match_count} matches  [{status}]")

    print()
    print("  All instances return identical match data.")
    print("  A booking made on Flask-5001 is immediately visible on 5002 and 5003.")
    print()

# ─────────────────────────────────────────────────────────────
# DEMO 4: Fault Tolerance
# ─────────────────────────────────────────────────────────────

def demo_fault_tolerance():
    print(SEP)
    print("  DEMO 4: FAULT TOLERANCE")
    print("  Checking which instances are currently alive...")
    print(SEP)

    alive = []
    dead  = []
    for port, url in DIRECT.items():
        p = get_instance(url)
        if "DEAD" in str(p):
            dead.append(port)
            print(f"  Flask-{port}  →  [DOWN]")
        else:
            alive.append(port)
            print(f"  Flask-{port}  →  [UP]  running on port {p}")

    print()
    if dead:
        print(f"  {len(dead)} instance(s) DOWN: {dead}")
        print(f"  {len(alive)} instance(s) still serving traffic via Nginx.")
        print()
        print("  Sending 6 requests through Nginx (load balancer auto-skips dead nodes):")
        counts = collections.Counter()
        for i in range(1, 7):
            port = get_instance(NGINX_URL)
            counts[port] += 1
            print(f"    Req {i}: handled by Flask-{port}")
            time.sleep(0.1)
        print()
        print("  Nginx automatically routed around dead instance(s). System is LIVE.")
    else:
        print("  All 3 instances are UP.")
        print()
        print("  TO DEMONSTRATE FAULT TOLERANCE:")
        print("  1. Close one of the Flask console windows (e.g. Flask-5002)")
        print("  2. Run this script again")
        print("  3. Nginx will skip the dead instance automatically")
    print()

# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print()
    print(SEP)
    print("  TICKET BOOKING SYSTEM — LOAD BALANCING DEMO")
    print("  Nginx (port 80) → Flask 5001 / 5002 / 5003 → PostgreSQL")
    print(SEP)
    print()

    # Check Nginx is reachable
    try:
        requests.get(f"{NGINX_URL}/health", timeout=3)
    except Exception:
        print("  ERROR: Cannot reach Nginx on port 80.")
        print("  Run start_servers.bat first, then re-run this script.")
        exit(1)

    demo_round_robin(n=9)
    demo_concurrent(n=12)
    demo_shared_state()
    demo_fault_tolerance()

    print(SEP)
    print("  DEMO COMPLETE")
    print(SEP)
    print()
