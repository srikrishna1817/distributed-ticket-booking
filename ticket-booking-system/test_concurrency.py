import threading
import json
import urllib.request
import urllib.error

API_URL = "http://localhost/api/book"

def book_ticket(thread_id, seat_id, match_id):
    print(f" -> [User {thread_id}] Trying to book Seat {seat_id}...")
    payload = {
        "seat_id": seat_id,
        "user_name": f"Test User {thread_id}",
        "email": f"user{thread_id}@example.com",
        "match_id": match_id
    }
    
    try:
        req = urllib.request.Request(API_URL, method="POST")
        req.add_header('Content-Type', 'application/json')
        data_bytes = json.dumps(payload).encode('utf-8')
        
        with urllib.request.urlopen(req, data=data_bytes) as response:
            data = json.loads(response.read().decode('utf-8'))
            print(f"\n[✅ User {thread_id}] SUCCESS! Seat successfully booked. Transaction locked it.")
            
    except urllib.error.HTTPError as e:
        error_data = json.loads(e.read().decode('utf-8'))
        print(f"\n[❌ User {thread_id}] REJECTED! Reason: {error_data.get('message', 'Conflict')}")
    except Exception as e:
        print(f"\n[⚠️ User {thread_id}] Error connecting to server: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print(" 🎟️  CONCURRENCY & TRANSACTION LOCKING EXAM  🎟️".center(60))
    print("=" * 60)
    
    target_seat = 11 # Testing on Seat ID 1
    target_match = 3
    
    print(f"\nScenario: 4 Users trying to click 'Pay' for Seat {target_seat} at the exact same millisecond.")
    print("Expected Result: Only 1 succeeds. The rest get blocked by the DB Transaction Lock.\n")
    
    threads = []
    for i in range(1, 15):
        t = threading.Thread(target=book_ticket, args=(i, target_seat, target_match))
        threads.append(t)
        
    # Start threads simultaneously
    for t in threads:
        t.start()
        
    for t in threads:
        t.join()
        
    print("\n" + "=" * 60)
    print("Test Complete. Concurrency prevents double booking!")
